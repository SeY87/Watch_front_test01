'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BarChart3, Upload, LineChart, Calculator, Menu } from 'lucide-react'
import { NotificationBell } from '@/components/NotificationBell'
import { UserMenu } from '@/components/UserMenu'
import { ModeToggle } from '@/components/ModeToggle'
import { useAuth } from '@/hooks/useAuth'
import { NavigationItem, LayoutProps } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react'

const navigation: NavigationItem[] = [
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

interface NavLinkProps {
  item: NavigationItem
  isActive: boolean
  onClick?: () => void
}

function NavLink({ item, isActive, onClick }: NavLinkProps) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center space-x-3 rounded-lg px-4 py-3 text-base font-medium transition-all',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.name}</span>
    </Link>
  )
}

export function Navbar({ children }: LayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

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

  const handleNavClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* 모바일 네비게이션 */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
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
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                onClick={handleNavClick}
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:block w-64 bg-background border-r h-screen fixed">
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
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="lg:ml-64">
        {/* 상단 헤더 */}
        <header className="h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed w-full lg:w-[calc(100%-16rem)] z-10">
          <div className="container flex h-full items-center justify-between">
            {/* 좌측 영역 */}
            <div className="flex items-center gap-4">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">메뉴 열기</span>
                  </Button>
                </SheetTrigger>
              </Sheet>
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
        <main className="pt-20 px-4 lg:px-8">
          {children}
        </main>
      </div>
    </>
  )
}