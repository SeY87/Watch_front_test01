"use client"

import { FileUpload } from '@/components/FileUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">영상 업로드</h1>
          <p className="text-lg text-muted-foreground mt-2">
            분석할 영상을 업로드하세요.
          </p>
        </div>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Upload className="h-5 w-5" />
            파일 업로드
          </CardTitle>
          <CardDescription>
            분석할 영상 파일을 여기에 업로드하세요. 지원 형식: MP4, AVI, MOV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload />
        </CardContent>
      </Card>
    </div>
  )
}

