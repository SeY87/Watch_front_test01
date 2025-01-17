import { FineAssessment } from '@/types'

class FineStore {
  private fines: FineAssessment[] = [
    {
      video_id: '1',
      vehicle_id: 'veh1',
      fine_amount: 50000,
      reason: '불법 주차',
      issuanceStatus: 'PENDING'
    },
    {
      video_id: '2',
      vehicle_id: 'veh2',
      fine_amount: 100000,
      reason: '과속',
      issuanceStatus: 'PENDING'
    }
  ]

  getFines() {
    return this.fines
  }

  updateFineStatus(videoId: string, vehicleId: string, status: 'PENDING' | 'ISSUED') {
    const fineIndex = this.fines.findIndex(
      fine => fine.video_id === videoId && fine.vehicle_id === vehicleId
    )

    if (fineIndex === -1) {
      return null
    }

    this.fines[fineIndex] = {
      ...this.fines[fineIndex],
      issuanceStatus: status
    }

    return this.fines[fineIndex]
  }

  updateFineDetails(videoId: string, vehicleId: string, updates: Partial<FineAssessment>) {
    const fineIndex = this.fines.findIndex(
      fine => fine.video_id === videoId && fine.vehicle_id === vehicleId
    )

    if (fineIndex === -1) {
      return null
    }

    this.fines[fineIndex] = {
      ...this.fines[fineIndex],
      ...updates
    }

    return this.fines[fineIndex]
  }

  deleteFine(videoId: string, vehicleId: string) {
    const fineIndex = this.fines.findIndex(
      fine => fine.video_id === videoId && fine.vehicle_id === vehicleId
    )

    if (fineIndex === -1) {
      return false
    }

    this.fines.splice(fineIndex, 1)
    return true
  }
}

// 싱글톤 인스턴스 생성
export const fineStore = new FineStore() 