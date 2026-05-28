import { promises as fs } from 'fs'
import path from 'path'
import type { WorkOrder } from '@/types'

const dataDir = path.join(process.cwd(), 'data')
const dataFile = path.join(dataDir, 'work-orders.json')

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true })

  try {
    await fs.access(dataFile)
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8')
  }
}

export async function readStoredWorkOrders() {
  await ensureStore()

  const file = await fs.readFile(dataFile, 'utf8')
  return JSON.parse(file) as WorkOrder[]
}

export async function writeStoredWorkOrders(orders: WorkOrder[]) {
  await ensureStore()
  await fs.writeFile(dataFile, JSON.stringify(orders, null, 2), 'utf8')
}

export function sortWorkOrdersNewestFirst(orders: WorkOrder[]) {
  return [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
