import { NextResponse } from 'next/server'
import { deleteMajorProject, getMajorProjectById, updateMajorProject } from '@/lib/majorProjectRepository'
import type { MajorProjectAttachment, MajorProjectPhase } from '@/types'

type UpdateMajorProjectRequest = {
  phase: MajorProjectPhase
  updates: string
  progress: number
  attachments: MajorProjectAttachment[]
  blueprint_attachments: MajorProjectAttachment[]
  checklist_items: Array<{ id: string; checked_at?: string | null }>
  custom_checklist_defs?: Array<{ id: string; label: string; progress: number }>
  assigned_engineer_name: string
  assigned_engineer_email: string
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getMajorProjectById(id)

  if (!project) {
    return NextResponse.json({ error: 'Major project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const input = await request.json() as UpdateMajorProjectRequest
  const updatedProject = await updateMajorProject({
    id,
    phase: input.phase,
    updates: input.updates,
    progress: input.progress,
    attachments: input.attachments,
    blueprintAttachments: input.blueprint_attachments,
    checklistItems: input.checklist_items,
    customChecklistDefs: input.custom_checklist_defs || [],
    assignedEngineerName: input.assigned_engineer_name || null,
    assignedEngineerEmail: input.assigned_engineer_email || null,
  })

  if (!updatedProject) {
    return NextResponse.json({ error: 'Major project not found' }, { status: 404 })
  }

  return NextResponse.json(updatedProject)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const wasDeleted = await deleteMajorProject(id)

  if (!wasDeleted) {
    return NextResponse.json({ error: 'Major project not found' }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}
