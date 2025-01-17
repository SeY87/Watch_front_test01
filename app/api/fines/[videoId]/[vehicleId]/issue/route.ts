import { NextRequest, NextResponse } from 'next/server'
import { fineStore } from '@/lib/store'

export async function POST(
  request: NextRequest,
  context: {
    params: {
      videoId: string
      vehicleId: string
    }
  }
) {
  try {
    const { videoId, vehicleId } = context.params
    const { status } = await request.json()

    const updatedFine = fineStore.updateFineStatus(videoId, vehicleId, status)

    if (!updatedFine) {
      return NextResponse.json(
        { error: '해당하는 벌금을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: status === 'ISSUED' ? '벌금이 성공적으로 발급되었습니다.' : '벌금이 발급 대기 상태로 변경되었습니다.',
      updatedFine
    })
  } catch (error) {
    console.error('Error updating fine status:', error)
    return NextResponse.json(
      { error: '벌금 상태 변경 중 오류가 발생했습니다.' }, 
      { status: 500 }
    )
  }
} 