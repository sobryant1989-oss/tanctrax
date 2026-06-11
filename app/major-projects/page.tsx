'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MajorProjectCard from '@/components/MajorProjectCard'
import MajorProjectsTable from '@/components/MajorProjectsTable'
import { createMajorProject, getMajorProjects, PROJECT_PHASES } from '@/services/majorProjectService'
import type { MajorProject, MajorProjectPhase } from '@/types'

const emptyForm = {
  title: '',
  pcrSoNumber: '',
  phase: 'Planning' as MajorProjectPhase,
  description: '',
}

export default function MajorProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<MajorProject[]>([])
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [engineerFilter, setEngineerFilter] = useState('All')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [boxConnectedMessage, setBoxConnectedMessage] = useState<string | null>(null)

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

  useEffect(() => {
    if (searchParams.get('box') !== 'connected') return

    const email = searchParams.get('email')
    setBoxConnectedMessage(email ? `Box connected for ${email}.` : 'Box connected.')
    router.replace('/major-projects')
  }, [router, searchParams])

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

  const activeProjects = useMemo(
    () => filteredProjects.filter(project => project.phase !== 'Complete'),
    [filteredProjects],
  )

  const completedProjects = useMemo(
    () => filteredProjects.filter(project => project.phase === 'Complete'),
    [filteredProjects],
  )

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
      setIsCreateOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create major project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#461D7C]">Construction Trax</h1>
            <p className="mt-2 text-sm text-gray-600">Track medium to large construction and renovation projects progress and phases.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/api/box/login"
              className="rounded-lg border border-[#461D7C]/30 bg-white px-4 py-2 text-center font-semibold text-[#461D7C] transition hover:bg-[#f7f2ff]"
            >
              Connect Box
            </a>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setIsCreateOpen(true)
              }}
              className="rounded-lg bg-[#FDD023] px-4 py-2 font-semibold text-[#461D7C] transition hover:bg-[#e5b800]"
            >
              Create Project
            </button>
          </div>
        </div>

        <div>
          <section className="rounded-lg bg-white p-6 shadow">
            {boxConnectedMessage && (
              <div className="mb-4 flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 sm:flex-row sm:items-center sm:justify-between">
                <span>{boxConnectedMessage}</span>
                <button
                  type="button"
                  onClick={() => setBoxConnectedMessage(null)}
                  className="text-left text-sm font-semibold text-green-900 hover:underline sm:text-right"
                >
                  Dismiss
                </button>
              </div>
            )}

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
              <div className="space-y-8">
                {activeProjects.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#461D7C]/30 bg-[#f7f2ff] px-6 py-16 text-center">
                    <p className="text-lg font-semibold text-[#461D7C]">No active projects</p>
                    <p className="mt-2 text-sm text-gray-600">Completed projects are listed in the table below.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {activeProjects.map(project => (
                      <MajorProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}

                {completedProjects.length > 0 && (
                  <section>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Completed Projects</h3>
                      <span className="text-sm font-semibold text-[#461D7C]">{completedProjects.length}</span>
                    </div>
                    <MajorProjectsTable projects={completedProjects} />
                  </section>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Create Project</h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false)
                  setError(null)
                }}
                className="rounded-lg px-3 py-1 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

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
        </div>
      )}
    </div>
  )
}
