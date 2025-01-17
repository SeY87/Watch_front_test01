export type Database = {
  public: {
    Tables: {
      // 예시: profiles 테이블
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      video_analyses: {
        Row: {
          detection_id: string
          video_id: string
          vehicle_id: string
          vehicle_type: string
          is_electric_only: boolean
          timestamp: string
          uploaded_at: string
          created_at: string
        }
        Insert: {
          detection_id?: string
          video_id: string
          vehicle_id: string
          vehicle_type: string
          is_electric_only: boolean
          timestamp: string
          uploaded_at?: string
          created_at?: string
        }
        Update: {
          detection_id?: string
          video_id?: string
          vehicle_id?: string
          vehicle_type?: string
          is_electric_only?: boolean
          timestamp?: string
          uploaded_at?: string
          created_at?: string
        }
      }
      fine_assessments: {
        Row: {
          id: string
          video_id: string
          vehicle_id: string
          fine_amount: number
          reason: string
          issuanceStatus: 'PENDING' | 'ISSUED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video_id: string
          vehicle_id: string
          fine_amount: number
          reason: string
          issuanceStatus?: 'PENDING' | 'ISSUED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          vehicle_id?: string
          fine_amount?: number
          reason?: string
          issuanceStatus?: 'PENDING' | 'ISSUED'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 데이터베이스 타입에서 특정 테이블의 타입을 추출하는 유틸리티 타입들
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// Supabase 클라이언트 타입
export type SupabaseClient = Database 