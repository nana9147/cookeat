import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface IssueSuccess {
  issuedCount: number;
}

interface IssueFailure {
  error: string;
  status: number;
}

export type IssueResult = IssueSuccess | IssueFailure;

export function isIssueFailure(result: IssueResult): result is IssueFailure {
  return 'error' in result;
}

export async function getActiveUserIds(): Promise<number[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('user_id')
    .eq('role', 'user')
    .eq('status', 'active');

  if (error) {
    throw error;
  }
  return (data ?? []).map((u) => u.user_id);
}

export async function issueCouponToUsers(
  couponId: number,
  targetUserIds: number[],
  maxUsageCount: number | null
): Promise<IssueResult> {
  if (targetUserIds.length === 0) {
    return { issuedCount: 0 };
  }

  if (maxUsageCount !== null) {
    const { count, error: countError } = await supabaseAdmin
      .from('user_coupons')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', couponId);

    if (countError) {
      console.error('[issueCouponToUsers] count:', countError);
      return { error: countError.message, status: 500 };
    }
    if ((count ?? 0) + targetUserIds.length > maxUsageCount) {
      return { error: `최대 발급 수량(${maxUsageCount}개)을 초과합니다.`, status: 400 };
    }
  }

  const rows = targetUserIds.map((userId) => ({ user_id: userId, coupon_id: couponId }));
  const { data, error } = await supabaseAdmin
    .from('user_coupons')
    .upsert(rows, { onConflict: 'user_id,coupon_id', ignoreDuplicates: true })
    .select('id');

  if (error) {
    console.error('[issueCouponToUsers]', error);
    return { error: error.message, status: 500 };
  }
  return { issuedCount: data?.length ?? 0 };
}
