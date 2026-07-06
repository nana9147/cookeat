import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logOrderItemStatusHistory } from '@/lib/orderItemStatusHistory';

// 배송완료 후 이 기간(일)이 지나면 자동으로 구매확정 처리한다. 실제 크론 없이,
// 주문 목록 조회 시점에 지연 처리한다(판매자 정산의 ensure_seller_settlements와 동일한 패턴).
const PURCHASE_CONFIRM_DAYS = 7;

// 레시피 경유 구매 시 작성자에게 지급하는 포인트: 100 × (이번 주문에서 그 레시피로 산 재료 수 / 레시피 전체 구매가능 재료 수)
const RECIPE_REFERRAL_POINT_BASE = 100;

export async function ensurePurchaseConfirmations(userId: number) {
  try {
    const { data: candidateItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('item_id, order_id, seller_id, recipe_id, orders!inner(user_id)')
      .eq('orders.user_id', userId)
      .eq('shipping_status', '배송완료')
      .not('recipe_id', 'is', null);

    if (itemsError) throw itemsError;
    if (!candidateItems || candidateItems.length === 0) return;

    const orderIds = [...new Set(candidateItems.map((i) => i.order_id))];
    const { data: shippingRows, error: shippingError } = await supabaseAdmin
      .from('shippings')
      .select('order_id, seller_id, delivered_at')
      .in('order_id', orderIds);
    if (shippingError) throw shippingError;

    const deliveredAtByKey = new Map(
      (shippingRows ?? []).map((s) => [`${s.order_id}:${s.seller_id}`, s.delivered_at])
    );

    const cutoff = Date.now() - PURCHASE_CONFIRM_DAYS * 24 * 60 * 60 * 1000;
    const dueItems = candidateItems.filter((i) => {
      const deliveredAt = deliveredAtByKey.get(`${i.order_id}:${i.seller_id}`);
      return deliveredAt && new Date(deliveredAt).getTime() <= cutoff;
    });
    if (dueItems.length === 0) return;

    const dueItemIds = dueItems.map((i) => i.item_id);
    const { data: alreadyConfirmed, error: historyError } = await supabaseAdmin
      .from('order_item_status_history')
      .select('order_item_id')
      .in('order_item_id', dueItemIds)
      .eq('status', '구매확정');
    if (historyError) throw historyError;

    const confirmedItemIds = new Set((alreadyConfirmed ?? []).map((r) => r.order_item_id));
    const newlyDueItems = dueItems.filter((i) => !confirmedItemIds.has(i.item_id));
    if (newlyDueItems.length === 0) return;

    const recipeIds = [...new Set(newlyDueItems.map((i) => i.recipe_id as number))];

    const { data: recipeRows, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .select('recipe_id, user_id')
      .in('recipe_id', recipeIds);
    if (recipeError) throw recipeError;
    const authorByRecipeId = new Map((recipeRows ?? []).map((r) => [r.recipe_id, r.user_id]));

    const { data: ingredientRows, error: ingredientError } = await supabaseAdmin
      .from('recipe_ingredients')
      .select('recipe_id')
      .in('recipe_id', recipeIds)
      .not('product_id', 'is', null);
    if (ingredientError) throw ingredientError;
    const totalIngredientCountByRecipeId = new Map<number, number>();
    for (const row of ingredientRows ?? []) {
      totalIngredientCountByRecipeId.set(
        row.recipe_id,
        (totalIngredientCountByRecipeId.get(row.recipe_id) ?? 0) + 1
      );
    }

    // (order_id, recipe_id)별로 이번에 확정되는 재료 수를 센다
    const selectedCountByOrderRecipe = new Map<string, number>();
    for (const item of newlyDueItems) {
      const key = `${item.order_id}:${item.recipe_id}`;
      selectedCountByOrderRecipe.set(key, (selectedCountByOrderRecipe.get(key) ?? 0) + 1);
    }

    for (const [key, selectedCount] of selectedCountByOrderRecipe) {
      const [orderId, recipeIdStr] = key.split(':');
      const recipeId = Number(recipeIdStr);
      const authorId = authorByRecipeId.get(recipeId);
      const totalCount = totalIngredientCountByRecipeId.get(recipeId) ?? 0;

      if (authorId !== undefined && authorId !== userId && totalCount > 0) {
        const pointPaid = Math.min(
          RECIPE_REFERRAL_POINT_BASE,
          Math.round((RECIPE_REFERRAL_POINT_BASE * selectedCount) / totalCount)
        );
        if (pointPaid > 0) {
          const { error: referralError } = await supabaseAdmin
            .from('recipe_order_referrals')
            .insert({ order_id: orderId, recipe_id: recipeId, point_paid: pointPaid });
          if (referralError) {
            console.error('[ensurePurchaseConfirmations] 추천 기록 실패:', referralError.message);
          } else {
            const { error: pointError } = await supabaseAdmin.rpc('award_review_point', {
              p_user_id: authorId,
              p_amount: pointPaid,
              p_description: `레시피 경유 구매 적립 (주문 ${orderId})`,
            });
            if (pointError) {
              console.error('[ensurePurchaseConfirmations] 포인트 적립 실패:', pointError.message);
            }
          }
        }
      }
    }

    await Promise.all(
      newlyDueItems.map((i) => logOrderItemStatusHistory(i.item_id, '구매확정'))
    );
  } catch (err) {
    console.error('[ensurePurchaseConfirmations] 처리 실패:', err);
  }
}
