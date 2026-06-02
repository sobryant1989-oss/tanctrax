'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import type { WorkOrder } from '@/types'
import { formatDate } from '@/utils/helpers'
import { voidWorkOrder } from '@/services/workOrderService'

type WorkOrderRow = WorkOrder & {
  engineer_name?: string | null
  pcr_so_number?: string | null
  scope_of_work?: string | null
}

type ColumnKey = 'workOrderNumber' | 'dateCreated' | 'status' | 'engineerName' | 'pcrSoNumber' | 'buildingName' | 'scopeOfWork'
type SortDirection = 'asc' | 'desc'

const columns: { key: ColumnKey; label: string; width: number }[] = [
  { key: 'workOrderNumber', label: 'Work Order Number', width: 190 },
  { key: 'dateCreated', label: 'Date Created', width: 150 },
  { key: 'status', label: 'Status', width: 150 },
  { key: 'engineerName', label: 'Engineer Name', width: 190 },
  { key: 'pcrSoNumber', label: 'PCR SO#', width: 140 },
  { key: 'buildingName', label: 'Building Name', width: 260 },
  { key: 'scopeOfWork', label: 'Scope of Work', width: 360 },
]

const emptyFilters = {
  workOrderNumber: '',
  dateCreated: '',
  status: '',
  engineerName: '',
  pcrSoNumber: '',
  buildingName: '',
  scopeOfWork: '',
}

export default function WorkOrdersSpreadsheet({ orders }: { orders: WorkOrderRow[] }) {
  const [openMenu, setOpenMenu] = useState<ColumnKey | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey; direction: SortDirection } | null>(null)
  const [filters, setFilters] = useState<Record<ColumnKey, string>>(emptyFilters)
  const [hiddenColumns, setHiddenColumns] = useState<ColumnKey[]>([])
  const [voidingId, setVoidingId] = useState<string | null>(null)

  const isOpenStatus = (status: string) => !['Completed', 'Closed', 'VOID'].includes(status)

  const handleVoidAction = async (id: string, workOrderNumber: string) => {
    if (voidingId || !isOpenStatus(orders.find(order => order.id === id)?.status || '')) {
      return
    }

    const confirmed = window.confirm(`Void work order ${workOrderNumber}?`)
    if (!confirmed) return

    try {
      setVoidingId(id)
      await voidWorkOrder(id)
    } catch (error) {
      console.error('Unable to void work order:', error)
      window.alert('Unable to void the work order. Please try again.')
    } finally {
      setVoidingId(null)
    }
  }

  const rows = useMemo(() => orders.map(order => ({
    id: order.id,
    workOrderNumber: order.work_order_number,
    dateCreated: formatDate(order.created_at),
    status: order.status,
    engineerName: order.engineer_name || order.created_by || '-',
    pcrSoNumber: order.pcr_so_number || '-',
    buildingName: order.building,
    scopeOfWork: order.scope_of_work || order.description || '-',
  })), [orders])

  const visibleColumns = columns.filter(column => !hiddenColumns.includes(column.key))

  const filteredRows = useMemo(() => rows.filter(row =>
    columns.every(column => {
      const filterValue = filters[column.key].trim().toLowerCase()
      return !filterValue || row[column.key].toLowerCase().includes(filterValue)
    })
  ), [filters, rows])

  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows
    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortConfig.key].toLowerCase()
      const bValue = b[sortConfig.key].toLowerCase()
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredRows, sortConfig])

  const filterOptions = useMemo(() => columns.reduce((options, column) => {
    options[column.key] = Array.from(new Set(rows.map(row => row[column.key]).filter(Boolean))).sort()
    return options
  }, {} as Record<ColumnKey, string[]>), [rows])

  const setFilter = (key: ColumnKey, value: string) => setFilters(prev => ({ ...prev, [key]: value }))
  const hasFilters = Object.values(filters).some(Boolean)

  if (orders.length === 0) {
    return <div className="text-center py-12 text-gray-500 text-lg">No work orders found</div>
  }

  return (
    <div className="border border-[#461D7C]/30 bg-white">
      <div className="flex items-center justify-between border-b border-[#461D7C]/30 bg-[#f7f2ff] px-3 py-2">
        <p className="text-sm font-medium text-[#461D7C]">Showing {sortedRows.length} of {rows.length} work orders</p>
        <div className="flex gap-4">
          {hasFilters && <button type="button" onClick={() => setFilters(emptyFilters)} className="text-sm font-medium text-[#461D7C] hover:text-[#2b0f4f]">Clear filters</button>}
          {hiddenColumns.length > 0 && <button type="button" onClick={() => setHiddenColumns([])} className="text-sm font-medium text-[#461D7C] hover:text-[#2b0f4f]">Show hidden columns</button>}
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[1320px] border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 z-20 bg-[#461D7C]">
              <th className="w-12 border-b border-r border-[#FDD023]/60 px-2 py-2 text-center text-xs font-semibold text-white">#</th>
              {visibleColumns.map(column => (
                <th key={column.key} style={{ width: column.width, minWidth: column.width }} className="relative border-b border-r border-[#FDD023]/60 px-3 py-2 text-left text-xs font-semibold text-white uppercase">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{column.label}{filters[column.key] && <span className="ml-1 text-[#FDD023]">FILTER</span>}</span>
                    <button type="button" onClick={() => setOpenMenu(openMenu === column.key ? null : column.key)} className="shrink-0 rounded p-1 text-white hover:bg-[#FDD023] hover:text-[#461D7C]" aria-label={`${column.label} menu`}>
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  {openMenu === column.key && (
                    <div className="absolute right-2 top-9 z-30 w-64 border border-gray-300 bg-white py-2 text-sm font-normal normal-case text-gray-800 shadow-lg">
                      <div className="border-b border-gray-200 px-3 pb-3">
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Search column</label>
                        <input type="search" value={filters[column.key]} onChange={(event) => setFilter(column.key, event.target.value)} placeholder={`Search ${column.label}`} className="w-full border border-gray-300 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#FDD023]" />
                        <label className="mb-1 mt-3 block text-xs font-semibold uppercase text-gray-600">Filter by value</label>
                        <select value={filters[column.key]} onChange={(event) => setFilter(column.key, event.target.value)} className="w-full border border-gray-300 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#FDD023]">
                          <option value="">All values</option>
                          {filterOptions[column.key].map(value => <option key={value} value={value}>{value}</option>)}
                        </select>
                        {filters[column.key] && <button type="button" onClick={() => setFilter(column.key, '')} className="mt-2 text-sm font-medium text-[#461D7C] hover:text-[#2b0f4f]">Clear this filter</button>}
                      </div>
                      <button type="button" onClick={() => { setSortConfig({ key: column.key, direction: 'asc' }); setOpenMenu(null) }} className="block w-full px-3 py-2 text-left hover:bg-gray-100">Sort ascending</button>
                      <button type="button" onClick={() => { setSortConfig({ key: column.key, direction: 'desc' }); setOpenMenu(null) }} className="block w-full px-3 py-2 text-left hover:bg-gray-100">Sort descending</button>
                      <button type="button" onClick={() => { setHiddenColumns(prev => [...prev, column.key]); setOpenMenu(null) }} className="block w-full px-3 py-2 text-left hover:bg-gray-100">Hide column</button>
                    </div>
                  )}
                </th>
              ))}
              <th className="w-24 border-b border-[#FDD023]/60 px-3 py-2 text-left text-xs font-semibold text-white uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-[#fff8d6] transition-colors">
                <td className="border-b border-r border-gray-300 bg-gray-50 px-2 py-2 text-center text-xs text-gray-500">{index + 1}</td>
                {visibleColumns.map(column => (
                  <td key={column.key} style={{ width: column.width, minWidth: column.width }} className="border-b border-r border-gray-300 px-3 py-2 text-gray-900">
                    {column.key === 'workOrderNumber' ? <Link href={`/work-orders/${row.id}`} className="font-medium text-[#461D7C] hover:underline">{row[column.key]}</Link> : <p className={column.key === 'scopeOfWork' ? 'max-w-xl whitespace-pre-wrap' : 'truncate'}>{row[column.key]}</p>}
                  </td>
                ))}
                <td className="border-b border-gray-300 px-3 py-2 text-gray-900">
                  {isOpenStatus(row.status) ? (
                    <button
                      type="button"
                      onClick={() => handleVoidAction(row.id, row.workOrderNumber)}
                      disabled={voidingId === row.id}
                      className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {voidingId === row.id ? 'Voiding...' : 'Void'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
