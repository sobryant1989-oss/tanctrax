import { NextResponse } from 'next/server'
import { createMajorProject, getMajorProjects } from '@/lib/majorProjectRepository'
import type { MajorProject, MajorProjectPhase } from '@/types'

type CreateMajorProjectRequest = {
  title: string
  pcr_so_number?: string
  phase: MajorProjectPhase
  description: string
  progress: number
}

export async function GET() {
  try {
    const projects = await getMajorProjects()
    return NextResponse.json(projects)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load major projects'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as CreateMajorProjectRequest
    const newProject = await createMajorProject(input)
    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create major project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
