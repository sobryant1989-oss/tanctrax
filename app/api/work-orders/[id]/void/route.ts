import { NextResponse } from 'next/server'
import { readStoredWorkOrders, writeStoredWorkOrders } from '@/lib/workOrderStore'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orders = await readStoredWorkOrders()
  const order = orders.find(item => item.id === id)

  if (!order) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
  }

  const updatedOrder = {
    ...order,
    status: 'VOID' as const,
  }

  await writeStoredWorkOrders(orders.map(item => item.id === id ? updatedOrder : item))

  return NextResponse.json(updatedOrder)
}
