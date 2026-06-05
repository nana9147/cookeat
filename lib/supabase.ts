// 클라이언트 전용 Supabase 인스턴스 (PUBLISHABLE_KEY 사용, 브라우저 안전)
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)
