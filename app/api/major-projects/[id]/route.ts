import { NextResponse } from 'next/server'
import { readStoredMajorProjects, writeStoredMajorProjects } from '@/lib/majorProjectStore'
import type { MajorProjectAttachment, MajorProjectPhase } from '@/types'

type UpdateMajorProjectRequest = {
  phase: MajorProjectPhase
  updates: string
  progress: number
  attachments: MajorProjectAttachment[]
  blueprint_attachments: MajorProjectAttachment[]
  checklist_items: string[]
  assigned_engineer_name: string
  assigned_engineer_email: string
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projects = await readStoredMajorProjects()
  const project = projects.find(item => item.id === id)

  if (!project) {
    return NextResponse.json({ error: 'Major project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const input = await request.json() as UpdateMajorProjectRequest
  const projects = await readStoredMajorProjects()
  const project = projects.find(item => item.id === id)

  if (!project) {
    return NextResponse.json({ error: 'Major project not found' }, { status: 404 })
  }

  const updatedProject = {
    ...project,
    phase: input.phase,
    updates: input.updates || null,
    progress: input.progress,
    attachments: input.attachments,
    blueprint_attachments: input.blueprint_attachments,
    checklist_items: input.checklist_items,
    assigned_engineer_name: input.assigned_engineer_name || null,
    assigned_engineer_email: input.assigned_engineer_email || null,
    updated_at: new Date().toISOString(),
  }

  await writeStoredMajorProjects(projects.map(item => item.id === id ? updatedProject : item))

  return NextResponse.json(updatedProject)
}
