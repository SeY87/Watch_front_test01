'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()

  const handleLoginClick = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">이메일 인증</CardTitle>
          <CardDescription className="text-center">
            가입하신 이메일 주소로 인증 메일을 발송했습니다.
            <br />
            이메일을 확인하여 인증을 완료해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>이메일이 도착하지 않았나요?</p>
            <p>스팸 메일함을 확인해주세요.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLoginClick}
          >
            로그인으로 돌아가기
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 