'use client'

import React from 'react'
import type { WorkOrder } from '@/types'
import { formatDate, getStatusColor } from '@/utils/helpers'

interface WorkOrdersTableProps {
  orders: WorkOrder[]
}

export default function WorkOrdersTable({ orders }: WorkOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No work orders found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Work Order #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Building
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-medium text-[#461D7C]">
                {order.work_order_number}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{order.building}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium">{order.priority}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{order.vendor_email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(order.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
