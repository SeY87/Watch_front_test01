import { supabase } from './supabase'
import type { TablesRow, TablesInsert } from '@/app/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import { VideoAnalysis } from '@/types'

// 재시도 로직을 위한 유틸리티 함수
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError
}

class APIError extends Error {
  constructor(
    message: string,
    public originalError: PostgrestError | Error | unknown,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
    
    // 에러 상세 정보 로깅
    console.error('API Error Details:', {
      name: this.name,
      message: this.message,
      originalError: this.originalError,
      context: this.context,
      stack: this.stack
    })
  }

  // 클라이언트에 전달할 안전한 에러 객체 생성
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      ...(this.originalError instanceof PostgrestError && {
        code: this.originalError.code,
        details: this.originalError.details,
        hint: this.originalError.hint
      })
    }
  }
}

// 모든 프로필 가져오기
export async function getAllProfiles(): Promise<TablesRow<'profiles'>[]> {
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .throwOnError()

      if (error) {
        const pgError = error as PostgrestError
        throw new APIError('프로필 조회 실패', pgError, { 
          operation: 'getAllProfiles',
          query: 'select * from profiles order by created_at desc',
          errorCode: pgError.code,
          details: pgError.details,
          hint: pgError.hint
        })
      }

      if (!data) {
        return []
      }

      return data
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('프로필 조회 중 예상치 못한 에러 발생', error, {
        operation: 'getAllProfiles'
      })
    }
  }, 3, 1000) // 3번 재시도, 1초 간격
}

// 특정 프로필 가져오기
export async function getProfileById(id: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new APIError('프로필 조회 실패', error, { operation: 'getProfileById', id })
    }

    return data as TablesRow<'profiles'>
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('프로필 조회 중 예상치 못한 에러 발생', error)
  }
}

// 프로필 생성하기
export async function createProfile(profile: Omit<TablesRow<'profiles'>, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()

    if (error) {
      throw new APIError('프로필 생성 실패', error, { operation: 'createProfile', profile })
    }

    return data as TablesRow<'profiles'>
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('프로필 생성 중 예상치 못한 에러 발생', error)
  }
}

// 프로필 업데이트
export async function updateProfile(id: string, profile: Partial<TablesRow<'profiles'>>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new APIError('프로필 업데이트 실패', error, { operation: 'updateProfile', id, profile })
    }

    return data as TablesRow<'profiles'>
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('프로필 업데이트 중 예상치 못한 에러 발생', error)
  }
}

interface VideoAnalysisResponse {
  detection_id: string
  video_id: string
  vehicle_id: string
  vehicle_type: string
  is_electric_only: boolean
  timestamp: string
  uploaded_at: string
  created_at: string
  status: string
  lot_id?: string
  plate_number?: string
  parking_status?: string
}

export async function getAllVideoAnalyses(): Promise<VideoAnalysisResponse[]> {
  const response = await fetch('/api/analysis')
  if (!response.ok) {
    throw new Error('Failed to fetch video analyses')
  }
  return response.json()
}

export async function createVideoAnalysis(analysis: TablesInsert<'video_analyses'>) {
  try {
    const { data, error } = await supabase
      .from('video_analyses')
      .insert([analysis])
      .select()
      .single()

    if (error) {
      throw new APIError('비디오 분석 생성 실패', error, { operation: 'createVideoAnalysis', analysis })
    }

    return data as TablesRow<'video_analyses'>
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('비디오 분석 생성 중 예상치 못한 에러 발생', error)
  }
}

// Fine Assessment API
export async function getAllFineAssessments() {
  try {
    const { data, error } = await supabase
      .from('fine_assessments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new APIError('벌금 평가 조회 실패', error, { operation: 'getAllFineAssessments' })
    }

    return data as TablesRow<'fine_assessments'>[]
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('벌금 평가 조회 중 예상치 못한 에러 발생', error)
  }
}

export async function createFineAssessment(assessment: TablesInsert<'fine_assessments'>) {
  try {
    const { data, error } = await supabase
      .from('fine_assessments')
      .insert([assessment])
      .select()
      .single()

    if (error) {
      throw new APIError('벌금 평가 생성 실패', error, { operation: 'createFineAssessment', assessment })
    }

    return data as TablesRow<'fine_assessments'>
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('벌금 평가 생성 중 예상치 못한 에러 발생', error)
  }
}

export async function updateFineAssessment(
  videoId: string,
  vehicleId: string,
  updates: Partial<TablesRow<'fine_assessments'>>
) {
  try {
    const { data, error } = await supabase
      .from('fine_assessments')
      .update(updates)
      .eq('video_id', videoId)
      .eq('vehicle_id', vehicleId)
      .select()
      .single()

    if (error) {
      throw new APIError('벌금 평가 업데이트 실패', error, { 
        operation: 'updateFineAssessment',
        videoId,
        vehicleId,
        updates
      })
    }

    return data as TablesRow<'fine_assessments'>
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('벌금 평가 업데이트 중 예상치 못한 에러 발생', error)
  }
}

export async function deleteFineAssessment(videoId: string, vehicleId: string) {
  try {
    const { error } = await supabase
      .from('fine_assessments')
      .delete()
      .eq('video_id', videoId)
      .eq('vehicle_id', vehicleId)

    if (error) {
      throw new APIError('벌금 평가 삭제 실패', error, {
        operation: 'deleteFineAssessment',
        videoId,
        vehicleId
      })
    }
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('벌금 평가 삭제 중 예상치 못한 에러 발생', error)
  }
} 