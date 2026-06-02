import { randomUUID } from 'crypto'
import { db } from './db'
import type { WorkOrder } from '@/types'

type CreateWorkOrderInput = {
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

type UpdateWorkOrderStatusInput = {
  id: string
  status: 'Completed' | 'VOID'
  completedAt?: string | null
}

function normalizeWorkOrder(row: any): WorkOrder {
  return {
    id: String(row.id),
    work_order_number: String(row.work_order_number),
    building: String(row.building),
    building_abbr: row.building_abbr === null ? undefined : String(row.building_abbr),
    engineer_name: row.engineer_name === null ? undefined : String(row.engineer_name),
    engineer_email: row.engineer_email === null ? undefined : String(row.engineer_email),
    pcr_so_number: row.pcr_so_number === null ? undefined : String(row.pcr_so_number),
    scope_of_work: row.scope_of_work === null ? undefined : String(row.scope_of_work),
    location: String(row.location),
    description: String(row.description ?? ''),
    vendor_id: row.vendor_id === null ? '' : String(row.vendor_id),
    vendor_email: row.vendor_email === null ? '' : String(row.vendor_email),
    priority: String(row.priority) as WorkOrder['priority'],
    status: String(row.status) as WorkOrder['status'],
    estimated_cost: typeof row.estimated_cost === 'string' ? parseFloat(row.estimated_cost) : Number(row.estimated_cost),
    actual_cost: typeof row.actual_cost === 'string' ? parseFloat(row.actual_cost) : Number(row.actual_cost),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    completed_at: row.completed_at instanceof Date ? row.completed_at.toISOString() : row.completed_at === null ? null : String(row.completed_at),
    created_by: String(row.created_by),
  }
}

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  const result = await db.query('SELECT * FROM work_orders ORDER BY created_at DESC')
  return result.rows.map(normalizeWorkOrder)
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  const result = await db.query('SELECT * FROM work_orders WHERE id = $1', [id])
  if (result.rowCount === 0) return null
  return normalizeWorkOrder(result.rows[0])
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const id = randomUUID()
  const query = `
    INSERT INTO work_orders (
      id,
      work_order_number,
      building,
      building_abbr,
      engineer_name,
      engineer_email,
      pcr_so_number,
      scope_of_work,
      location,
      description,
      vendor_id,
      vendor_email,
      priority,
      status,
      estimated_cost,
      actual_cost,
      created_at,
      completed_at,
      created_by
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
    ) RETURNING *
  `
  const values = [
    id,
    input.workOrderNumber,
    input.building,
    input.buildingAbbr,
    input.engineerName,
    input.engineerEmail,
    input.pcrSoNumber,
    input.scopeOfWork,
    input.roomNumber,
    input.scopeOfWork,
    null,
    input.engineerEmail,
    'Medium',
    'New',
    0,
    0,
    input.generatedAt,
    null,
    input.engineerName,
  ]
  const result = await db.query(query, values)
  return normalizeWorkOrder(result.rows[0])
}

export async function updateWorkOrderStatus(input: UpdateWorkOrderStatusInput): Promise<WorkOrder | null> {
  const query = `
    UPDATE work_orders
    SET status = $2,
        completed_at = $3
    WHERE id = $1
    RETURNING *
  `
  const values = [input.id, input.status, input.completedAt ?? null]
  const result = await db.query(query, values)
  if (result.rowCount === 0) return null
  return normalizeWorkOrder(result.rows[0])
}
