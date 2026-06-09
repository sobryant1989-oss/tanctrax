import { NextResponse } from 'next/server'
import { clearPdcProjects, getPdcProjects, importPdcProjects } from '@/lib/pdcProjectRepository'

function toClientProject(project: Awaited<ReturnType<typeof getPdcProjects>>[number]) {
  return {
    id: project.id,
    projectName: project.project_name,
    phase: project.phase || '',
    mostRecentNote: project.most_recent_note || '',
    projectManager: project.project_manager || '',
    lastImportedAt: project.last_imported_at,
  }
}

async function getPdcProjectsResponse() {
  const projects = await getPdcProjects()
  const lastImportDate = projects.reduce<string | null>((latest, project) => {
    if (!latest) return project.last_imported_at
    return new Date(project.last_imported_at).getTime() > new Date(latest).getTime()
      ? project.last_imported_at
      : latest
  }, null)

  return {
    projects: projects.map(toClientProject),
    lastImportDate,
  }
}

export async function GET() {
  return NextResponse.json(await getPdcProjectsResponse())
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => null)

  if (!input || !Array.isArray(input.projects)) {
    return NextResponse.json({ error: 'Invalid import payload' }, { status: 400 })
  }

  await importPdcProjects(input.projects)
  return NextResponse.json(await getPdcProjectsResponse())
}

export async function DELETE() {
  await clearPdcProjects()
  return NextResponse.json({ projects: [], lastImportDate: null })
}
