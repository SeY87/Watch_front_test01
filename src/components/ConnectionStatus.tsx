"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from 'lucide-react'

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://your-backend-url/health')
        setIsConnected(response.ok)
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Alert variant={isConnected ? "default" : "destructive"}>
      {isConnected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <AlertTitle>백엔드 연결 상태</AlertTitle>
      <AlertDescription>
        {isConnected ? "백엔드가 정상적으로 연결되었습니다." : "백엔드 연결에 실패했습니다."}
      </AlertDescription>
    </Alert>
  )
}

