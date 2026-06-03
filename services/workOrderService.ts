import type { WorkOrder } from '@/types'

const LOCAL_WORK_ORDERS_KEY = 'tanctrax-work-orders'
export const WORK_ORDERS_UPDATED_EVENT = 'tanctrax-work-orders-updated'

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

function getLocalWorkOrders() {
  if (typeof window === 'undefined') return []

  try {
    const savedOrders = window.localStorage.getItem(LOCAL_WORK_ORDERS_KEY)
    return savedOrders ? JSON.parse(savedOrders) as WorkOrder[] : []
  } catch (error) {
    console.error('Error reading local work orders:', error)
    return []
  }
}

function saveLocalWorkOrders(orders: WorkOrder[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_WORK_ORDERS_KEY, JSON.stringify(orders))
  window.dispatchEvent(new Event(WORK_ORDERS_UPDATED_EVENT))
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function sortNewestFirst(orders: WorkOrder[]) {
  return [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

const inactiveStatuses = ['Completed', 'Closed', 'VOID']

async function fetchApiWorkOrders() {
  const response = await fetch('/api/work-orders')
  if (!response.ok) throw new Error('Failed to fetch work orders')
  return await response.json() as WorkOrder[]
}

function createLocalWorkOrder(input: CreateWorkOrderInput) {
  const newOrder: WorkOrder = {
    id: createLocalId(),
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

  const existingOrders = getLocalWorkOrders().filter(
    order => order.work_order_number !== newOrder.work_order_number
  )
  saveLocalWorkOrders([newOrder, ...existingOrders])
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem('tanctrax-last-created-work-order', JSON.stringify(newOrder))
  }

  return newOrder
}

export async function createWorkOrder(input: CreateWorkOrderInput) {
  try {
    const response = await fetch('/api/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) throw new Error('Failed to create work order')

    const newOrder = await response.json() as WorkOrder
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(WORK_ORDERS_UPDATED_EVENT))
      window.sessionStorage.setItem('tanctrax-last-created-work-order', JSON.stringify(newOrder))
    }
    return newOrder
  } catch (error) {
    console.error('Error creating work order through API:', error)
    return createLocalWorkOrder(input)
  }
}

export function takeLastCreatedWorkOrder() {
  if (typeof window === 'undefined') return null

  try {
    const savedOrder = window.sessionStorage.getItem('tanctrax-last-created-work-order')
    if (!savedOrder) return null

    window.sessionStorage.removeItem('tanctrax-last-created-work-order')
    return JSON.parse(savedOrder) as WorkOrder
  } catch (error) {
    console.error('Error reading last created work order:', error)
    return null
  }
}

export async function getWorkOrderById(id: string) {
  try {
    const response = await fetch(`/api/work-orders/${id}`)
    if (response.ok) return await response.json() as WorkOrder
  } catch (error) {
    console.error('Error fetching work order through API:', error)
  }

  return getLocalWorkOrders().find(order => order.id === id) || null
}

export async function completeWorkOrder(id: string, completedDate: string) {
  try {
    const response = await fetch(`/api/work-orders/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedDate }),
    })

    if (response.ok) {
      const updatedOrder = await response.json() as WorkOrder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(WORK_ORDERS_UPDATED_EVENT))
      }
      return updatedOrder
    }
  } catch (error) {
    console.error('Error completing work order through API:', error)
  }

  const completedAt = new Date(`${completedDate}T12:00:00`).toISOString()
  const localOrders = getLocalWorkOrders()
  const localOrder = localOrders.find(order => order.id === id)

  if (localOrder) {
    const updatedOrder: WorkOrder = {
      ...localOrder,
      status: 'Completed',
      completed_at: completedAt,
    }

    saveLocalWorkOrders(localOrders.map(order => order.id === id ? updatedOrder : order))
    return updatedOrder
  }

  return null
}

export async function voidWorkOrder(id: string) {
  try {
    const response = await fetch(`/api/work-orders/${id}/void`, {
      method: 'POST',
    })

    if (response.ok) {
      const updatedOrder = await response.json() as WorkOrder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(WORK_ORDERS_UPDATED_EVENT))
      }
      return updatedOrder
    }
  } catch (error) {
    console.error('Error voiding work order through API:', error)
  }

  const localOrders = getLocalWorkOrders()
  const localOrder = localOrders.find(order => order.id === id)

  if (localOrder) {
    const updatedOrder: WorkOrder = {
      ...localOrder,
      status: 'VOID',
    }

    saveLocalWorkOrders(localOrders.map(order => order.id === id ? updatedOrder : order))
    return updatedOrder
  }

  return null
}

export async function deleteWorkOrder(id: string) {
  try {
    const response = await fetch(`/api/work-orders/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(WORK_ORDERS_UPDATED_EVENT))
      }
      return true
    }
  } catch (error) {
    console.error('Error deleting work order through API:', error)
  }

  const localOrders = getLocalWorkOrders()
  const deleted = localOrders.some(order => order.id === id)
  if (deleted) {
    saveLocalWorkOrders(localOrders.filter(order => order.id !== id))
    return true
  }

  return false
}

export async function getWorkOrderStats() {
  try {
    const orders = [...await fetchApiWorkOrders(), ...getLocalWorkOrders()]
    return {
      total: orders.length,
      completed: orders.filter(o => o.status === 'Completed' || o.status === 'Closed').length,
      open: orders.filter(o => !inactiveStatuses.includes(o.status)).length,
    }
  } catch (error) {
    console.error('Error fetching work order stats through API:', error)
  }

  const localOrders = getLocalWorkOrders()
  return {
    total: localOrders.length,
    completed: localOrders.filter(o => o.status === 'Completed' || o.status === 'Closed').length,
    open: localOrders.filter(o => !inactiveStatuses.includes(o.status)).length,
  }
}

export async function getRecentWorkOrders(limit: number = 5) {
  try {
    return sortNewestFirst(await fetchApiWorkOrders()).slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent work orders:', error)
    return sortNewestFirst(getLocalWorkOrders()).slice(0, limit)
  }
}

export async function getActiveWorkOrders() {
  try {
    return sortNewestFirst([...await fetchApiWorkOrders(), ...getLocalWorkOrders()]).filter(
      order => !inactiveStatuses.includes(order.status)
    )
  } catch (error) {
    console.error('Error fetching active work orders through API:', error)
    return sortNewestFirst(getLocalWorkOrders()).filter(
      order => !inactiveStatuses.includes(order.status)
    )
  }
}

export async function getAllWorkOrders() {
  try {
    const response = await fetch('/api/work-orders')
    if (response.ok) {
      const apiOrders = await response.json() as WorkOrder[]
      return sortNewestFirst([...apiOrders, ...getLocalWorkOrders()])
    }
  } catch (error) {
    console.error('Error fetching all work orders through API:', error)
  }

  return sortNewestFirst(getLocalWorkOrders())
}

export async function getWorkOrdersByStatus() {
  try {
    const apiOrders = await fetchApiWorkOrders()
    const statusCounts: { [key: string]: number } = {}
    ;[...apiOrders, ...getLocalWorkOrders()].forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
    })
    return statusCounts
  } catch (error) {
    console.error('Error fetching work orders by status:', error)
    const statusCounts: { [key: string]: number } = {}
    getLocalWorkOrders().forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
    })
    return statusCounts
  }
}
