import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { email, password, name, phone, organization } = requestData

    const supabase = createRouteHandlerClient({ cookies })

    // 1. Supabase Auth로 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          organization,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '회원가입에 실패했습니다.' },
        { status: 400 }
      )
    }

    // 2. users 테이블에 사용자 정보 저장
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          phone,
          organization,
          role: 'user',
          status: 'active',
        },
      ])
      .select()
      .single()

    if (userError) {
      // users 테이블 저장 실패 시 Auth 사용자 삭제
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      user: authData.user,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 