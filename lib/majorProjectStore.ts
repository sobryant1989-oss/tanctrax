import { promises as fs } from 'fs'
import path from 'path'
import type { MajorProject } from '@/types'

const dataDir = path.join(process.cwd(), 'data')
const dataFile = path.join(dataDir, 'major-projects.json')

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true })

  try {
    await fs.access(dataFile)
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8')
  }
}

export async function readStoredMajorProjects() {
  await ensureStore()
  const file = await fs.readFile(dataFile, 'utf8')
  return JSON.parse(file) as MajorProject[]
}

export async function writeStoredMajorProjects(projects: MajorProject[]) {
  await ensureStore()
  await fs.writeFile(dataFile, JSON.stringify(projects, null, 2), 'utf8')
}

export function sortMajorProjectsNewestFirst(projects: MajorProject[]) {
  return [...projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
