'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import WorkOrdersSpreadsheet from '@/components/WorkOrdersSpreadsheet'
import { getAllWorkOrders, takeLastCreatedWorkOrder, WORK_ORDERS_UPDATED_EVENT } from '@/services/workOrderService'
import type { WorkOrder } from '@/types'

function WorkOrdersContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const allOrders = await getAllWorkOrders()
      const lastCreatedOrder = takeLastCreatedWorkOrder()
      const nextOrders = lastCreatedOrder
        ? [lastCreatedOrder, ...allOrders.filter(order => order.id !== lastCreatedOrder.id)]
        : allOrders

      setOrders(nextOrders)
      setLoading(false)
    }

    fetchOrders()

    window.addEventListener('focus', fetchOrders)
    window.addEventListener(WORK_ORDERS_UPDATED_EVENT, fetchOrders)
    return () => {
      window.removeEventListener('focus', fetchOrders)
      window.removeEventListener(WORK_ORDERS_UPDATED_EVENT, fetchOrders)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Work Order History</h1>
          <Link
            href="/work-orders/new"
            className="bg-[#FDD023] hover:bg-[#e5b800] text-[#461D7C] font-semibold py-2 px-6 rounded-lg transition"
          >
            + New Work Order
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Work Orders</h2>
          {loading ? (
            <div className="py-12 text-center text-gray-600">Loading work orders...</div>
          ) : (
            <WorkOrdersSpreadsheet orders={orders} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function WorkOrders() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6">Loading work orders...</div>}>
      <WorkOrdersContent />
    </Suspense>
  )
}
