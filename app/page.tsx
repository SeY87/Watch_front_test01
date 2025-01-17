"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { LoginForm } from '@/components/auth/LoginForm'

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleToggleForm = () => {
    setIsSignUp(!isSignUp)
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">전기차 충전구역 관리 시스템</CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            AI 기반 충전구역 위반 감지 및 자동 단속 시스템
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              실시간 위반 감지, 자동 단속, 그리고 효율적인 벌금 관리를 위한 올인원 솔루션입니다.
            </p>
            {!showAuth && (
              <div className="flex justify-center gap-4">
                <Button onClick={() => setShowAuth(true)} size="lg">
                  시작하기
                </Button>
                <Button variant="outline" size="lg">
                  자세히 알아보기
                </Button>
              </div>
            )}
          </div>
          
          {showAuth && (
            <div className="flex justify-center mt-8">
              {isSignUp ? (
                <SignUpForm onToggleForm={handleToggleForm} />
              ) : (
                <LoginForm onToggleForm={handleToggleForm} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
