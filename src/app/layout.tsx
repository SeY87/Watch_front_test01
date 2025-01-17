import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Metadata } from 'next'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WATCH - 교통 위반 감지 시스템',
  description: 'AI 기반 교통 위반 감지 및 분석 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen">
            <Navbar>{children}</Navbar>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

