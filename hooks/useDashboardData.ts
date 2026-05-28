'use client'

import { useEffect, useState } from 'react'
import { getWorkOrderStats, getRecentWorkOrders, getWorkOrdersByStatus } from '@/services/workOrderService'
import type { WorkOrder } from '@/types'

interface DashboardData {
  stats: { total: number; completed: number; open: number }
  recentOrders: WorkOrder[]
  statusCounts: { [key: string]: number }
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    stats: { total: 0, completed: 0, open: 0 },
    recentOrders: [],
    statusCounts: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, orders, statusCounts] = await Promise.all([
          getWorkOrderStats(),
          getRecentWorkOrders(10),
          getWorkOrdersByStatus(),
        ])

        setData({ stats, recentOrders: orders, statusCounts })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}