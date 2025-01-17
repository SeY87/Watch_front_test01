"use client"

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VideoAnalysis } from '@/types'
import { VIDEO_ANALYSIS_COLUMNS } from '@/constants/tableColumns'
import { Table2, Loader2, AlertCircle, Search, RefreshCw, Clock, Filter } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { getAllVideoAnalyses } from '@/lib/api'

const ITEMS_PER_PAGE = 20
const MAX_VISIBLE_PAGES = 5  // 한 번에 보여줄 페이지 번호 수

export function VideoAnalysisTable() {
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<VideoAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filters, setFilters] = useState<{
    is_electric_only: string | null;
    vehicle_type: string | null;
  }>({
    is_electric_only: null,
    vehicle_type: null,
  })

  const filterOptions = {
    is_electric_only: ['전체', '예', '아니오'],
    vehicle_type: ['전체', '승용차', '화물차', '버스', '오토바이']
  }

  const fetchAnalyses = async () => {
    try {
      setIsRefreshing(true)
      const data = await getAllVideoAnalyses()
      
      const formattedData = data.map((item) => {
        return {
          detection_id: item.detection_id,
          video_id: item.video_id,
          vehicle_id: item.vehicle_id,
          vehicle_type: item.vehicle_type,
          is_electric_only: item.is_electric_only,
          timestamp: new Date(item.timestamp).toLocaleString('ko-KR'),
          uploaded_at: new Date(item.uploaded_at).toLocaleString('ko-KR'),
          created_at: item.created_at
        }
      })
      
      setAnalyses(formattedData)
      setFilteredAnalyses(formattedData)
      setLastUpdated(new Date().toLocaleString('ko-KR'))
      setError(null)
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalyses()
    const interval = setInterval(fetchAnalyses, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = analyses

    if (searchQuery) {
      filtered = filtered.filter(analysis => 
        Object.values(analysis).some(value => 
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (filters.is_electric_only !== null && filters.is_electric_only !== '전체') {
      filtered = filtered.filter(analysis => 
        analysis.is_electric_only === (filters.is_electric_only === '예')
      )
    }

    if (filters.vehicle_type !== null && filters.vehicle_type !== '전체') {
      filtered = filtered.filter(analysis => 
        analysis.vehicle_type === filters.vehicle_type
      )
    }

    setFilteredAnalyses(filtered)
    setCurrentPage(1)
  }, [searchQuery, analyses, filters])

  const totalPages = Math.ceil(filteredAnalyses.length / ITEMS_PER_PAGE)
  const paginatedData = filteredAnalyses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const formatCellValue = (key: string, value: any) => {
    if (key === 'is_electric_only') {
      return value ? '예' : '아니오'
    }
    return value
  }

  const resetFilters = () => {
    setFilters({
      is_electric_only: null,
      vehicle_type: null,
    })
  }

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    let start = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2))
    let end = start + MAX_VISIBLE_PAGES - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - MAX_VISIBLE_PAGES + 1)
    }

    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    if (start > 1) {
      pages.unshift(-1) // -1은 줄임표를 표시하기 위한 값
      pages.unshift(1)
    }
    if (end < totalPages) {
      pages.push(-1)
      pages.push(totalPages)
    }

    return pages
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Table2 className="h-5 w-5" />
        <h2 className="text-2xl font-semibold mb-4">영상 분석 결과</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/50 p-4 rounded-lg mb-4">
        <div className="flex-1 flex items-center gap-2 w-full sm:w-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="데이터 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>마지막 업데이트: {lastUpdated}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalyses}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>


        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                필터
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>필터 옵션</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-sm">전기차 여부</DropdownMenuLabel>
              {filterOptions.is_electric_only.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    is_electric_only: option === '전체' ? null : option
                  }))}
                  className={filters.is_electric_only === option ? "bg-accent" : ""}
                >
                  {option}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-sm">차량 유형</DropdownMenuLabel>
              {filterOptions.vehicle_type.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    vehicle_type: option === '전체' ? null : option
                  }))}
                  className={filters.vehicle_type === option ? "bg-accent" : ""}
                >
                  {option}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetFilters}>
                필터 초기화
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
      
        </div>
      </div>

      {(filters.is_electric_only || filters.vehicle_type) && (
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>활성화된 필터:</span>
          {filters.is_electric_only && (
            <span className="bg-accent/50 px-2 py-1 rounded">
              전기차: {filters.is_electric_only}
            </span>
          )}
          {filters.vehicle_type && (
            <span className="bg-accent/50 px-2 py-1 rounded">
              차량 유형: {filters.vehicle_type}
            </span>
          )}
        </div>
      )}

      <div className="text-sm text-muted-foreground mb-2">
        총 {filteredAnalyses.length}개 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAnalyses.length)}개 표시
      </div>

      {isLoading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>데이터를 불러오는 중...</span>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {VIDEO_ANALYSIS_COLUMNS.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {VIDEO_ANALYSIS_COLUMNS.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            paginatedData.map((analysis) => (
              <TableRow key={analysis.detection_id}>
                {VIDEO_ANALYSIS_COLUMNS.map((column) => (
                  <TableCell key={column.key}>
                    {formatCellValue(column.key, analysis[column.key as keyof VideoAnalysis])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setCurrentPage(1)}
                  isActive={currentPage === 1}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {currentPage > 3 && <PaginationEllipsis />}
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="cursor-pointer"
                  >
                    {currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              {currentPage > 1 && currentPage < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(currentPage)}
                    isActive
                    className="cursor-pointer"
                  >
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
              )}
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="cursor-pointer"
                  >
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              {currentPage < totalPages - 2 && <PaginationEllipsis />}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(totalPages)}
                    isActive={currentPage === totalPages}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

