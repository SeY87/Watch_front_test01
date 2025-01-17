"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          router.push('/auth/login')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error checking auth status:', error)
        router.push('/auth/login')
      }
    }

    checkUser()
  }, [router, supabase.auth])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {/* 대시보드 컨텐츠 */}
    </div>
  )
}

