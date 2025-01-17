import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TablesInsert } from '@/app/types/supabase'

async function createOrUpdateProfile(
  userId: string,
  profileData: Partial<TablesInsert<'profiles'>>
) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw error
}

// 회원가입 처리
export async function PUT(request: NextRequest) {
  try {
    const { email, password, username, full_name } = await request.json()

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: '유효한 이메일을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 비밀번호 유효성 검사 (최소 6자 이상)
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // Supabase로 회원가입
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name,
        },
      },
    })

    if (signUpError) {
      return NextResponse.json(
        { success: false, message: signUpError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: '회원가입 처리 중 오류가 발생했습니다.' },
        { status: 400 }
      )
    }

    // 프로필 생성
    try {
      await createOrUpdateProfile(authData.user.id, {
        username: username || email.split('@')[0],
        full_name: full_name || null,
        created_at: new Date().toISOString(),
      })
    } catch (profileError) {
      console.error('Profile creation error:', profileError)
      // 프로필 생성 실패해도 회원가입은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      user: authData.user,
    })
  } catch (error) {
    console.error('SignUp error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, full_name } = await request.json()

    // Supabase 인증을 사용하여 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 401 }
      )
    }

    // 프로필 정보 업데이트
    try {
      await createOrUpdateProfile(authData.user.id, {
        username: username || authData.user.email?.split('@')[0],
        full_name: full_name || null,
      })
    } catch (profileError) {
      console.error('Profile update error:', profileError)
      // 프로필 업데이트 실패해도 로그인은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: authData.user,
      session: authData.session,
    })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 로그아웃 처리
export async function DELETE() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { success: false, message: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

