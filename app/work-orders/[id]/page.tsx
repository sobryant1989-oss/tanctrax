'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { completeWorkOrder, getWorkOrderById, voidWorkOrder } from '@/services/workOrderService'
import type { WorkOrder } from '@/types'
import { formatDate } from '@/utils/helpers'

const today = new Date().toISOString().slice(0, 10)

export default function WorkOrderDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [completionDate, setCompletionDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [voiding, setVoiding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkOrder = async () => {
      const order = await getWorkOrderById(params.id)
      setWorkOrder(order)
      setLoading(false)
    }

    fetchWorkOrder()
  }, [params.id])

  const handleComplete = async () => {
    setSaving(true)
    setError(null)

    const updatedOrder = await completeWorkOrder(params.id, completionDate)

    if (!updatedOrder) {
      setError('Unable to complete this work order. Please try again.')
      setSaving(false)
      return
    }

    setWorkOrder(updatedOrder)
    setSaving(false)
    router.push('/dashboard')
  }

  const handleVoid = async () => {
    if (!workOrder) return

    const confirmed = window.confirm(`Void work order ${workOrder.work_order_number}?`)
    if (!confirmed) return

    setVoiding(true)
    setError(null)

    try {
      const updatedOrder = await voidWorkOrder(params.id)
      if (!updatedOrder) {
        setError('Unable to void this work order. Please try again.')
        return
      }
      setWorkOrder(updatedOrder)
      router.push('/dashboard')
    } catch (err) {
      console.error('Error voiding work order:', err)
      setError('Unable to void this work order. Please try again.')
    } finally {
      setVoiding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-gray-600">Loading work order...</div>
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Work order not found</h1>
          <Link href="/dashboard" className="text-[#461D7C] hover:text-[#2b0f4f] font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isCompleted = ['Completed', 'Closed', 'VOID'].includes(workOrder.status)
  const summaryRows = [
    ['Work Order Number', workOrder.work_order_number],
    ['Status', workOrder.status],
    ['Date Created', formatDate(workOrder.created_at)],
    ['Engineer Name', workOrder.engineer_name || workOrder.created_by || '-'],
    ['Engineer Email', workOrder.engineer_email || workOrder.vendor_email || '-'],
    ['PCR SO#', workOrder.pcr_so_number || '-'],
    ['Building Name', workOrder.building],
    ['Room Number', workOrder.location],
    ['Scope of Work', workOrder.scope_of_work || workOrder.description],
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Work Order</h1>
          <div className="flex flex-wrap gap-3 items-center">
            {!isCompleted && (
              <button
                type="button"
                onClick={handleVoid}
                disabled={saving || voiding}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {voiding ? 'Voiding...' : 'Void Work Order'}
              </button>
            )}
            <Link href="/dashboard" className="text-[#461D7C] hover:text-[#2b0f4f] font-medium">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Work Order Number</p>
              <p className="text-2xl font-bold text-gray-900">{workOrder.work_order_number}</p>
            </div>
            <div className="md:text-right">
              <p className="text-sm font-medium text-gray-500 uppercase">Status</p>
              <p className="text-lg font-semibold text-gray-900">{workOrder.status}</p>
              {workOrder.completed_at && (
                <p className="text-sm text-gray-600">Completed {formatDate(workOrder.completed_at)}</p>
              )}
            </div>
          </div>

          <dl className="space-y-4">
            {summaryRows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-gray-100 last:border-b-0">
                <dt className="text-sm font-medium text-gray-600">{label}</dt>
                <dd className="md:col-span-2 text-sm text-gray-900 whitespace-pre-wrap">{value}</dd>
              </div>
            ))}
          </dl>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            {isCompleted ? (
              <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
                {workOrder.status === 'VOID' ? 'This work order has been voided.' : 'This work order is complete.'}
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div>
                    <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Completion <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="completionDate"
                      value={completionDate}
                      onChange={(event) => setCompletionDate(event.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={saving || voiding || !completionDate}
                    className="bg-[#FDD023] hover:bg-[#e5b800] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#461D7C] font-semibold py-2 px-6 rounded-lg transition"
                  >
                    {saving ? 'Completing...' : 'Complete Work Order'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleVoid}
                    disabled={saving || voiding}
                    className="w-full sm:w-auto rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {voiding ? 'Voiding...' : 'Void Work Order'}
                  </button>
                  <p className="text-sm text-gray-500">
                    Voiding removes the work order from open status.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
