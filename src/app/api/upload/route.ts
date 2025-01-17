import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
  }

  // Here you would typically save the file to your server or cloud storage
  // For this example, we'll just return a success message
  console.log(`File received: ${file.name}`)

  return NextResponse.json({ success: true, message: 'File uploaded successfully' })
}

