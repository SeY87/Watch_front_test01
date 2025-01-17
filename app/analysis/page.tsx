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
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FileVideo, AlertCircle, BarChart } from 'lucide-react'

interface VideoAnalysis {
  id: string
  video_url: string
  video_name: string
  location: string
  duration: number
  status: string
  violation_count: number
  created_at: string
  updated_at: string
}

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViolations: 0,
    avgViolationsPerVideo: 0
  })
  const itemsPerPage = 10

  useEffect(() => {
    fetchAnalyses()
    fetchStats()
  }, [currentPage])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('video_analyses')
        .select('*')

      if (error) throw error

      if (data) {
        const totalVideos = data.length
        const completedAnalyses = data.filter(video => video.status === 'completed')
        const totalViolations = completedAnalyses.reduce((sum, video) => sum + (video.violation_count || 0), 0)
        const avgViolationsPerVideo = completedAnalyses.length > 0 
          ? Math.round((totalViolations / completedAnalyses.length) * 10) / 10 
          : 0

        setStats({
          totalVideos,
          totalViolations,
          avgViolationsPerVideo
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true)
      // 전체 개수 조회
      const { count } = await supabase
        .from('video_analyses')
        .select('*', { count: 'exact', head: true })

      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage))
      }

      // 페이지네이션된 데이터 조회
      const { data, error } = await supabase
        .from('video_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (error) throw error

      setAnalyses(data || [])
    } catch (error) {
      console.error('Error fetching analyses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}분 ${remainingSeconds}초`
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">영상 분석 결과</h1>
          <p className="text-lg text-muted-foreground mt-2">
            업로드된 영상의 분석 결과를 확인합니다.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileVideo className="h-5 w-5 text-primary" />
              총 분석 영상
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}개</div>
            <p className="text-sm text-muted-foreground">전체 분석된 영상 수</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              총 위반 건수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViolations}건</div>
            <p className="text-sm text-muted-foreground">전체 위반 감지 건수</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              평균 위반 건수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgViolationsPerVideo}건</div>
            <p className="text-sm text-muted-foreground">영상당 평균 위반 건수</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>분석 결과 목록</CardTitle>
            <CardDescription>
              영상별 상세 분석 결과를 확인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>영상 ID</TableHead>
                    <TableHead>영상 이름</TableHead>
                    <TableHead>촬영 위치</TableHead>
                    <TableHead>영상 길이</TableHead>
                    <TableHead>위반 건수</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>등록일</TableHead>
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
                  ) : analyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        분석 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    analyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell className="font-medium">{analysis.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileVideo className="w-4 h-4 text-gray-500" />
                            {analysis.video_name}
                          </div>
                        </TableCell>
                        <TableCell>{analysis.location}</TableCell>
                        <TableCell>{formatDuration(analysis.duration)}</TableCell>
                        <TableCell>{analysis.violation_count}건</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(analysis.status)}`}>
                            {analysis.status === 'completed' ? '완료' :
                             analysis.status === 'processing' ? '처리중' :
                             analysis.status === 'failed' ? '실패' : '대기중'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(analysis.created_at), 'PPP p', { locale: ko })}
                        </TableCell>
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

