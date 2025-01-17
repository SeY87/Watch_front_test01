'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ModeToggle } from '@/components/ModeToggle'
import { Slider } from '@/components/ui/slider'

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState(16)

  // 글씨 크기 설정 불러오기
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize')
    if (savedFontSize) {
      setFontSize(Number(savedFontSize))
      document.documentElement.style.fontSize = `${savedFontSize}px`
    }
  }, [])

  // 글씨 크기 변경 처리
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0]
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}px`
    localStorage.setItem('fontSize', String(newSize))
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>환경설정</CardTitle>
          <CardDescription>
            앱의 설정을 변경할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>테마 설정</Label>
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <span className="text-sm text-muted-foreground">
                라이트 모드, 다크 모드를 선택할 수 있습니다.
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <Label>글씨 크기 설정</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">작게</span>
                <span className="text-sm font-medium">{fontSize}px</span>
                <span className="text-sm">크게</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                글씨 크기를 조절하여 가독성을 개선할 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 