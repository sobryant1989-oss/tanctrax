import { NextResponse } from 'next/server'
import { createMajorProject, getMajorProjects } from '@/lib/majorProjectRepository'
import type { MajorProject, MajorProjectPhase } from '@/types'

type CreateMajorProjectRequest = {
  title: string
  phase: MajorProjectPhase
  description: string
  progress: number
}

export async function GET() {
  const projects = await getMajorProjects()
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const input = await request.json() as CreateMajorProjectRequest
  const newProject = await createMajorProject(input)
  return NextResponse.json(newProject, { status: 201 })
}
