'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Upload, X } from 'lucide-react'

type PdcProjectRow = {
  id: string
  projectName: string
  phase: string
  mostRecentNote: string
  projectManager: string
}

const STORAGE_KEY = 'tanctrax-pdc-projects'

const columnAliases = {
  projectName: ['project name', 'project', 'name', 'project title'],
  phase: ['phase', 'project phase', 'status'],
  mostRecentNote: ['project most recent note', 'most recent note', 'recent note', 'latest note', 'note', 'notes'],
  projectManager: ['project manager', 'manager', 'pm', 'pdc project manager'],
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
}

function parseDelimited(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const delimiter = text.includes('\t') && !text.includes(',') ? '\t' : ','

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      row.push(cell.trim())
      cell = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function parseHtmlTable(text: string) {
  const document = new DOMParser().parseFromString(text, 'text/html')
  const tableRows = Array.from(document.querySelectorAll('tr'))
  return tableRows
    .map(row => Array.from(row.querySelectorAll('th,td')).map(cell => cell.textContent?.trim() || ''))
    .filter(row => row.some(Boolean))
}

function getColumnIndex(headers: string[], aliases: string[]) {
  const normalizedHeaders = headers.map(normalizeHeader)
  return normalizedHeaders.findIndex(header => aliases.includes(header))
}

function rowsToProjects(rows: string[][]) {
  if (rows.length < 2) return []

  const headers = rows[0]
  const indexes = {
    projectName: getColumnIndex(headers, columnAliases.projectName),
    phase: getColumnIndex(headers, columnAliases.phase),
    mostRecentNote: getColumnIndex(headers, columnAliases.mostRecentNote),
    projectManager: getColumnIndex(headers, columnAliases.projectManager),
  }

  if (indexes.projectName === -1) return []

  return rows.slice(1).map((row, index) => ({
    id: `${Date.now()}-${index}`,
    projectName: row[indexes.projectName] || '',
    phase: indexes.phase === -1 ? '' : row[indexes.phase] || '',
    mostRecentNote: indexes.mostRecentNote === -1 ? '' : row[indexes.mostRecentNote] || '',
    projectManager: indexes.projectManager === -1 ? '' : row[indexes.projectManager] || '',
  })).filter(row => row.projectName)
}

function parseProjectFile(text: string) {
  const trimmed = text.trim()
  const rows = trimmed.startsWith('<') ? parseHtmlTable(trimmed) : parseDelimited(trimmed)
  return rowsToProjects(rows)
}

export default function PdcProjectsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [projects, setProjects] = useState<PdcProjectRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('All')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setProjects(JSON.parse(saved) as PdcProjectRow[])
    } catch (err) {
      console.error('Failed to load PDC projects:', err)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  const phaseOptions = useMemo(() => {
    const phases = Array.from(new Set(projects.map(project => project.phase).filter(Boolean)))
    return ['All', ...phases.sort((a, b) => a.localeCompare(b))]
  }, [projects])

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return projects.filter(project => {
      const matchesPhase = phaseFilter === 'All' || project.phase === phaseFilter
      const matchesSearch = !query || [
        project.projectName,
        project.phase,
        project.mostRecentNote,
        project.projectManager,
      ].some(value => value.toLowerCase().includes(query))

      return matchesPhase && matchesSearch
    })
  }, [phaseFilter, projects, searchQuery])

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    try {
      const text = await file.text()
      const importedProjects = parseProjectFile(text)

      if (importedProjects.length === 0) {
        throw new Error('No projects found. Make sure the file includes a Project Name column.')
      }

      setProjects(importedProjects)
      setPhaseFilter('All')
      setSearchQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to import this file.')
    } finally {
      event.target.value = ''
    }
  }

  const clearProjects = () => {
    setProjects([])
    setSearchQuery('')
    setPhaseFilter('All')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#461D7C]">PDC Projects Trax</h1>
            <p className="mt-2 text-sm text-gray-600">{projects.length} imported projects</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {projects.length > 0 && (
              <button
                type="button"
                onClick={clearProjects}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FDD023] px-4 py-2 text-sm font-semibold text-[#461D7C] transition hover:bg-[#e5b800]"
            >
              <Upload className="h-4 w-4" />
              Import CSV/XLS
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,text/csv,application/vnd.ms-excel"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter projects"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
              />
            </label>

            <select
              value={phaseFilter}
              onChange={(event) => setPhaseFilter(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
            >
              {phaseOptions.map(phase => (
                <option key={phase} value={phase}>{phase === 'All' ? 'All phases' : phase}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-[#461D7C] text-left text-xs uppercase text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Project Name</th>
                  <th className="px-4 py-3 font-semibold">Phase</th>
                  <th className="px-4 py-3 font-semibold">Project Most Recent Note</th>
                  <th className="px-4 py-3 font-semibold">Project Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-[#fff8d6]">
                      <td className="px-4 py-3 font-medium text-gray-900">{project.projectName}</td>
                      <td className="px-4 py-3 text-gray-700">{project.phase || '-'}</td>
                      <td className="max-w-2xl whitespace-pre-wrap px-4 py-3 text-gray-700">{project.mostRecentNote || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{project.projectManager || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-gray-500">
                      No PDC projects to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
