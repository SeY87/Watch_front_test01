"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navigation } from './Navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a 
          href="#" 
          onClick={handleLogoClick} 
          className="text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          WATCH
        </a>
        {isAuthenticated && (
          <>
            <Navigation />
            <Button onClick={handleLogout} variant="ghost">로그아웃</Button>
          </>
        )}
      </div>
    </header>
  )
}

