import { User } from '@supabase/supabase-js'

export interface VideoAnalysis {
  detection_id: string;
  video_id: string;
  vehicle_id: string;
  vehicle_type: string;
  is_electric_only: boolean;
  timestamp: string;
  uploaded_at: string;
  created_at: string;
  status: string;
  lot_id?: string;
  plate_number?: string;
  parking_status?: string;
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

export interface Notification {
  id: string
  user_id: string
  message: string
  created_at: string
  read: boolean
}

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
}

export interface LayoutProps {
  children: React.ReactNode
}

