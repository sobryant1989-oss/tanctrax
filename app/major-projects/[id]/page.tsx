'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import MajorProjectProgressBar from '@/components/MajorProjectProgressBar'
import { ENGINEER_CONTACTS } from '@/lib/contacts'
import { CONSTRUCTION_CHECKLIST, deleteMajorProject, getChecklistProgress, getHighestChecklistItem, getMajorProjectById, normalizeChecklistItems, PROJECT_PHASES, updateMajorProject } from '@/services/majorProjectService'
import type { MajorProject, MajorProjectAttachment, MajorProjectChecklistItem, MajorProjectPhase } from '@/types'

function fileToAttachment(file: File): Promise<MajorProjectAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        id: `attachment-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: file.type,
        data_url: String(reader.result),
        uploaded_at: new Date().toISOString(),
      })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const blueprintFileTypes = '.pdf,.dwg,.dxf,.rvt,.ifc,.png,.jpg,.jpeg,.webp'

export default function MajorProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<MajorProject | null>(null)
  const [phase, setPhase] = useState<MajorProjectPhase>('Planning')
  const [updates, setUpdates] = useState('')
  const [attachments, setAttachments] = useState<MajorProjectAttachment[]>([])
  const [blueprintAttachments, setBlueprintAttachments] = useState<MajorProjectAttachment[]>([])
  const [checklistItems, setChecklistItems] = useState<MajorProjectChecklistItem[]>([])
  const [assignedEngineerName, setAssignedEngineerName] = useState('')
  const [assignedEngineerEmail, setAssignedEngineerEmail] = useState('')
  const [customChecklistDefs, setCustomChecklistDefs] = useState<Array<{ id: string; label: string; progress: number }>>([])
  const [editingCustoms, setEditingCustoms] = useState<Array<{ id: string; label: string; progress: number }>>([])

  // localStorage helpers for client-only persistence per-project
  const CUSTOM_DEFS_KEY = (projectId: string) => `tanctrax-custom-checklist-${projectId}`

  const loadSavedCustomDefs = (projectId: string) => {
    if (typeof window === 'undefined') return [] as Array<{ id: string; label: string; progress: number }>
    try {
      const raw = window.localStorage.getItem(CUSTOM_DEFS_KEY(projectId))
      return raw ? JSON.parse(raw) as Array<{ id: string; label: string; progress: number }> : []
    } catch (err) {
      console.error('Failed to load custom checklist defs:', err)
      return []
    }
  }

  const saveCustomDefs = (projectId: string, defs: Array<{ id: string; label: string; progress: number }>) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CUSTOM_DEFS_KEY(projectId), JSON.stringify(defs))
    } catch (err) {
      console.error('Failed to save custom checklist defs:', err)
    }
  }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      setError(null)
      try {
        const projectData = await getMajorProjectById(params.id)
          setProject(projectData)
          if (projectData) {
            setPhase(projectData.phase)
          setUpdates(projectData.updates || '')
          setAttachments(projectData.attachments || [])
          setBlueprintAttachments(projectData.blueprint_attachments || [])
          setChecklistItems(normalizeChecklistItems(projectData.checklist_items))
          // merge server defs with any local-only defs, local defs win if ids differ
          const serverDefs = Array.isArray(projectData.custom_checklist_defs) ? projectData.custom_checklist_defs : []
          const localDefs = loadSavedCustomDefs(projectData.id)
          const merged = [...serverDefs]
          for (const ld of localDefs) {
            if (!merged.some(md => md.id === ld.id)) merged.push(ld)
          }
          setCustomChecklistDefs(merged)
          saveCustomDefs(projectData.id, merged)
          setAssignedEngineerName(projectData.assigned_engineer_name || '')
          setAssignedEngineerEmail(projectData.assigned_engineer_email || '')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load major project.')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.id])

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return

    setError(null)
    try {
      const newAttachments = await Promise.all(files.map(fileToAttachment))
      setAttachments(prev => [...prev, ...newAttachments])
    } catch {
      setError('Unable to attach one or more pictures.')
    } finally {
      event.target.value = ''
    }
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id))
  }

  const handleBlueprintsSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setError(null)
    try {
      const newBlueprints = await Promise.all(files.map(fileToAttachment))
      setBlueprintAttachments(prev => [...prev, ...newBlueprints])
    } catch {
      setError('Unable to attach one or more blueprints.')
    } finally {
      event.target.value = ''
    }
  }

  const handleRemoveBlueprint = (id: string) => {
    setBlueprintAttachments(prev => prev.filter(attachment => attachment.id !== id))
  }

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklistItems(prev => {
      if (checked) {
        if (prev.some(item => item.id === id)) return prev
        return [...prev, { id, checked_at: new Date().toISOString() }]
      }
      return prev.filter(item => item.id !== id)
    })
  }

  const startAddCustom = () => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setEditingCustoms(prev => [...prev, { id, label: '', progress: 0 }])
  }

  const saveCustom = (id: string) => {
    const editing = editingCustoms.find(c => c.id === id)
    if (!editing) return
    if (!editing.label.trim()) return
    const sanitizedProgress = Math.max(0, Math.min(100, Number(editing.progress) || 0))
    // if def exists, replace it; otherwise append
    const exists = customChecklistDefs.some(d => d.id === editing.id)
    let newDefs
    if (exists) {
      newDefs = customChecklistDefs.map(d => (d.id === editing.id ? { ...d, label: editing.label.trim(), progress: sanitizedProgress } : d))
    } else {
      newDefs = [...customChecklistDefs, { id: editing.id, label: editing.label.trim(), progress: sanitizedProgress }]
    }
    setCustomChecklistDefs(newDefs)
    // persist per-project
    saveCustomDefs(project?.id || params.id, newDefs)
    setEditingCustoms(prev => prev.filter(c => c.id !== id))
  }

  const editCustomDef = (id: string) => {
    const def = customChecklistDefs.find(d => d.id === id)
    if (!def) return
    // avoid duplicate editing entries
    if (editingCustoms.some(e => e.id === id)) return
    setEditingCustoms(prev => [...prev, { id: def.id, label: def.label, progress: def.progress }])
  }

  const removeCustomDef = (id: string) => {
    const remaining = customChecklistDefs.filter(d => d.id !== id)
    setCustomChecklistDefs(remaining)
    saveCustomDefs(project?.id || params.id, remaining)
    // also uncheck in checklistItems if present
    setChecklistItems(prev => prev.filter(item => item.id !== id))
  }

  const cancelEditingCustom = (id: string) => {
    setEditingCustoms(prev => prev.filter(c => c.id !== id))
  }

  const updateEditingCustom = (id: string, fields: { label?: string; progress?: number }) => {
    setEditingCustoms(prev => prev.map(c => (c.id === id ? { ...c, ...fields } : c)))
  }

  const handleAssignedEngineerChange = (name: string) => {
    const engineer = ENGINEER_CONTACTS.find(contact => contact.name === name)
    setAssignedEngineerName(name)
    setAssignedEngineerEmail(engineer?.email || '')
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!project) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updatedProject = await updateMajorProject({
        id: project.id,
        phase,
        updates,
        attachments,
        blueprintAttachments,
        checklistItems,
        customChecklistDefs,
        assignedEngineerName: phase === 'Construction' ? assignedEngineerName : '',
        assignedEngineerEmail: phase === 'Construction' ? assignedEngineerEmail : '',
      })
      if (!updatedProject) {
        throw new Error('Failed to update major project.')
      }
      setProject(updatedProject)
      setPhase(updatedProject.phase)
      setUpdates(updatedProject.updates || '')
      setAttachments(updatedProject.attachments || [])
      setBlueprintAttachments(updatedProject.blueprint_attachments || [])
      setChecklistItems(normalizeChecklistItems(updatedProject.checklist_items))
      // sync server defs back to local storage
      const serverDefs = Array.isArray((updatedProject as any).custom_checklist_defs) ? (updatedProject as any).custom_checklist_defs : []
      setCustomChecklistDefs(serverDefs)
      saveCustomDefs(updatedProject.id, serverDefs)
      setAssignedEngineerName(updatedProject.assigned_engineer_name || '')
      setAssignedEngineerEmail(updatedProject.assigned_engineer_email || '')
      setSuccess('Major project updated.')
      router.push('/major-projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update major project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return
    const confirmed = window.confirm('Delete this major project? This action cannot be undone.')
    if (!confirmed) return

    setDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const deleted = await deleteMajorProject(project.id)
      if (!deleted) {
        throw new Error('Unable to delete major project.')
      }
      router.push('/major-projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete major project.')
    } finally {
      setDeleting(false)
    }
  }

  const showChecklist = phase === 'CD' || phase === 'Bid' || phase === 'Construction'

  // compute progress including any client-side custom checklist items
  const defaultProgress = getChecklistProgress(phase, checklistItems)
  const customCheckedMax = customChecklistDefs.reduce((max, def) => {
    const isChecked = checklistItems.some((c) => c.id === def.id)
    return isChecked ? Math.max(max, def.progress) : max
  }, 0)
  const displayedProgress = Math.max(defaultProgress, customCheckedMax)

  const highestDefault = getHighestChecklistItem(checklistItems)
  const highestCustom = customChecklistDefs.reduce((best: { label: string; progress: number } | null, def) => {
    const isChecked = checklistItems.some((c) => c.id === def.id)
    if (!isChecked) return best
    if (!best || def.progress > best.progress) return { label: def.label, progress: def.progress }
    return best
  }, null)
  const progressLabel = highestDefault?.label || highestCustom?.label || undefined

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl text-gray-600">Loading major project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Major project not found</h1>
          {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
          <Link href="/major-projects" className="font-semibold text-[#461D7C] hover:underline">
            Back to Major Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#461D7C]">Major Project</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/major-projects" className="font-semibold text-[#461D7C] hover:underline">
              Back to Major Projects
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete Project'}
            </button>
          </div>
        </div>

        <article className="rounded-lg bg-white p-8 shadow">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-3xl font-bold text-gray-900">{project.title}</h2>
            <p className="mt-3 inline-flex rounded-full bg-[#FDD023] px-3 py-1 text-xs font-bold uppercase text-[#461D7C]">
              {phase}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6 py-6">
            <div>
              <label htmlFor="phase" className="mb-2 block text-sm font-medium text-gray-700">
                Phase
              </label>
              <select
                id="phase"
                value={phase}
                onChange={(event) => setPhase(event.target.value as MajorProjectPhase)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
              >
                {PROJECT_PHASES.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {phase === 'Construction' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="assignedEngineer" className="mb-2 block text-sm font-medium text-gray-700">
                    Assigned To
                  </label>
                  <select
                    id="assignedEngineer"
                    value={assignedEngineerName}
                    onChange={(event) => handleAssignedEngineerChange(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
                  >
                    <option value="">Select project manager</option>
                    {ENGINEER_CONTACTS.map(engineer => (
                      <option key={engineer.email} value={engineer.name}>
                        {engineer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assignedEngineerEmail" className="mb-2 block text-sm font-medium text-gray-700">
                    Manager Email
                  </label>
                  <input
                    id="assignedEngineerEmail"
                    type="email"
                    value={assignedEngineerEmail}
                    readOnly
                    placeholder="Email will populate automatically"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-700 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase text-gray-600">Project Description</h3>
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                {project.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <label htmlFor="updates" className="mb-2 block text-sm font-medium text-gray-700">
                Project Updates
              </label>
              <textarea
                id="updates"
                rows={6}
                value={updates}
                onChange={(event) => setUpdates(event.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#FDD023]"
                placeholder="Add project updates, notes, or status changes"
              />
            </div>

            <div>
              <label htmlFor="attachments" className="mb-2 block text-sm font-medium text-gray-700">
                Attach Pictures
              </label>
              <input
                id="attachments"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="w-full rounded-lg border border-dashed border-[#461D7C]/40 bg-[#f7f2ff] px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded file:border-0 file:bg-[#FDD023] file:px-3 file:py-2 file:font-semibold file:text-[#461D7C]"
              />
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="rounded-lg border border-gray-200 p-3">
                    <img
                      src={attachment.data_url}
                      alt={attachment.name}
                      className="h-40 w-full rounded object-cover"
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-gray-700">{attachment.name}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label htmlFor="blueprints" className="mb-2 block text-sm font-medium text-gray-700">
                Attach Blueprints
              </label>
              <input
                id="blueprints"
                type="file"
                accept={blueprintFileTypes}
                multiple
                onChange={handleBlueprintsSelected}
                className="w-full rounded-lg border border-dashed border-[#461D7C]/40 bg-[#f7f2ff] px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded file:border-0 file:bg-[#FDD023] file:px-3 file:py-2 file:font-semibold file:text-[#461D7C]"
              />
              <p className="mt-2 text-xs text-gray-500">
                Supports PDF, image, DWG, DXF, RVT, and IFC files.
              </p>
            </div>

            {blueprintAttachments.length > 0 && (
              <div className="rounded-lg border border-[#461D7C]/20">
                <div className="border-b border-[#461D7C]/20 bg-[#f7f2ff] px-4 py-3">
                  <h3 className="text-sm font-semibold uppercase text-[#461D7C]">Blueprints</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {blueprintAttachments.map(blueprint => (
                    <div key={blueprint.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <a
                          href={blueprint.data_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#461D7C] hover:underline"
                        >
                          {blueprint.name}
                        </a>
                        <p className="text-xs text-gray-500">{blueprint.type || 'Blueprint file'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlueprint(blueprint.id)}
                        className="self-start text-sm font-semibold text-red-600 hover:text-red-700 sm:self-auto"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showChecklist && (
              <div className="rounded-lg border border-[#461D7C]/20">
                <div className="border-b border-[#461D7C]/20 bg-[#f7f2ff] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-[#461D7C]">Construction Progress Checklist</h3>
                      <p className="mt-1 text-xs text-gray-600">
                        Checklist is available from CD onward. The loading bar becomes active in Construction.
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={startAddCustom}
                        className="rounded-lg bg-[#461D7C] px-3 py-1 text-xs font-semibold text-white hover:bg-[#3a155f]"
                      >
                        Add custom step
                      </button>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {/* default checklist items */}
                  {CONSTRUCTION_CHECKLIST.map(item => {
                    const itemStatus = checklistItems.find(check => check.id === item.id)
                    return (
                      <label key={item.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-[#fff8d6]">
                        <input
                          type="checkbox"
                          checked={Boolean(itemStatus)}
                          onChange={(event) => handleChecklistChange(item.id, event.target.checked)}
                          className="mt-1 h-4 w-4 accent-[#461D7C]"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{item.label}</p>
                          {itemStatus?.checked_at && (
                            <p className="mt-1 text-xs text-gray-500">
                              Checked on {new Date(itemStatus.checked_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#461D7C]">{item.progress}%</span>
                      </label>
                    )
                  })}

                  {/* rendered custom definitions */}
                  {customChecklistDefs.map(def => {
                    const itemStatus = checklistItems.find(check => check.id === def.id)
                    const isEditing = editingCustoms.some(e => e.id === def.id)
                    return (
                      <div key={def.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#fff8d6]">
                        <input
                          type="checkbox"
                          checked={Boolean(itemStatus)}
                          onChange={(event) => handleChecklistChange(def.id, event.target.checked)}
                          className="mt-1 h-4 w-4 accent-[#461D7C]"
                        />
                        <div className="flex-1">
                          {!isEditing ? (
                            <div>
                              <p className="text-sm text-gray-800">{def.label} <span className="ml-2 text-xs text-gray-500">(custom)</span></p>
                              {itemStatus?.checked_at && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Checked on {new Date(itemStatus.checked_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#461D7C]">{def.progress}%</span>
                          {!isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => editCustomDef(def.id)}
                                className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCustomDef(def.id)}
                                className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"
                              >
                                Remove
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}

                  {/* editing custom inputs */}
                  {editingCustoms.map(edit => (
                    <div key={edit.id} className="flex flex-col gap-2 px-4 py-3">
                      <input
                        type="text"
                        value={edit.label}
                        onChange={(e) => updateEditingCustom(edit.id, { label: e.target.value })}
                        placeholder="Custom step label"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={String(edit.progress)}
                          onChange={(e) => updateEditingCustom(edit.id, { progress: Number(e.target.value) })}
                          className="w-24 rounded-lg border border-gray-300 px-3 py-2"
                        />
                        <span className="text-sm text-gray-600">Progress %</span>
                        <div className="ml-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveCustom(edit.id)}
                            className="rounded-lg bg-[#FDD023] px-3 py-1 text-xs font-semibold text-[#461D7C]"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelEditingCustom(edit.id)}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* add another custom button below list */}
                  <div className="px-4 py-3">
                    <button
                      type="button"
                      onClick={startAddCustom}
                      className="rounded-lg border border-dashed border-[#461D7C]/30 px-3 py-1 text-sm font-semibold text-[#461D7C] hover:bg-[#f7f2ff]"
                    >
                      Add custom step
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showChecklist && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Construction progress checklist unlocks when the project reaches CD phase.
              </div>
            )}

            <MajorProjectProgressBar
              progress={displayedProgress}
              inactive={phase !== 'Construction'}
              progressLabel={progressLabel}
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[#FDD023] px-4 py-2 font-semibold text-[#461D7C] transition hover:bg-[#e5b800] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving ? 'Saving...' : 'Save Project Updates'}
            </button>
          </form>
        </article>
      </div>
    </div>
  )
}
