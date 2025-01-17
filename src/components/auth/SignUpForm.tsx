'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'

interface SignUpFormProps {
  onToggleForm: () => void
}

export function SignUpForm({ onToggleForm }: SignUpFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    phone?: string;
    organization?: string;
  }>({})

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    organization: '',
  })

  // 입력값 유효성 검사
  const validateField = (name: string, value: string) => {
    const errors: { [key: string]: string } = {}

    switch (name) {
      case 'email':
        if (!value) {
          errors.email = '이메일을 입력해주세요.'
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          errors.email = '유효한 이메일 주소를 입력해주세요.'
        }
        break

      case 'password':
        if (!value) {
          errors.password = '비밀번호를 입력해주세요.'
        } else if (value.length < 8) {
          errors.password = '비밀번호는 8자 이상이어야 합니다.'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          errors.password = '비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.'
        }
        break

      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
        } else if (value !== formData.password) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
        }
        break

      case 'name':
        if (!value) {
          errors.name = '이름을 입력해주세요.'
        } else if (value.length < 2) {
          errors.name = '이름은 2자 이상이어야 합니다.'
        }
        break

      case 'phone':
        if (!value) {
          errors.phone = '전화번호를 입력해주세요.'
        } else if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(value.replace(/-/g, ''))) {
          errors.phone = '올바른 전화번호 형식이 아닙니다.'
        }
        break

      case 'organization':
        if (!value) {
          errors.organization = '소속을 입력해주세요.'
        }
        break
    }

    setValidationErrors(prev => ({ ...prev, ...errors }))
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // 모든 필드 유효성 검사
    const isValid = Object.keys(formData).every(key => 
      validateField(key, formData[key as keyof typeof formData])
    )

    if (!isValid) {
      setIsLoading(false)
      return
    }

    try {
      // 1. Supabase Auth로 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            organization: formData.organization,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('회원가입에 실패했습니다.')
      }

      // 2. users 테이블에 사용자 정보 저장
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            organization: formData.organization,
            role: 'user',
            status: 'active',
          },
        ])
        .select()
        .single()

      if (userError) {
        // users 테이블 저장 실패 시 Auth 사용자 삭제
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw userError
      }

      // 회원가입 성공
      router.push('/auth/verify-email')
    } catch (err: any) {
      let errorMessage = '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.'
      let solution = ''
      
      // Supabase 에러 메시지 한글화 및 해결 방법 제시
      if (err.message?.includes('Password should be at least 6 characters')) {
        errorMessage = '비밀번호가 너무 짧습니다.'
        solution = '비밀번호는 최소 6자 이상으로 설정해 주세요.'
      } else if (err.message?.includes('Email already registered')) {
        errorMessage = '이미 등록된 이메일입니다.'
        solution = '다른 이메일을 사용하거나 로그인을 시도해 주세요.'
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = '유효하지 않은 이메일 주소입니다.'
        solution = '올바른 이메일 형식(예: name@example.com)으로 입력해 주세요.'
      } else if (err.message?.includes('Password is too weak')) {
        errorMessage = '비밀번호가 취약합니다.'
        solution = '영문 대/소문자, 숫자, 특수문자를 포함하여 8자 이상으로 설정해 주세요.'
      } else if (err.message?.includes('Network error')) {
        errorMessage = '네트워크 연결 오류'
        solution = '인터넷 연결을 확인하고 다시 시도해 주세요.'
      } else if (err.message?.includes('Phone number format')) {
        errorMessage = '전화번호 형식이 올바르지 않습니다.'
        solution = '올바른 전화번호 형식(예: 010-1234-5678)으로 입력해 주세요.'
      }
      
      setError(`${errorMessage}\n${solution}`)

      // 개발 환경에서만 에러 로깅
      if (process.env.NODE_ENV === 'development') {
        console.warn('회원가입 실패:', { 
          message: err.message,
          code: err.code,
          details: err.details 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          새로운 계정을 만들어보세요.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="space-y-2">
              <AlertDescription className="whitespace-pre-line">
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={validationErrors.email ? 'border-red-500' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className={validationErrors.password ? 'border-red-500' : ''}
            />
            {validationErrors.password && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={validationErrors.confirmPassword ? 'border-red-500' : ''}
            />
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              required
              className={validationErrors.name ? 'border-red-500' : ''}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
              className={validationErrors.phone ? 'border-red-500' : ''}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">소속</Label>
            <Input
              id="organization"
              name="organization"
              type="text"
              placeholder="소속을 입력하세요"
              value={formData.organization}
              onChange={handleChange}
              required
              className={validationErrors.organization ? 'border-red-500' : ''}
            />
            {validationErrors.organization && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.organization}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            회원가입
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onToggleForm}
          >
            이미 계정이 있으신가요? 로그인하기
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 