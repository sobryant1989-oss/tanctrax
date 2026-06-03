'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import MetricCard from './MetricCard'
import ActiveWorkOrdersTable from './ActiveWorkOrdersTable'
import MajorProjectCard from './MajorProjectCard'
import { getMajorProjects } from '@/services/majorProjectService'
import { deleteWorkOrder, getActiveWorkOrders, getWorkOrderStats, voidWorkOrder, WORK_ORDERS_UPDATED_EVENT } from '@/services/workOrderService'
import type { MajorProject, WorkOrder } from '@/types'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, open: 0 })
  const [activeOrders, setActiveOrders] = useState<WorkOrder[]>([])
  const [majorProjects, setMajorProjects] = useState<MajorProject[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsData, ordersData, projectData] = await Promise.all([
        getWorkOrderStats(),
        getActiveWorkOrders(),
        getMajorProjects(),
      ])

      setStats(statsData)
      setActiveOrders(ordersData)
      setMajorProjects(projectData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const needsAttentionCount = activeOrders.filter(order => {
    const createdAt = new Date(order.created_at).getTime()
    const threeWeeksAgo = Date.now() - (21 * 24 * 60 * 60 * 1000)
    return createdAt <= threeWeeksAgo
  }).length

  useEffect(() => {
    fetchData()

    window.addEventListener('focus', fetchData)
    window.addEventListener(WORK_ORDERS_UPDATED_EVENT, fetchData)
    return () => {
      window.removeEventListener('focus', fetchData)
      window.removeEventListener(WORK_ORDERS_UPDATED_EVENT, fetchData)
    }
  }, [fetchData])

  const handleVoidWorkOrder = async (id: string) => {
    const updatedOrder = await voidWorkOrder(id)
    if (updatedOrder) {
      await fetchData()
    }
  }

  const handleDeleteWorkOrder = async (id: string) => {
    const deleted = await deleteWorkOrder(id)
    if (deleted) {
      await fetchData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDD023] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <img
            src="/tanctrax-logo.png"
            alt="TancTrax Dashboard"
            className="h-28 max-w-full object-contain"
          />
          <Link
            href="/work-orders/new"
            className="bg-[#FDD023] hover:bg-[#e5b800] text-[#461D7C] font-semibold py-2 px-6 rounded-lg transition text-center"
          >
            Create New Work Order
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            label="GM Cable Open Tickets"
            value={stats.open}
            color="purple"
            backgroundImage="/gm-cable.jpg"
          />
          <MetricCard
            label="Needs Attention (Orders Older than 21 days)"
            value={needsAttentionCount}
            color="orange"
            icon="!"
          />
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Work Orders</h2>
            <ActiveWorkOrdersTable
              orders={activeOrders}
              onVoidWorkOrder={handleVoidWorkOrder}
              onDeleteWorkOrder={handleDeleteWorkOrder}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-gray-900">Project Tracker</h2>
              <Link
                href="/major-projects"
                className="text-sm font-semibold text-[#461D7C] hover:underline"
              >
                View Major Projects
              </Link>
            </div>

            {majorProjects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#461D7C]/30 bg-[#f7f2ff] px-6 py-12 text-center">
                <p className="text-lg font-semibold text-[#461D7C]">No major projects yet</p>
                <p className="mt-2 text-sm text-gray-600">Create a major project to track phase progress here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {majorProjects.map(project => (
                  <MajorProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
