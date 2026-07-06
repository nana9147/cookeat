import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStr = todayStart.toISOString();

  const { data: todayOrders, error: todayOrdersError } = await supabaseAdmin
    .from('orders')
    .select('order_id, final_amount, status')
    .gte('created_at', todayStr);

  if (todayOrdersError) return NextResponse.json({ error: todayOrdersError.message }, { status: 500 });

  // 카테고리별 매출도 상단 매출(todayRevenue)과 동일하게 취소/환불 주문을 제외
  const todayOrderIds =
    todayOrders?.filter((o) => o.status !== '취소' && o.status !== '환불').map((o) => o.order_id) ?? [];

  const [
    orderCountResult,
    cancelCountResult,
    newMembersResult,
    newSellersResult,
    inquiryCountResult,
    popularProductsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr),

    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr)
      .in('status', ['취소', '환불']),

    supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr),

    supabaseAdmin
      .from('sellers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr),

    supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr),

    supabaseAdmin
      .from('products')
      .select('name, sales_count, price')
      .order('sales_count', { ascending: false })
      .limit(4),
  ]);

  const parallelErrors = [
    orderCountResult.error,
    cancelCountResult.error,
    newMembersResult.error,
    newSellersResult.error,
    inquiryCountResult.error,
    popularProductsResult.error,
  ].find(Boolean);

  if (parallelErrors) return NextResponse.json({ error: parallelErrors.message }, { status: 500 });

  const { data: categoryItems, error: categoryError } =
    todayOrderIds.length > 0
      ? await supabaseAdmin
          .from('order_items')
          .select('quantity, unit_price, products!inner(categories!inner(ingredients!parent_id!inner(category)))')
          .in('order_id', todayOrderIds)
      : {
          data: [] as {
            quantity: number;
            unit_price: number;
            products: { categories: { ingredients: { category: string }[] }[] }[];
          }[],
          error: null,
        };

  if (categoryError) return NextResponse.json({ error: categoryError.message }, { status: 500 });

  const todayRevenue =
    todayOrders
      ?.filter((o) => o.status !== '취소' && o.status !== '환불')
      .reduce((sum, o) => sum + (o.final_amount ?? 0), 0) ?? 0;

  const popularProducts = (popularProductsResult.data ?? []).map((p, i) => ({
    rank: i + 1,
    name: p.name,
    sub: `${p.sales_count}건 판매`,
    price: `${(p.sales_count * p.price).toLocaleString('ko-KR')}원`,
  }));

  type DashCatRow = {
    quantity: number;
    unit_price: number;
    products: { categories: { ingredients: { category: string }[] }[] }[];
  };
  const categoryMap = new Map<string, number>();
  let totalRevenue = 0;
  for (const item of (categoryItems as unknown as DashCatRow[]) ?? []) {
    const category = item.products?.[0]?.categories?.[0]?.ingredients?.[0]?.category ?? '기타';
    const revenue = (item.quantity ?? 0) * (item.unit_price ?? 0);
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + revenue);
    totalRevenue += revenue;
  }
  const categoryStats = [...categoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, revenue]) => ({
      name,
      percent: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
      revenue: `${revenue.toLocaleString('ko-KR')}원`,
    }));

  return NextResponse.json({
    statCards: {
      todayRevenue,
      orderCount: orderCountResult.count ?? 0,
      cancelCount: cancelCountResult.count ?? 0,
      newMembers: newMembersResult.count ?? 0,
      newSellers: newSellersResult.count ?? 0,
      inquiryCount: inquiryCountResult.count ?? 0,
    },
    popularProducts,
    categoryStats,
  });
}
