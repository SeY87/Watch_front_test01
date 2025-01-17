import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/app/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 설정되지 않았습니다.')
}

// 환경 변수 값 검증
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Supabase URL은 https://로 시작해야 합니다.')
}

if (supabaseAnonKey.length < 30) {
  throw new Error('Supabase Anon Key가 올바르지 않습니다.')
}

// 타임아웃 설정과 함께 클라이언트 생성
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'app-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'frontend-dev'
    }
  }
}) 