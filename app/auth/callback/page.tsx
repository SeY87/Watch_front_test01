'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // 이메일 인증 처리
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      } else {
        router.push('/?error=email_confirmation_failed')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">이메일 인증 처리 중...</h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
} 