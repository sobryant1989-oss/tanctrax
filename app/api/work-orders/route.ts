import { NextResponse } from 'next/server'
import { readStoredWorkOrders, sortWorkOrdersNewestFirst, writeStoredWorkOrders } from '@/lib/workOrderStore'
import type { WorkOrder } from '@/types'

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

function createId() {
  return `wo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function GET() {
  const orders = await readStoredWorkOrders()
  return NextResponse.json(sortWorkOrdersNewestFirst(orders))
}

export async function POST(request: Request) {
  const input = await request.json() as CreateWorkOrderRequest
  const orders = await readStoredWorkOrders()

  const newOrder: WorkOrder = {
    id: createId(),
    work_order_number: input.workOrderNumber,
    building: input.building,
    building_abbr: input.buildingAbbr,
    engineer_name: input.engineerName,
    engineer_email: input.engineerEmail,
    pcr_so_number: input.pcrSoNumber,
    scope_of_work: input.scopeOfWork,
    location: input.roomNumber,
    description: input.scopeOfWork,
    vendor_id: '',
    vendor_email: input.engineerEmail,
    priority: 'Medium',
    status: 'New',
    estimated_cost: 0,
    actual_cost: 0,
    created_at: input.generatedAt,
    completed_at: null,
    created_by: input.engineerName,
  }

  const nextOrders = [
    newOrder,
    ...orders.filter(order => order.work_order_number !== newOrder.work_order_number),
  ]

  await writeStoredWorkOrders(nextOrders)

  return NextResponse.json(newOrder, { status: 201 })
}
