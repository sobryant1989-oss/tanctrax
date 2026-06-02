import { NextResponse } from 'next/server'
import { updateWorkOrderStatus } from '@/lib/workOrderRepository'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updatedOrder = await updateWorkOrderStatus({
    id,
    status: 'VOID',
    completedAt: null,
  })

  if (!updatedOrder) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
  }

  return NextResponse.json(updatedOrder)
}
