export interface VideoAnalysis {
  detection_id: string;
  video_id: string;
  vehicle_id: string;
  vehicle_type: string;
  is_electric_only: boolean;
  timestamp: string;
  uploaded_at: string;
  created_at: string;
}

export interface FineAssessment {
  video_id: string;
  vehicle_id: string;
  fine_amount: number;
  reason: string;
  issuanceStatus: 'PENDING' | 'ISSUED';
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

