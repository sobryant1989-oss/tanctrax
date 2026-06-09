import { randomUUID } from 'crypto'
import { db } from './db'
import type { PdcProject } from '@/types'

export type PdcProjectImportInput = {
  projectName: string
  phase: string
  mostRecentNote: string
  projectManager: string
}

function normalizeProjectName(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
}

function normalizePdcProject(row: any): PdcProject {
  return {
    id: String(row.id),
    project_name: String(row.project_name),
    normalized_project_name: String(row.normalized_project_name),
    phase: row.phase === null ? null : String(row.phase),
    most_recent_note: row.most_recent_note === null ? null : String(row.most_recent_note),
    project_manager: row.project_manager === null ? null : String(row.project_manager),
    last_imported_at: row.last_imported_at instanceof Date ? row.last_imported_at.toISOString() : String(row.last_imported_at),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  }
}

export async function getPdcProjects(): Promise<PdcProject[]> {
  const result = await db.query('SELECT * FROM pdc_projects ORDER BY project_name ASC')
  return result.rows.map(normalizePdcProject)
}

export async function importPdcProjects(projects: PdcProjectImportInput[]): Promise<PdcProject[]> {
  const importedAt = new Date().toISOString()
  const mergedByName = new Map<string, PdcProjectImportInput>()

  for (const project of projects) {
    const key = normalizeProjectName(project.projectName)
    if (!key) continue
    mergedByName.set(key, project)
  }

  for (const [normalizedProjectName, project] of mergedByName) {
    await db.query(
      `
        INSERT INTO pdc_projects (
          id,
          project_name,
          normalized_project_name,
          phase,
          most_recent_note,
          project_manager,
          last_imported_at,
          created_at,
          updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (normalized_project_name)
        DO UPDATE SET
          project_name = EXCLUDED.project_name,
          phase = EXCLUDED.phase,
          most_recent_note = EXCLUDED.most_recent_note,
          project_manager = EXCLUDED.project_manager,
          last_imported_at = EXCLUDED.last_imported_at,
          updated_at = EXCLUDED.updated_at
      `,
      [
        randomUUID(),
        project.projectName.trim(),
        normalizedProjectName,
        project.phase.trim() || null,
        project.mostRecentNote.trim() || null,
        project.projectManager.trim() || null,
        importedAt,
        importedAt,
        importedAt,
      ],
    )
  }

  return getPdcProjects()
}

export async function clearPdcProjects(): Promise<void> {
  await db.query('DELETE FROM pdc_projects')
}
