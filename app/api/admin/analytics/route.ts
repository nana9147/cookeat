import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1).toISOString();
  const end = new Date(year, month + 1, 1).toISOString();
  return { start, end };
}

function calcTrend(current: number, prev: number): number {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 1000) / 10;
}

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const current = getMonthRange(thisYear, thisMonth);
  const prev = getMonthRange(thisYear, thisMonth - 1);

  const [currentOrdersResult, prevOrdersResult, allOrdersResult, totalUsersResult] =
    await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('order_id, user_id, final_amount, status')
        .gte('created_at', current.start)
        .lt('created_at', current.end),

      supabaseAdmin
        .from('orders')
        .select('order_id, user_id, final_amount, status')
        .gte('created_at', prev.start)
        .lt('created_at', prev.end),

      supabaseAdmin.from('orders').select('user_id, status'),

      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

  const firstError = [
    currentOrdersResult.error,
    prevOrdersResult.error,
    allOrdersResult.error,
    totalUsersResult.error,
  ].find(Boolean);
  if (firstError) return NextResponse.json({ error: firstError.message }, { status: 500 });

  const CANCELLED = ['취소', '환불'];

  const currentOrders = currentOrdersResult.data ?? [];
  const prevOrders = prevOrdersResult.data ?? [];
  const allOrders = allOrdersResult.data ?? [];

  const currentValid = currentOrders.filter((o) => !CANCELLED.includes(o.status ?? ''));
  const prevValid = prevOrders.filter((o) => !CANCELLED.includes(o.status ?? ''));

  // GMV
  const currentGmv = currentValid.reduce((sum, o) => sum + (o.final_amount ?? 0), 0);
  const prevGmv = prevValid.reduce((sum, o) => sum + (o.final_amount ?? 0), 0);

  // MAU — 이번달 주문한 고유 유저 수
  const currentMauSet = new Set(currentValid.map((o) => o.user_id));
  const prevMauSet = new Set(prevValid.map((o) => o.user_id));
  const mau = currentMauSet.size;
  const prevMau = prevMauSet.size;

  // 전환율 — 이번달 주문 유저 / 전체 활성 유저
  const totalUsers = totalUsersResult.count ?? 1;
  const conversionRate = Math.round((mau / totalUsers) * 1000) / 10;
  const prevConversionRate = Math.round((prevMau / totalUsers) * 1000) / 10;

  // 재구매율 — 전체 기준 2회+ 주문 유저 / 1회+ 주문 유저
  const allValidOrders = allOrders.filter((o) => !CANCELLED.includes(o.status ?? ''));
  const userOrderCount = new Map<number, number>();
  for (const o of allValidOrders) {
    userOrderCount.set(o.user_id, (userOrderCount.get(o.user_id) ?? 0) + 1);
  }
  const usersWithAnyOrder = userOrderCount.size;
  const usersWithRepurchase = [...userOrderCount.values()].filter((c) => c >= 2).length;
  const repurchaseRate =
    usersWithAnyOrder > 0 ? Math.round((usersWithRepurchase / usersWithAnyOrder) * 1000) / 10 : 0;

  // 카테고리별 매출 & 판매자별 TOP 5
  const currentOrderIds = currentValid.map((o) => o.order_id);

  type CategoryRow = {
    quantity: number;
    unit_price: number;
    products: { categories: { ingredients: { category: string }[] } | null } | null;
  };
  type SellerRow = {
    quantity: number;
    unit_price: number;
    seller_id: number;
    sellers: { store_name: string }[] | null;
  };

  let categoryStats: { name: string; percent: number; revenue: string }[] = [];
  let sellerTopRevenue: { rank: number; name: string; sub: string; price: string }[] = [];

  if (currentOrderIds.length > 0) {
    const [categoryItemsResult, sellerItemsResult] = await Promise.all([
      supabaseAdmin
        .from('order_items')
        .select('quantity, unit_price, products!inner(categories!inner(ingredients!parent_id!inner(category)))')
        .in('order_id', currentOrderIds),
      supabaseAdmin
        .from('order_items')
        .select('quantity, unit_price, seller_id, sellers!inner(store_name)')
        .in('order_id', currentOrderIds),
    ]);

    if (!categoryItemsResult.error && categoryItemsResult.data) {
      const categoryMap = new Map<string, number>();
      let totalRevenue = 0;

      for (const row of (categoryItemsResult.data as unknown as CategoryRow[])) {
        const products = Array.isArray(row.products) ? row.products[0] : row.products;
        const categories = Array.isArray(products?.categories) ? products?.categories[0] : products?.categories;
        const ingredients = Array.isArray(categories?.ingredients) ? categories?.ingredients[0] : categories?.ingredients;
        const category = ingredients?.category ?? '기타';
        const revenue = (row.quantity ?? 0) * (row.unit_price ?? 0);
        categoryMap.set(category, (categoryMap.get(category) ?? 0) + revenue);
        totalRevenue += revenue;
      }

      categoryStats = [...categoryMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, revenue]) => ({
          name,
          percent: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
          revenue: `${revenue.toLocaleString('ko-KR')}원`,
        }));
    }

    if (!sellerItemsResult.error && sellerItemsResult.data) {
      const sellerMap = new Map<number, { storeName: string; revenue: number }>();

      for (const row of (sellerItemsResult.data as unknown as SellerRow[])) {
        const sellers = Array.isArray(row.sellers) ? row.sellers[0] : row.sellers;
        const storeName = (sellers as { store_name: string } | null)?.store_name ?? '알 수 없음';
        const revenue = (row.quantity ?? 0) * (row.unit_price ?? 0);
        const existing = sellerMap.get(row.seller_id);
        if (existing) {
          existing.revenue += revenue;
        } else {
          sellerMap.set(row.seller_id, { storeName, revenue });
        }
      }

      sellerTopRevenue = [...sellerMap.entries()]
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([, { storeName, revenue }], i) => ({
          rank: i + 1,
          name: storeName,
          sub: '',
          price: `${revenue.toLocaleString('ko-KR')}원`,
        }));
    }
  }

  return NextResponse.json({
    statCards: {
      gmv: currentGmv,
      gmvTrend: calcTrend(currentGmv, prevGmv),
      conversionRate,
      conversionRateTrend: calcTrend(conversionRate, prevConversionRate),
      repurchaseRate,
      mau,
      mauTrend: calcTrend(mau, prevMau),
    },
    sellerTopRevenue,
    categoryStats,
  });
}
