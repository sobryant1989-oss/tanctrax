'use client'

import React, { useEffect, useMemo, useState } from 'react'
import MajorProjectCard from '@/components/MajorProjectCard'
import { createMajorProject, getMajorProjects, PROJECT_PHASES } from '@/services/majorProjectService'
import type { MajorProject, MajorProjectPhase } from '@/types'

const emptyForm = {
  title: '',
  pcrSoNumber: '',
  phase: 'Planning' as MajorProjectPhase,
  description: '',
}

export default function MajorProjectsPage() {
  const [projects, setProjects] = useState<MajorProject[]>([])
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [engineerFilter, setEngineerFilter] = useState('All')

  const fetchProjects = async () => {
    setError(null)
    try {
      const projectData = await getMajorProjects()
      setProjects(projectData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const assignedEngineerOptions = useMemo(() => {
    const engineerNames = projects
      .map(project => project.assigned_engineer_name?.trim())
      .filter((name): name is string => Boolean(name))

    return ['All', ...Array.from(new Set(engineerNames)).sort((a, b) => a.localeCompare(b))]
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (engineerFilter === 'All') return projects
    return projects.filter(project => project.assigned_engineer_name === engineerFilter)
  }, [engineerFilter, projects])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const newProject = await createMajorProject(formData)
      if (!newProject) {
        throw new Error('Unable to create major project.')
      }
      setProjects(prev => [newProject, ...prev])
      setFormData(emptyForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create major project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#461D7C]">Construction Trax</h1>
          <p className="mt-2 text-sm text-gray-600">Track medium to large construction and renovation projects progress and phases.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Create Project</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                  Project Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(event) => setFormData(prev => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label htmlFor="pcrSoNumber" className="mb-2 block text-sm font-medium text-gray-700">
                  PCR SO #
                </label>
                <input
                  id="pcrSoNumber"
                  name="pcrSoNumber"
                  type="text"
                  value={formData.pcrSoNumber}
                  onChange={(event) => setFormData(prev => ({ ...prev, pcrSoNumber: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
                  placeholder="Enter PCR SO #"
                />
              </div>

              <div>
                <label htmlFor="phase" className="mb-2 block text-sm font-medium text-gray-700">
                  Project Phase <span className="text-red-600">*</span>
                </label>
                <select
                  id="phase"
                  name="phase"
                  required
                  value={formData.phase}
                  onChange={(event) => setFormData(prev => ({ ...prev, phase: event.target.value as MajorProjectPhase }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
                >
                  {PROJECT_PHASES.map(phase => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                  Brief Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={(event) => setFormData(prev => ({ ...prev, description: event.target.value }))}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
                  placeholder="Add a short description"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-[#FDD023] px-4 py-2 font-semibold text-[#461D7C] transition hover:bg-[#e5b800] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </section>

          <section className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-gray-900">Project Tracker</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label htmlFor="engineerFilter" className="sr-only">Filter by assigned engineer</label>
                <select
                  id="engineerFilter"
                  value={engineerFilter}
                  onChange={(event) => setEngineerFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
                >
                  {assignedEngineerOptions.map(engineer => (
                    <option key={engineer} value={engineer}>
                      {engineer === 'All' ? 'All assigned engineers' : engineer}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={fetchProjects}
                  className="text-sm font-semibold text-[#461D7C] hover:text-[#2b0f4f]"
                >
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-gray-600">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#461D7C]/30 bg-[#f7f2ff] px-6 py-16 text-center">
                <p className="text-lg font-semibold text-[#461D7C]">No projects yet</p>
                <p className="mt-2 text-sm text-gray-600">Create the first project to start tracking progress.</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#461D7C]/30 bg-[#f7f2ff] px-6 py-16 text-center">
                <p className="text-lg font-semibold text-[#461D7C]">No projects for this engineer</p>
                <p className="mt-2 text-sm text-gray-600">Choose another assigned engineer to see matching project tracker panels.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredProjects.map(project => (
                  <MajorProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
