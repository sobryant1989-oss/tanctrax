import { NextResponse } from 'next/server'
import { createWorkOrder, getAllWorkOrders } from '@/lib/workOrderRepository'
import type { WorkOrder } from '@/types'
import { sendWorkOrderNotificationEmail, WorkOrderEmailData } from '@/lib/email'

type CreateWorkOrderRequest = {
  workOrderNumber: string
  generatedAt: string
  engineerName: string
  engineerEmail: string
  pcrSoNumber: string
  buildingAbbr: string
  building: string
  roomNumber: string
  scopeOfWork: string
}

export async function GET() {
  const orders = await getAllWorkOrders()
  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const input = await request.json() as CreateWorkOrderRequest
  const newOrder = await createWorkOrder(input)

  ;(async () => {
    try {
      await sendWorkOrderNotificationEmail(input as WorkOrderEmailData)
    } catch (err) {
      console.error('Failed to send work order notification email:', err)
    }
  })()

  return NextResponse.json(newOrder, { status: 201 })
}
