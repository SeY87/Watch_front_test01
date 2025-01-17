'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BarChart3, Upload, LineChart, Calculator, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { NotificationBell } from '@/components/NotificationBell'
import { UserMenu } from '@/components/UserMenu'
import { ModeToggle } from '@/components/ModeToggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { 
    name: '대시보드', 
    href: '/dashboard',
    icon: BarChart3
  },
  { 
    name: '영상 업로드', 
    href: '/upload',
    icon: Upload
  },
  { 
    name: '영상 분석 결과', 
    href: '/analysis',
    icon: LineChart
  },
  { 
    name: '벌금 판단 결과', 
    href: '/fines',
    icon: Calculator
  },
]

interface NavbarProps {
  children?: React.ReactNode
}

export function Navbar({ children }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [supabase.auth])

  if (pathname === '/' || pathname.startsWith('/auth')) {
    return (
      <div className="min-h-screen">
        <div className="flex h-20 items-center px-6 border-b">
          <Link 
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl font-bold text-primary">WATCH</span>
          </Link>
        </div>
        <main>{children}</main>
      </div>
    )
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <>
      {/* 좌측 사이드바 */}
      <div className="w-64 bg-background border-r h-screen fixed">
        <div className="flex h-20 items-center px-6 border-b">
          <Link 
            href="#"
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl font-bold text-primary">WATCH</span>
          </Link>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-4 py-3 text-base font-medium transition-all',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 ml-64">
        {/* 상단 헤더 */}
        <header className="h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed w-[calc(100%-16rem)] z-10">
          <div className="container flex h-full items-center justify-between">
            {/* 좌측 영역 */}
            <div className="flex items-center gap-4">
              <ModeToggle />
              <UserMenu />
            </div>
            {/* 우측 영역 */}
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>
        </header>
        {/* 메인 컨텐츠 */}
        <main className="pt-20">
          {children}
        </main>
      </div>
    </>
  )
} 