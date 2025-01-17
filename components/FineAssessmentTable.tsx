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
} from "@/components/ui/pagination"
import { FineAssessment } from '@/types'
import { Table2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search,
  RefreshCw,
  Clock
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock8 } from "lucide-react"
import { MoreHorizontal, Pencil, Trash2, Ban } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  getAllFineAssessments,
  updateFineAssessment,
  deleteFineAssessment
} from '@/lib/api'

const ITEMS_PER_PAGE = 20

export function FineAssessmentTable() {
  const [fines, setFines] = useState<FineAssessment[]>([])
  const [filteredFines, setFilteredFines] = useState<FineAssessment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filters, setFilters] = useState<{
    fine_amount: string | null;
  }>({
    fine_amount: null,
  })
  const [issuingFineId, setIssuingFineId] = useState<string | null>(null)
  const [selectedFine, setSelectedFine] = useState<FineAssessment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    fine_amount: '',
    reason: ''
  })

  const filterOptions = {
    fine_amount: ['전체', '10만원 이하', '10-50만원', '50만원 이상']
  }

  const fetchFines = async () => {
    try {
      setIsRefreshing(true)
      const data = await getAllFineAssessments()
      setFines(data)
      setFilteredFines(data)
      setLastUpdated(new Date().toLocaleString('ko-KR'))
    } catch (error) {
      console.error('Error fetching fines:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFines()
    const interval = setInterval(fetchFines, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = fines

    if (searchQuery) {
      filtered = filtered.filter(fine => 
        Object.values(fine).some(value => 
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (filters.fine_amount !== null && filters.fine_amount !== '전체') {
      filtered = filtered.filter(fine => {
        const amountStr = String(fine.fine_amount);
        const amount = Number(amountStr.replace(/[^0-9]/g, ''));
        
        switch (filters.fine_amount) {
          case '10만원 이하':
            return amount <= 100000;
          case '10-50만원':
            return amount > 100000 && amount <= 500000;
          case '50만원 이상':
            return amount > 500000;
          default:
            return true;
        }
      });
    }

    setFilteredFines(filtered)
    setCurrentPage(1)
  }, [searchQuery, fines, filters])

  const resetFilters = () => {
    setFilters({
      fine_amount: null,
    })
  }

  const totalPages = Math.ceil(filteredFines.length / ITEMS_PER_PAGE)
  const paginatedData = filteredFines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleIssueFine = async (fine: FineAssessment) => {
    const fineId = `${fine.video_id}-${fine.vehicle_id}`
    setIssuingFineId(fineId)
    
    try {
      await updateFineAssessment(fine.video_id, fine.vehicle_id, {
        issuanceStatus: 'ISSUED'
      })
      await fetchFines()
    } catch (error) {
      console.error('Error issuing fine:', error)
    } finally {
      setIssuingFineId(null)
    }
  }

  const handleEdit = async (fine: FineAssessment) => {
    try {
      await updateFineAssessment(fine.video_id, fine.vehicle_id, {
        fine_amount: Number(editForm.fine_amount),
        reason: editForm.reason
      })
      await fetchFines()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating fine:', error)
    }
  }

  const handleDelete = async (fine: FineAssessment) => {
    if (!confirm('정말로 이 벌금을 삭제하시겠습니까?')) return

    try {
      await deleteFineAssessment(fine.video_id, fine.vehicle_id)
      await fetchFines()
    } catch (error) {
      console.error('Error deleting fine:', error)
    }
  }

  const handleCancel = async (fine: FineAssessment) => {
    try {
      await updateFineAssessment(fine.video_id, fine.vehicle_id, {
        issuanceStatus: 'PENDING'
      })
      await fetchFines()
    } catch (error) {
      console.error('Error canceling fine:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Table2 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">벌금 판단 결과</h2>
      </div>

      <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
        <div className="flex-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="데이터 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>마지막 업데이트: {lastUpdated}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={fetchFines}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              필터
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>필터 옵션</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-sm">벌금 금액</DropdownMenuLabel>
            {filterOptions.fine_amount.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => setFilters(prev => ({
                  ...prev,
                  fine_amount: option === '전체' ? null : option
                }))}
                className={filters.fine_amount === option ? "bg-accent" : ""}
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

      {filters.fine_amount && (
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>활성화된 필터:</span>
          <span className="bg-accent/50 px-2 py-1 rounded">
            벌금 금액: {filters.fine_amount}
          </span>
        </div>
      )}

      <Table>
       
        <TableHeader>
          <TableRow>
            <TableHead>영상 ID</TableHead>
            <TableHead>차량 ID</TableHead>
            <TableHead>벌금 금액</TableHead>
            <TableHead>사유</TableHead>
            <TableHead>발급 상태</TableHead>
            <TableHead className="w-[100px]">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((fine) => (
            <TableRow key={`${fine.video_id}-${fine.vehicle_id}`}>
              <TableCell>{fine.video_id}</TableCell>
              <TableCell>{fine.vehicle_id}</TableCell>
              <TableCell>{fine.fine_amount}</TableCell>
              <TableCell>{fine.reason}</TableCell>
              <TableCell>
                {fine.issuanceStatus === 'ISSUED' ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    발급 완료
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Clock8 className="h-3 w-3" />
                    발급 대기
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {fine.issuanceStatus === 'PENDING' ? (
                  <Button
                    size="sm"
                    onClick={() => handleIssueFine(fine)}
                    className="w-full"
                    disabled={issuingFineId === `${fine.video_id}-${fine.vehicle_id}`}
                  >
                    {issuingFineId === `${fine.video_id}-${fine.vehicle_id}` ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      '발급하기'
                    )}
                  </Button>
                ) : fine.issuanceStatus === 'ISSUED' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedFine(fine)
                          setEditForm({
                            fine_amount: fine.fine_amount.toString(),
                            reason: fine.reason
                          })
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(fine)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCancel(fine)}>
                        <Ban className="mr-2 h-4 w-4" />
                        발급 취소
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              >
                <PaginationPrevious />
              </PaginationLink>
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationLink
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <PaginationNext />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>벌금 정보 수정</DialogTitle>
            <DialogDescription>
              벌금 금액과 사유를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fine_amount">벌금 금액</Label>
              <Input
                id="fine_amount"
                value={editForm.fine_amount}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  fine_amount: e.target.value
                }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">사유</Label>
              <Input
                id="reason"
                value={editForm.reason}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={() => selectedFine && handleEdit(selectedFine)}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

