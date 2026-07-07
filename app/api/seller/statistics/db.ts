import { supabaseAdmin } from '@/lib/supabaseAdmin';

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function startOfDay(d: Date) {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(d: Date, days: number) {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

const EXCLUDED_STATUSES = ['취소', '환불'];
const CLAIM_STATUSES = ['취소', '환불'];

interface CustomerFirstOrderRow {
  user_id: number;
  first_order_at: string;
}

interface OrderItemRow {
  item_id: number;
  quantity: number;
  unit_price: number;
  shipping_status: string | null;
  product_id: number;
  products: {
    name: string;
    image: string | null;
    category_id: number | null;
  } | null;
  orders: {
    order_id: string;
    user_id: number;
    created_at: string;
  } | null;
}

export async function getSellerStatistics(sellerId: number, days: number) {
  const now = new Date();
  const periodStart = startOfDay(addDays(now, -days + 1));

  const { data: rows, error } = await supabaseAdmin
    .from('order_items')
    .select(
      `item_id, quantity, unit_price, shipping_status, product_id,
       products(name, image, category_id),
       orders!inner(order_id, user_id, created_at)`
    )
    .eq('seller_id', sellerId)
    .gte('orders.created_at', periodStart.toISOString())
    .returns<OrderItemRow[]>();

  if (error) throw error;

  const allRows = rows ?? [];
  const validRows = allRows.filter((r) => !EXCLUDED_STATUSES.includes(r.shipping_status ?? ''));

  const totalRevenue = validRows.reduce((sum, r) => sum + r.quantity * r.unit_price, 0);
  const totalQuantity = validRows.reduce((sum, r) => sum + r.quantity, 0);
  const distinctOrderIds = new Set(validRows.map((r) => r.orders?.order_id).filter(Boolean));
  const averageOrderValue =
    distinctOrderIds.size > 0 ? Math.round(totalRevenue / distinctOrderIds.size) : 0;
  const soldProductCount = new Set(validRows.map((r) => r.product_id)).size;

  const summary = { totalRevenue, totalQuantity, averageOrderValue, soldProductCount };

  const productMap = new Map<
    number,
    { name: string; image: string | null; revenue: number; quantity: number }
  >();
  for (const r of validRows) {
    const existing = productMap.get(r.product_id);
    const revenue = r.quantity * r.unit_price;
    if (existing) {
      existing.revenue += revenue;
      existing.quantity += r.quantity;
    } else {
      productMap.set(r.product_id, {
        name: r.products?.name ?? '알 수 없음',
        image: r.products?.image ?? null,
        revenue,
        quantity: r.quantity,
      });
    }
  }
  const productRanking = [...productMap.entries()]
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const categoryIds = [
    ...new Set(validRows.map((r) => r.products?.category_id).filter((id): id is number => !!id)),
  ];

  let categoryNameMap = new Map<number, string>();
  if (categoryIds.length > 0) {
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('category_id, name, parent_id')
      .in('category_id', categoryIds);
    if (catError) throw catError;

    const parentIds = [
      ...new Set((categories ?? []).map((c) => c.parent_id).filter((id): id is number => !!id)),
    ];
    const { data: parents, error: parentError } =
      parentIds.length > 0
        ? await supabaseAdmin
            .from('categories')
            .select('category_id, name')
            .in('category_id', parentIds)
        : { data: [], error: null };
    if (parentError) throw parentError;

    const parentNameMap = new Map((parents ?? []).map((p) => [p.category_id, p.name]));
    categoryNameMap = new Map(
      (categories ?? []).map((c) => [
        c.category_id,
        c.parent_id ? (parentNameMap.get(c.parent_id) ?? c.name) : c.name,
      ])
    );
  }

  const categoryRevenueMap = new Map<string, number>();
  for (const r of validRows) {
    const categoryName = r.products?.category_id
      ? (categoryNameMap.get(r.products.category_id) ?? '미분류')
      : '미분류';
    categoryRevenueMap.set(
      categoryName,
      (categoryRevenueMap.get(categoryName) ?? 0) + r.quantity * r.unit_price
    );
  }
  const categoryBreakdown = [...categoryRevenueMap.entries()]
    .map(([categoryName, revenue]) => ({
      categoryName,
      revenue,
      ratio: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const trendMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    trendMap.set(toDateStr(addDays(periodStart, i)), 0);
  }
  for (const r of validRows) {
    if (!r.orders?.created_at) continue;
    const dateStr = toDateStr(new Date(r.orders.created_at));
    if (trendMap.has(dateStr)) {
      trendMap.set(dateStr, (trendMap.get(dateStr) ?? 0) + r.quantity * r.unit_price);
    }
  }
  const revenueTrend = [...trendMap.entries()].map(([date, revenue]) => ({ date, revenue }));

  const claimRows = allRows.filter((r) => CLAIM_STATUSES.includes(r.shipping_status ?? ''));
  const claimItemIds = claimRows.map((r) => r.item_id);

  let buyerFaultCount = 0;
  let sellerFaultCount = 0;

  if (claimItemIds.length > 0) {
    const { data: refunds, error: refundError } = await supabaseAdmin
      .from('refund_requests')
      .select('item_id, fault_type, processed_at')
      .in('item_id', claimItemIds)
      .in('status', CLAIM_STATUSES)
      .order('processed_at', { ascending: false });

    if (refundError) throw refundError;

    const faultByItem = new Map<number, string | null>();
    for (const r of refunds ?? []) {
      if (!faultByItem.has(r.item_id)) faultByItem.set(r.item_id, r.fault_type);
    }

    for (const faultType of faultByItem.values()) {
      if (faultType === '구매자귀책') buyerFaultCount++;
      else if (faultType === '판매자귀책') sellerFaultCount++;
    }
  }

  const claimRate = {
    totalCount: allRows.length,
    claimCount: claimRows.length,
    claimRate: allRows.length > 0 ? Math.round((claimRows.length / allRows.length) * 1000) / 10 : 0,
    buyerFaultCount,
    sellerFaultCount,
  };

  const periodUserIds = new Set(
    allRows.map((r) => r.orders?.user_id).filter((id): id is number => !!id)
  );

  let newCustomerCount = 0;
  let returningCustomerCount = 0;

  if (periodUserIds.size > 0) {
    const { data: firstOrders, error: userOrdersError } = await supabaseAdmin
      .rpc('get_seller_customer_first_orders', { p_seller_id: sellerId })
      .returns<CustomerFirstOrderRow[]>();

    if (userOrdersError) throw userOrdersError;

    const firstOrderMap = new Map<number, Date>();

    if (firstOrders && Array.isArray(firstOrders)) {
      for (const row of firstOrders) {
        firstOrderMap.set(row.user_id, new Date(row.first_order_at));
      }
    }

    for (const userId of periodUserIds) {
      const firstOrderDate = firstOrderMap.get(userId);
      if (firstOrderDate && firstOrderDate < periodStart) {
        returningCustomerCount++;
      } else {
        newCustomerCount++;
      }
    }
  }

  const customer = {
    newCustomerCount,
    returningCustomerCount,
    returningRate:
      periodUserIds.size > 0
        ? Math.round((returningCustomerCount / periodUserIds.size) * 1000) / 10
        : 0,
  };

  return { summary, productRanking, categoryBreakdown, revenueTrend, claimRate, customer };
}
