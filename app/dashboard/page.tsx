"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileVideo, AlertCircle, Receipt, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('')
  const [stats, setStats] = useState({
    uploads: 0,
    analyzed: 0,
    fines: 0,
    trend: 0
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name)
      }
    }
    getUser()
    fetchStats()
  }, [supabase.auth])

  const fetchStats = async () => {
    try {
      // 영상 업로드 및 분석 현황
      const { data: videoData, error: videoError } = await supabase
        .from('video_analyses')
        .select('status')

      if (videoError) throw videoError

      const uploads = videoData?.length || 0
      const analyzed = videoData?.filter(v => v.status === 'completed')?.length || 0

      // 벌금 현황
      const { data: fineData, error: fineError } = await supabase
        .from('fine_assessments')
        .select('created_at')

      if (fineError) throw fineError

      const fines = fineData?.length || 0

      // 전월 대비 증감률 계산
      const now = new Date()
      const thisMonth = now.getMonth()
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
      const thisYear = now.getFullYear()
      const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear

      const thisMonthData = fineData?.filter(fine => {
        const date = new Date(fine.created_at)
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear
      })

      const lastMonthData = fineData?.filter(fine => {
        const date = new Date(fine.created_at)
        return date.getMonth() === lastMonth && date.getFullYear() === lastYear
      })

      const thisMonthCount = thisMonthData?.length || 0
      const lastMonthCount = lastMonthData?.length || 0
      const trend = lastMonthCount === 0 
        ? 100 
        : Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)

      setStats({
        uploads,
        analyzed,
        fines,
        trend
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            환영합니다
            {userName && (
              <span className="text-primary"> {userName}</span>
            )}님!
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            WATCH 대시보드에서 영상 분석 현황을 확인하세요.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {/* 영상 업로드 현황 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">영상 업로드</CardTitle>
            <CardDescription>업로드된 영상 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileVideo className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.uploads}</div>
                <div className="text-sm text-muted-foreground">총 영상</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 분석 완료 현황 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">분석 완료</CardTitle>
            <CardDescription>영상 분석 완료 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.analyzed}</div>
                <div className="text-sm text-muted-foreground">완료됨</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 벌금 판단 현황 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">벌금 판단</CardTitle>
            <CardDescription>벌금 판단 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.fines}</div>
                <div className="text-sm text-muted-foreground">판단 완료</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전월 대비 증감률 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">증감률</CardTitle>
            <CardDescription>전월 대비</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.trend}%</div>
                <div className="text-sm text-muted-foreground">증가</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

