import { NextResponse } from 'next/server'
import { readStoredMajorProjects, sortMajorProjectsNewestFirst, writeStoredMajorProjects } from '@/lib/majorProjectStore'
import type { MajorProject, MajorProjectPhase } from '@/types'

type CreateMajorProjectRequest = {
  title: string
  phase: MajorProjectPhase
  description: string
  progress: number
}

function createId() {
  return `mp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function GET() {
  const projects = await readStoredMajorProjects()
  return NextResponse.json(sortMajorProjectsNewestFirst(projects))
}

export async function POST(request: Request) {
  const input = await request.json() as CreateMajorProjectRequest
  const projects = await readStoredMajorProjects()
  const now = new Date().toISOString()

  const newProject: MajorProject = {
    id: createId(),
    title: input.title,
    phase: input.phase,
    description: input.description || null,
    updates: null,
    progress: input.progress,
    attachments: [],
    blueprint_attachments: [],
    checklist_items: [],
    assigned_engineer_name: null,
    assigned_engineer_email: null,
    created_at: now,
    updated_at: now,
  }

  await writeStoredMajorProjects([newProject, ...projects])

  return NextResponse.json(newProject, { status: 201 })
}
