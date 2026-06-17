// 클라이언트 전용 Supabase 인스턴스 (PUBLISHABLE_KEY 사용, 브라우저 안전)
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_client) {
      _client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: {
            persistSession: false,   // Supabase 자체 localStorage 세션 저장 금지
            autoRefreshToken: false, // 토큰 갱신은 Axios 인터셉터(/api/auth/refresh)가 담당
          },
        },
      )
    }
    return (_client as unknown as Record<string | symbol, unknown>)[prop]
  },
})
