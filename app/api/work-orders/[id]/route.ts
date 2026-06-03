import { NextResponse } from 'next/server'
import { deleteWorkOrder, getWorkOrderById } from '@/lib/workOrderRepository'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getWorkOrderById(id)

  if (!order) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await deleteWorkOrder(id)

  if (!deleted) {
    return NextResponse.json({ error: 'Work order not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
