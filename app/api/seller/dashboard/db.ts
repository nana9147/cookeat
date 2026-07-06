import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ensureSettlements, getSellerSettlementSummary } from '@/app/api/seller/settlements/db';
import { getSellerReviewSummary } from '@/app/api/seller/reviews/db';

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

const CANCEL_OR_REFUND_PENDING_STATUSES = ['취소요청', '환불요청'];

type DashboardOrderRow = {
  order_id: string;
  status: string;
  created_at: string;
};

async function getSellerOrderIds(sellerId: number): Promise<string[]> {
  const { data: sellerItemRows, error } = await supabaseAdmin
    .from('order_items')
    .select('order_id')
    .eq('seller_id', sellerId);

  if (error) throw error;

  return [...new Set((sellerItemRows ?? []).map((r) => r.order_id))];
}

export async function getSellerDashboardStats(sellerOrderIds: string[]) {
  const emptyStats = {
    totalOrders: { label: '전체 주문', count: 0, diff: 0 },
    newOrders: { label: '신규 주문', count: 0, diff: 0 },
    preparingShipment: { label: '배송 준비중', count: 0, diff: null },
    shipping: { label: '배송 중', count: 0, diff: null },
    delivered: { label: '배송 완료', count: 0, diff: null },
    cancelledOrRefunded: { label: '취소/반품', count: 0, diff: null },
  };

  if (sellerOrderIds.length === 0) return emptyStats;

  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = addDays(todayStart, -1);

  // 전체 누적 건수
  const { count: totalCount, error: totalError } = await supabaseAdmin
    .from('orders')
    .select('order_id', { count: 'exact', head: true })
    .in('order_id', sellerOrderIds);

  if (totalError) throw totalError;

  // 현재 전체 주문 상태 (현재 상태 기준 항목 계산용)
  const { data: allOrders, error: allOrdersError } = await supabaseAdmin
    .from('orders')
    .select('order_id, status, created_at')
    .in('order_id', sellerOrderIds)
    .returns<DashboardOrderRow[]>();

  if (allOrdersError) throw allOrdersError;

  const currentPreparing = (allOrders ?? []).filter((o) => o.status === '배송준비').length;
  const currentShipping = (allOrders ?? []).filter((o) => o.status === '배송중').length;
  const currentDelivered = (allOrders ?? []).filter((o) => o.status === '배송완료').length;
  const currentCancelOrRefund = (allOrders ?? []).filter((o) =>
    CANCEL_OR_REFUND_PENDING_STATUSES.includes(o.status)
  ).length;

  const todayOrders = (allOrders ?? []).filter((o) => new Date(o.created_at) >= todayStart);
  const yesterdayOrders = (allOrders ?? []).filter(
    (o) => new Date(o.created_at) >= yesterdayStart && new Date(o.created_at) < todayStart
  );

  return {
    totalOrders: { label: '전체 주문', count: totalCount ?? 0, diff: todayOrders.length },
    newOrders: {
      label: '신규 주문',
      count: todayOrders.length,
      diff: todayOrders.length - yesterdayOrders.length,
    },
    preparingShipment: {
      label: '배송 준비중',
      count: currentPreparing,
      diff: null,
    },
    shipping: {
      label: '배송 중',
      count: currentShipping,
      diff: null,
    },
    delivered: {
      label: '배송 완료',
      count: currentDelivered,
      diff: null,
    },
    cancelledOrRefunded: {
      label: '취소/반품',
      count: currentCancelOrRefund,
      diff: null,
    },
  };
}

export async function getSellerDashboardOrderTrend(sellerId: number, sellerOrderIds: string[]) {
  const today = startOfDay(new Date());
  const thirtyDaysAgo = addDays(today, -29);

  const days: { date: string; count: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = addDays(thirtyDaysAgo, i);
    days.push({ date: toDateStr(d), count: 0 });
  }

  if (sellerOrderIds.length === 0) {
    return days.map((d) => ({ date: d.date, count: 0 }));
  }

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('order_id, created_at')
    .in('order_id', sellerOrderIds)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) throw error;

  const countByDate = new Map<string, number>();
  for (const o of orders ?? []) {
    const dateStr = toDateStr(new Date(o.created_at));
    countByDate.set(dateStr, (countByDate.get(dateStr) ?? 0) + 1);
  }

  return days.map((d) => ({
    date: d.date,
    count: countByDate.get(d.date) ?? 0,
  }));
}

/**
 * 대시보드 전체 데이터 조합
 */
export async function getSellerDashboard(sellerId: number) {
  await ensureSettlements(sellerId);
  const sellerOrderIds = await getSellerOrderIds(sellerId);

  const [stats, orderTrend, settlementSummary, reviewSummary] = await Promise.all([
    getSellerDashboardStats(sellerOrderIds),
    getSellerDashboardOrderTrend(sellerId, sellerOrderIds),
    getSellerSettlementSummary(sellerId),
    getSellerReviewSummary(sellerId),
  ]);

  return {
    stats,
    orderTrend,
    settlement: {
      scheduledTotal: settlementSummary.scheduledTotal,
      pendingTotal: settlementSummary.pendingTotal,
      nextSettlementDate: settlementSummary.nextSettlementDate,
    },
    review: {
      totalCount: reviewSummary.totalCount,
      averageRating: reviewSummary.averageRating,
      pendingReplyCount: reviewSummary.pendingReplyCount,
    },
  };
}
