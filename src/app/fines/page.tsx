'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { format, isValid, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Car, Receipt, AlertCircle, CreditCard, TrendingUp } from 'lucide-react'

interface FineAssessment {
  id: string
  video_id: string
  vehicle_id: string
  violation_type: string
  violation_time: string
  evidence_url: string
  fine_amount: number
  payment_status: string
  issued_at: string
  created_at: string
  updated_at: string
}

export default function FinesPage() {
  const [fines, setFines] = useState<FineAssessment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFines: 0,
    totalAmount: 0,
    paidAmount: 0,
    paymentRate: 0
  })
  const itemsPerPage = 10

  useEffect(() => {
    fetchFines()
    fetchStats()
  }, [currentPage])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('fine_assessments')
        .select('*')

      if (error) throw error

      if (data) {
        const totalFines = data.length
        const totalAmount = data.reduce((sum, item) => sum + (item.fine_amount || 0), 0)
        const paidFines = data.filter(fine => fine.payment_status === 'PAID')
        const paidAmount = paidFines.reduce((sum, item) => sum + (item.fine_amount || 0), 0)
        const paymentRate = totalAmount > 0 
          ? Math.round((paidAmount / totalAmount) * 100) 
          : 0
        
        setStats({
          totalFines,
          totalAmount,
          paidAmount,
          paymentRate
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchFines = async () => {
    try {
      setIsLoading(true)
      // 전체 개수 조회
      const { count } = await supabase
        .from('fine_assessments')
        .select('*', { count: 'exact', head: true })

      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage))
      }

      // 페이지네이션된 데이터 조회
      const { data, error } = await supabase
        .from('fine_assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (error) throw error

      setFines(data || [])
    } catch (error) {
      console.error('Error fetching fines:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = parseISO(dateString)
    return isValid(date) ? format(date, 'PPP p', { locale: ko }) : '-'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">벌금 판단 결과</h1>
          <p className="text-lg text-muted-foreground mt-2">
            위반 차량에 대한 벌금 판단 결과를 확인합니다.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              총 벌금 건수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFines}건</div>
            <p className="text-sm text-muted-foreground">전체 벌금 부과 건수</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              총 벌금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-sm text-muted-foreground">전체 벌금 부과액</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              납부 완료액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.paidAmount)}</div>
            <p className="text-sm text-muted-foreground">총 납부 완료된 금액</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              납부율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paymentRate}%</div>
            <p className="text-sm text-muted-foreground">전체 벌금 중 납부 비율</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>벌금 부과 목록</CardTitle>
            <CardDescription>
              차량별 상세 벌금 부과 내역을 확인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>벌금 ID</TableHead>
                    <TableHead>차량 번호</TableHead>
                    <TableHead>위반 유형</TableHead>
                    <TableHead>위반 시각</TableHead>
                    <TableHead>벌금액</TableHead>
                    <TableHead>납부 상태</TableHead>
                    <TableHead>발급일</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        데이터를 불러오는 중...
                      </TableCell>
                    </TableRow>
                  ) : fines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        벌금 판단 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fines.map((fine) => (
                      <TableRow key={fine.id}>
                        <TableCell className="font-medium">{fine.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            {fine.vehicle_id}
                          </div>
                        </TableCell>
                        <TableCell>{fine.violation_type}</TableCell>
                        <TableCell>{formatDate(fine.violation_time)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-gray-500" />
                            {formatCurrency(fine.fine_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(fine.payment_status)}`}>
                            {fine.payment_status === 'PAID' ? '납부완료' :
                             fine.payment_status === 'PENDING' ? '미납' :
                             fine.payment_status === 'OVERDUE' ? '체납' : '처리중'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(fine.issued_at)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            상세보기
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        href="#"
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

