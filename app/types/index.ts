import type { TablesRow } from './supabase'

export type VideoAnalysis = TablesRow<'video_analyses'> & {
  file_path?: string
  status?: string
  lot_id?: string
  plate_number?: string
  parking_status?: string
}

export type FineAssessment = TablesRow<'fine_assessments'> 