'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const publicRoutes = ['/', '/auth/verify-email', '/auth/callback']

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        const isPublicRoute = publicRoutes.includes(pathname)

        if (!session && !isPublicRoute) {
          // 비로그인 상태에서 보호된 라우트 접근 시 홈으로 리다이렉트
          router.push('/')
        } else if (session && pathname === '/') {
          // 로그인 상태에서 홈 접근 시 대시보드로 리다이렉트
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/')
      }
    }

    checkAuth()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  return children
} 