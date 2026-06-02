import { NextResponse } from 'next/server'
import { updateWorkOrderStatus } from '@/lib/workOrderRepository'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { completedDate } = await request.json() as { completedDate: string }
  const completedAt = new Date(`${completedDate}T12:00:00`).toISOString()
  const updatedOrder = await updateWorkOrderStatus({
    id,
    status: 'Completed',
    completedAt,
  })

  if (!updatedOrder) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
  }

  return NextResponse.json(updatedOrder)
}
