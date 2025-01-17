'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthWrapper } from '@/components/auth/AuthWrapper'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthWrapper>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </AuthWrapper>
    </AuthProvider>
  )
} 