"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

const navItems = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/upload', label: '영상 업로드' },
  { href: '/analysis', label: '영상 분석 결과' },
  { href: '/fines', label: '벌금 판단 결과' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-4 mb-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-gray-900 text-white"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

