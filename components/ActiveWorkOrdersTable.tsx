'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import type { WorkOrder } from '@/types'
import { formatDate } from '@/utils/helpers'

type ActiveWorkOrder = WorkOrder & {
  engineer_name?: string | null
  engineerName?: string | null
  pcr_so_number?: string | null
  pcrSoNumber?: string | null
  scope_of_work?: string | null
  scopeOfWork?: string | null
}

interface ActiveWorkOrdersTableProps {
  orders: ActiveWorkOrder[]
  onVoidWorkOrder?: (id: string) => Promise<void> | void
}

const emptyValue = '-'

type FilterKey = 'workOrderNumber' | 'dateCreated' | 'engineerName' | 'pcrSoNumber' | 'buildingName' | 'scopeOfWork'

type SortDirection = 'asc' | 'desc'

const columns: { key: FilterKey; label: string; width: number }[] = [
  { key: 'workOrderNumber', label: 'Work Order Number', width: 190 },
  { key: 'dateCreated', label: 'Date Created', width: 150 },
  { key: 'engineerName', label: 'Engineer Name', width: 190 },
  { key: 'pcrSoNumber', label: 'PCR SO#', width: 140 },
  { key: 'buildingName', label: 'Building Name', width: 260 },
  { key: 'scopeOfWork', label: 'Scope of Work', width: 360 },
]

export default function ActiveWorkOrdersTable({ orders, onVoidWorkOrder }: ActiveWorkOrdersTableProps) {
  const [openMenu, setOpenMenu] = useState<FilterKey | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: FilterKey; direction: SortDirection } | null>(null)
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    workOrderNumber: '',
    dateCreated: '',
    engineerName: '',
    pcrSoNumber: '',
    buildingName: '',
    scopeOfWork: '',
  })
  const [hiddenColumns, setHiddenColumns] = useState<FilterKey[]>([])
  const [pinnedColumns, setPinnedColumns] = useState<FilterKey[]>([])
  const [columnWidths, setColumnWidths] = useState<Record<FilterKey, number>>({
    workOrderNumber: 190,
    dateCreated: 150,
    engineerName: 190,
    pcrSoNumber: 140,
    buildingName: 260,
    scopeOfWork: 360,
  })
  const [voidingId, setVoidingId] = useState<string | null>(null)

  const tableRows = useMemo(() => {
    return orders.map(order => {
      const engineerName = order.engineer_name ?? order.engineerName ?? emptyValue
      const pcrSoNumber = order.pcr_so_number ?? order.pcrSoNumber ?? emptyValue
      const scopeOfWork = order.scope_of_work ?? order.scopeOfWork ?? order.description ?? emptyValue
      const dateCreated = formatDate(order.created_at)

      return {
        id: order.id,
        workOrderNumber: order.work_order_number,
        dateCreated,
        engineerName,
        pcrSoNumber,
        buildingName: order.building,
        scopeOfWork,
      }
    })
  }, [orders])

  const visibleColumns = useMemo(() => {
    const pinned = columns.filter(column => pinnedColumns.includes(column.key) && !hiddenColumns.includes(column.key))
    const unpinned = columns.filter(column => !pinnedColumns.includes(column.key) && !hiddenColumns.includes(column.key))
    return [...pinned, ...unpinned]
  }, [hiddenColumns, pinnedColumns])

  const filteredRows = useMemo(() => {
    return tableRows.filter(row =>
      columns.every(column => {
        const filterValue = filters[column.key].trim().toLowerCase()
        if (!filterValue) return true

        return row[column.key].toLowerCase().includes(filterValue)
      })
    )
  }, [filters, tableRows])

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

  const filterOptions = useMemo(() => {
    return columns.reduce((options, column) => {
      options[column.key] = Array.from(new Set(tableRows.map(row => row[column.key]).filter(Boolean))).sort()
      return options
    }, {} as Record<FilterKey, string[]>)
  }, [tableRows])

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilter = (key: FilterKey) => {
    handleFilterChange(key, '')
  }

  const handleSort = (key: FilterKey, direction: SortDirection) => {
    setSortConfig({ key, direction })
    setOpenMenu(null)
  }

  const handleAutosize = (key: FilterKey) => {
    const column = columns.find(item => item.key === key)
    const labelLength = column?.label.length ?? 12
    const longestValueLength = tableRows.reduce(
      (longest, row) => Math.max(longest, row[key].length),
      labelLength
    )
    const width = Math.min(Math.max(longestValueLength * 8 + 48, 120), 520)

    setColumnWidths(prev => ({
      ...prev,
      [key]: width,
    }))
    setOpenMenu(null)
  }

  const handleTogglePin = (key: FilterKey) => {
    setPinnedColumns(prev =>
      prev.includes(key) ? prev.filter(columnKey => columnKey !== key) : [...prev, key]
    )
    setOpenMenu(null)
  }

  const handleHide = (key: FilterKey) => {
    setHiddenColumns(prev => [...prev, key])
    setPinnedColumns(prev => prev.filter(columnKey => columnKey !== key))
    setOpenMenu(null)
  }

  const resetHiddenColumns = () => {
    setHiddenColumns([])
    setOpenMenu(null)
  }

  const resetFilters = () => {
    setFilters({
      workOrderNumber: '',
      dateCreated: '',
      engineerName: '',
      pcrSoNumber: '',
      buildingName: '',
      scopeOfWork: '',
    })
  }

  const handleVoidClick = async (id: string, workOrderNumber: string) => {
    if (!onVoidWorkOrder) return
    const confirmed = window.confirm(`Void work order ${workOrderNumber}?`)
    if (!confirmed) return

    setVoidingId(id)
    await onVoidWorkOrder(id)
    setVoidingId(null)
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No active work orders found</p>
      </div>
    )
  }

  return (
    <div className="border border-[#461D7C]/30 bg-white">
          <div className="flex items-center justify-between border-b border-[#461D7C]/30 bg-[#f7f2ff] px-3 py-2">
        <p className="text-sm font-medium text-[#461D7C]">
          Showing {sortedRows.length} of {tableRows.length} active work orders
        </p>
        <div className="flex items-center gap-4">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-[#461D7C] hover:text-[#2b0f4f]"
            >
              Clear filters
            </button>
          )}
          {hiddenColumns.length > 0 && (
            <button
              type="button"
              onClick={resetHiddenColumns}
              className="text-sm font-medium text-[#461D7C] hover:text-[#2b0f4f]"
            >
              Show hidden columns
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[1300px] border-collapse text-sm">
          <thead>
          <tr className="sticky top-0 z-20 bg-[#461D7C]">
            <th className="w-12 border-b border-r border-[#FDD023]/60 px-2 py-2 text-center text-xs font-semibold text-white">
              #
            </th>
            {visibleColumns.map(column => (
              <th
                key={column.key}
                style={{ width: columnWidths[column.key], minWidth: columnWidths[column.key] }}
                className="relative border-b border-r border-[#FDD023]/60 px-3 py-2 text-left text-xs font-semibold text-white uppercase"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {column.label}
                    {sortConfig?.key === column.key && (
                      <span className="ml-1 text-[#FDD023]">
                        {sortConfig.direction === 'asc' ? 'ASC' : 'DESC'}
                      </span>
                    )}
                    {pinnedColumns.includes(column.key) && (
                      <span className="ml-1 text-[#FDD023]">PIN</span>
                    )}
                    {filters[column.key] && (
                      <span className="ml-1 text-[#FDD023]">FILTER</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === column.key ? null : column.key)}
                    className="shrink-0 rounded p-1 text-white hover:bg-[#FDD023] hover:text-[#461D7C]"
                    aria-label={`${column.label} column menu`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {openMenu === column.key && (
                  <div className="absolute right-2 top-9 z-30 w-64 border border-gray-300 bg-white py-2 text-sm font-normal normal-case text-gray-800 shadow-lg">
                    <div className="border-b border-gray-200 px-3 pb-3">
                      <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">
                        Search column
                      </label>
                      <input
                        type="search"
                        value={filters[column.key]}
                        onChange={(event) => handleFilterChange(column.key, event.target.value)}
                        placeholder={`Search ${column.label}`}
                        className="w-full border border-gray-300 px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none"
                      />
                      <label className="mb-1 mt-3 block text-xs font-semibold uppercase text-gray-600">
                        Filter by value
                      </label>
                      <select
                        value={filters[column.key]}
                        onChange={(event) => handleFilterChange(column.key, event.target.value)}
                        className="w-full border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none"
                      >
                        <option value="">All values</option>
                        {filterOptions[column.key].map(value => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      {filters[column.key] && (
                        <button
                          type="button"
                          onClick={() => clearFilter(column.key)}
                          className="mt-2 text-sm font-medium text-[#461D7C] hover:text-[#2b0f4f]"
                        >
                          Clear this filter
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSort(column.key, 'asc')}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      Sort ascending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSort(column.key, 'desc')}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      Sort descending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutosize(column.key)}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      Autosize column
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePin(column.key)}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      {pinnedColumns.includes(column.key) ? 'Unpin column' : 'Pin column'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHide(column.key)}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      Hide column
                    </button>
                  </div>
                )}
              </th>
            ))}
            <th className="w-32 border-b border-r border-[#FDD023]/60 px-3 py-2 text-left text-xs font-semibold text-white uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleColumns.length === 0 ? (
            <tr>
              <td colSpan={2} className="border-r border-gray-300 px-4 py-12 text-center text-gray-500">
                All columns are hidden.
              </td>
            </tr>
          ) : (
            sortedRows.map((row, index) => (
              <tr
                key={row.id}
                className="hover:bg-[#fff8d6] transition-colors"
              >
                <td className="border-b border-r border-gray-300 bg-gray-50 px-2 py-2 text-center text-xs text-gray-500">
                  {index + 1}
                </td>
                {visibleColumns.map(column => (
                  <td
                    key={column.key}
                    style={{ width: columnWidths[column.key], minWidth: columnWidths[column.key] }}
                    className={`border-b border-r border-gray-300 px-3 py-2 text-gray-900 ${
                      column.key === 'workOrderNumber' ? 'font-medium text-[#461D7C] whitespace-nowrap' : ''
                    } ${column.key === 'dateCreated' || column.key === 'pcrSoNumber' ? 'whitespace-nowrap' : ''}`}
                  >
                    <p className={column.key === 'scopeOfWork' ? 'max-w-xl whitespace-pre-wrap' : 'truncate'}>
                      {column.key === 'workOrderNumber' ? (
                        <Link href={`/work-orders/${row.id}`} className="hover:underline">
                          {row[column.key]}
                        </Link>
                      ) : (
                        row[column.key]
                      )}
                    </p>
                  </td>
                ))}
                <td className="border-b border-r border-gray-300 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleVoidClick(row.id, row.workOrderNumber)}
                    disabled={!onVoidWorkOrder || voidingId === row.id}
                    className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {voidingId === row.id ? 'Voiding...' : 'Void'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
