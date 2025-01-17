import { NextResponse } from 'next/server'
import { VideoAnalysis } from '@/types'

// This is a mock function. In a real application, you would fetch this data from your database.
async function getVideoAnalyses(): Promise<VideoAnalysis[]> {
  return [
    {
      video_id: '1',
      file_path: '/videos/1.mp4',
      uploaded_at: '2023-06-01T10:00:00Z',
      status: 'completed',
      detection_id: 'det1',
      vehicle_id: 'veh1',
      lot_id: 'lot1',
      is_electric_only: false,
      timestamp: '2023-06-01T10:05:00Z',
      plate_number: 'ABC123',
      vehicle_type: 'sedan',
      parking_status: 'parked',
    },
    // Add more mock data as needed
  ]
}

export async function GET() {
  const analyses = await getVideoAnalyses()
  return NextResponse.json(analyses)
}

