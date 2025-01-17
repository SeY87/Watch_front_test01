import { NextResponse } from 'next/server'
import { fineStore } from '@/lib/store'

export async function GET() {
  try {
    const fines = fineStore.getFines()
    return NextResponse.json(fines)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fines' }, { status: 500 })
  }
}

