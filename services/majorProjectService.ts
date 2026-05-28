import { supabase } from '@/lib/supabase'
import type { MajorProject, MajorProjectAttachment, MajorProjectPhase } from '@/types'

export const PROJECT_PHASES: MajorProjectPhase[] = [
  'Planning',
  'SD',
  'DD',
  'CD',
  'Bid',
  'Construction',
]

export const PHASE_PROGRESS: Record<MajorProjectPhase, number> = {
  Planning: 0,
  SD: 0,
  DD: 0,
  CD: 0,
  Bid: 0,
  Construction: 0,
}

export const CONSTRUCTION_CHECKLIST = [
  { id: 'project-reviewed-bid', label: 'Project reviewed/Bid', progress: 5 },
  { id: 'work-order-created-assigned', label: 'Work order created/assigned', progress: 10 },
  { id: 'demo-started', label: 'Demo started', progress: 15 },
  { id: 'demo-completed', label: 'Demo completed', progress: 20 },
  { id: 'conduit-installed', label: 'Conduit Installed', progress: 25 },
  { id: 'walls-roughed-in', label: 'Walls Roughed in', progress: 30 },
  { id: 'final-room-building-confirmed', label: 'FINAL Room Numbering & Building Name/Abbr. confirmed and documented', progress: 35 },
  { id: 'order-quoted-designed-electronics', label: 'Order Quoted/Designed Electronics', progress: 37 },
  { id: 'low-voltage-contractor-begins', label: 'Low Voltage contractor begins', progress: 40 },
  { id: 'entry-riser-cabling-installed', label: 'All entry and riser cabling installed', progress: 60 },
  { id: 'horizontal-cabling-tested-labeled', label: 'Horizontal cabling installed/tested/labeled - Above Ceiling inspected', progress: 70 },
  { id: 'closet-built-out-completed', label: 'Closet built out completed', progress: 80 },
  { id: 'circuit-docs-file-created', label: 'Circuit Docs file created', progress: 82 },
  { id: 'fiber-circuits-requested-installed', label: 'Fiber Circuits Requested and Installed', progress: 83 },
  { id: 'electronics-set', label: 'Electronics Set', progress: 85 },
  { id: 'activations-complete', label: 'Activations complete', progress: 90 },
  { id: 'ap-locations-wireless-group', label: 'AP locations to Wireless Group', progress: 92 },
  { id: 'circuit-docs-info-updated', label: 'Circuit docs Info 100% updated', progress: 95 },
  { id: 'punchlist-items-completed', label: 'Punchlist Items Completed', progress: 98 },
  { id: 'billing-complete-order-closed', label: 'Billing complete/order closed', progress: 100 },
]

export function getChecklistProgress(phase: MajorProjectPhase, checkedItems: string[]) {
  if (phase !== 'Construction') return 0

  return CONSTRUCTION_CHECKLIST.reduce((progress, item) => (
    checkedItems.includes(item.id) ? Math.max(progress, item.progress) : progress
  ), 0)
}

export function getHighestChecklistItem(checkedItems: string[]) {
  return CONSTRUCTION_CHECKLIST.reduce<(typeof CONSTRUCTION_CHECKLIST)[number] | null>((highestItem, item) => {
    if (!checkedItems.includes(item.id)) return highestItem
    if (!highestItem || item.progress > highestItem.progress) return item
    return highestItem
  }, null)
}

type CreateMajorProjectInput = {
  title: string
  phase: MajorProjectPhase
  description: string
}

type UpdateMajorProjectInput = {
  id: string
  phase: MajorProjectPhase
  updates: string
  attachments: MajorProjectAttachment[]
  blueprintAttachments: MajorProjectAttachment[]
  checklistItems: string[]
  assignedEngineerName: string
  assignedEngineerEmail: string
}

function sortNewestFirst(projects: MajorProject[]) {
  return [...projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getMajorProjects() {
  try {
    const response = await fetch('/api/major-projects')
    if (!response.ok) throw new Error('Failed to fetch major projects')
    return await response.json() as MajorProject[]
  } catch (error) {
    console.error('Error fetching major projects:', error)
  }

  try {
    const { data, error } = await supabase
      .from('major_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return []

    return data as MajorProject[] || []
  } catch (error) {
    console.error('Error fetching major projects from Supabase:', error)
    return []
  }
}

export async function getMajorProjectById(id: string) {
  try {
    const response = await fetch(`/api/major-projects/${id}`)
    if (!response.ok) throw new Error('Failed to fetch major project')
    return await response.json() as MajorProject
  } catch (error) {
    console.error('Error fetching major project:', error)
  }

  try {
    const { data, error } = await supabase
      .from('major_projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null

    return data as MajorProject
  } catch (error) {
    console.error('Error fetching major project from Supabase:', error)
    return null
  }
}

export async function createMajorProject(input: CreateMajorProjectInput) {
  const payload = {
    title: input.title.trim(),
    phase: input.phase,
    description: input.description.trim(),
    progress: PHASE_PROGRESS[input.phase],
  }

  try {
    const response = await fetch('/api/major-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to create major project')
    }

    return await response.json() as MajorProject
  } catch (error) {
    console.error('Error creating major project:', error)
  }

  const { data, error } = await supabase
    .from('major_projects')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error('Failed to create major project')
  }

  return data as MajorProject
}

export async function updateMajorProject(input: UpdateMajorProjectInput) {
  const payload = {
    phase: input.phase,
    updates: input.updates.trim(),
    progress: getChecklistProgress(input.phase, input.checklistItems),
    attachments: input.attachments,
    blueprint_attachments: input.blueprintAttachments,
    checklist_items: input.checklistItems,
    assigned_engineer_name: input.assignedEngineerName,
    assigned_engineer_email: input.assignedEngineerEmail,
    updated_at: new Date().toISOString(),
  }

  try {
    const response = await fetch(`/api/major-projects/${input.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to update major project')
    }

    return await response.json() as MajorProject
  } catch (error) {
    console.error('Error updating major project:', error)
  }

  const { data, error } = await supabase
    .from('major_projects')
    .update(payload)
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) {
    throw new Error('Failed to update major project')
  }

  return data as MajorProject
}

export function sortMajorProjects(projects: MajorProject[]) {
  return sortNewestFirst(projects)
}
