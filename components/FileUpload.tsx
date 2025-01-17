"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setUploadProgress(100)
        console.log(data.message)
      } else {
        console.error(data.message)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>파일을 여기에 놓으세요...</p>
      ) : (
        <p>파일을 드래그 앤 드롭하거나 클릭하여 선택하세요</p>
      )}
      {uploadProgress > 0 && <Progress value={uploadProgress} className="mt-4" />}
      <Button className="mt-4">파일 선택</Button>
    </div>
  )
}

