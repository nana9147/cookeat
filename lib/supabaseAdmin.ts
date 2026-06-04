// 서버 전용 Supabase 인스턴스 (SERVICE_ROLE_KEY 사용, API 라우트에서만 임포트할 것)
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
