import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function changePassword(
  userId: string,
  email: string,
  isSocial: boolean,
  currentPassword: string,
  newPassword: string,
): Promise<{ error: string | null }> {
  if (isSocial) return { error: '소셜 로그인은 비밀번호 변경이 불가합니다.' }
  const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({ email, password: currentPassword })
  if (signInError) return { error: '현재 비밀번호가 올바르지 않습니다.' }
  const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })
  return { error: pwError?.message ?? null }
}
