import type { TablesRow } from './supabase'

export type VideoAnalysis = {
  video_id: string;
  vehicle_id: string;
  is_electric_only: boolean;
  timestamp: string;
  vehicle_type: string;
  uploaded_at: string;
  status: string;
  lot_id?: string;
  plate_number?: string;
  parking_status?: string;
}

export type FineAssessment = TablesRow<'fine_assessments'> 