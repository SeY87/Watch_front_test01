"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navigation } from './Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"

export function Header() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
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

