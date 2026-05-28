import { NextResponse } from 'next/server'
import { readStoredWorkOrders, writeStoredWorkOrders } from '@/lib/workOrderStore'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { completedDate } = await request.json() as { completedDate: string }
  const orders = await readStoredWorkOrders()
  const order = orders.find(item => item.id === id)

  if (!order) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
  }

  const completedAt = new Date(`${completedDate}T12:00:00`).toISOString()
  const updatedOrder = {
    ...order,
    status: 'Completed' as const,
    completed_at: completedAt,
  }

  await writeStoredWorkOrders(orders.map(item => item.id === id ? updatedOrder : item))

  return NextResponse.json(updatedOrder)
}
