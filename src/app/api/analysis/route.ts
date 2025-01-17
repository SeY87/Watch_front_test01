import { NextResponse } from 'next/server'
import { VideoAnalysis } from '@/types'

// This is a mock function. In a real application, you would fetch this data from your database.
async function getVideoAnalyses(): Promise<VideoAnalysis[]> {
  return [
    {
      detection_id: 'det1',
      video_id: '1',
      vehicle_id: 'veh1',
      is_electric_only: false,
      timestamp: new Date().toISOString(),
      vehicle_type: '승용차',
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'COMPLETED',
      lot_id: 'lot1',
      plate_number: '12가3456',
      parking_status: 'PARKED'
    },
    {
      detection_id: 'det2',
      video_id: '2',
      vehicle_id: 'veh2',
      is_electric_only: true,
      timestamp: new Date().toISOString(),
      vehicle_type: '화물차',
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'PENDING',
      lot_id: 'lot2',
      plate_number: '34나5678',
      parking_status: 'MOVING'
    }
  ]
}

export async function GET() {
  const analyses = await getVideoAnalyses()
  return NextResponse.json(analyses)
}

