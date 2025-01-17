export const VIDEO_ANALYSIS_COLUMNS = [
  { key: 'video_id', label: '영상 ID' },
  { key: 'uploaded_at', label: '업로드 시간' },
  { key: 'status', label: '처리 상태' },
  { key: 'vehicle_id', label: '차량 ID' },
  { key: 'lot_id', label: '주차장 ID' },
  { key: 'is_electric_only', label: '전기차 전용' },
  { key: 'timestamp', label: '주차 시간' },
  { key: 'plate_number', label: '차량 번호' },
  { key: 'vehicle_type', label: '차량 종류' },
  { key: 'parking_status', label: '주차 상태' },
] as const; 