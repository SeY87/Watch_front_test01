import { NextResponse } from 'next/server'
import { fineStore } from '@/lib/store'

export async function PUT(
  request: Request,
  { params }: { params: { videoId: string; vehicleId: string } }
) {
  try {
    const { videoId, vehicleId } = params
    const updates = await request.json()

    const updatedFine = fineStore.updateFineDetails(videoId, vehicleId, updates)

    if (!updatedFine) {
      return NextResponse.json(
        { error: '해당하는 벌금을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, updatedFine })
  } catch (error) {
    return NextResponse.json(
      { error: '벌금 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { videoId: string; vehicleId: string } }
) {
  try {
    const { videoId, vehicleId } = params

    const success = fineStore.deleteFine(videoId, vehicleId)

    if (!success) {
      return NextResponse.json(
        { error: '해당하는 벌금을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '벌금 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 