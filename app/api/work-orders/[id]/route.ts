import { NextResponse } from 'next/server'
import { readStoredWorkOrders } from '@/lib/workOrderStore'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orders = await readStoredWorkOrders()
  const order = orders.find(item => item.id === id)

  if (!order) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}
