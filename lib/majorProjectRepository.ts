import { randomUUID } from 'crypto'
import { db } from './db'
import type { MajorProject, MajorProjectPhase, MajorProjectAttachment } from '@/types'

type CreateMajorProjectInput = {
  title: string
  phase: MajorProjectPhase
  description: string
  progress: number
}

type UpdateMajorProjectInput = {
  id: string
  phase: MajorProjectPhase
  updates: string
  progress: number
  attachments: MajorProjectAttachment[]
  blueprintAttachments: MajorProjectAttachment[]
  checklistItems: Array<{ id: string; checked_at?: string | null }>
  customChecklistDefs?: Array<{ id: string; label: string; progress: number }>
  assignedEngineerName: string | null
  assignedEngineerEmail: string | null
}

function normalizeMajorProject(row: any): MajorProject {
  return {
    id: String(row.id),
    title: String(row.title),
    phase: String(row.phase) as MajorProjectPhase,
    description: row.description === null ? null : String(row.description),
    updates: row.updates === null ? null : String(row.updates),
    progress: Number(row.progress),
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    blueprint_attachments: Array.isArray(row.blueprint_attachments) ? row.blueprint_attachments : [],
    checklist_items: Array.isArray(row.checklist_items)
      ? row.checklist_items.map((item: any) => {
          if (typeof item === 'string') {
            return { id: String(item), checked_at: null }
          }
          return {
            id: String(item.id),
            checked_at: item.checked_at ? String(item.checked_at) : null,
          }
        })
      : [],
    custom_checklist_defs: Array.isArray(row.custom_checklist_defs)
      ? row.custom_checklist_defs.map((d: any) => ({
          id: String(d.id),
          label: String(d.label),
          progress: Number(d.progress || 0),
        }))
      : [],
    assigned_engineer_name: row.assigned_engineer_name === null ? null : String(row.assigned_engineer_name),
    assigned_engineer_email: row.assigned_engineer_email === null ? null : String(row.assigned_engineer_email),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  }
}

export async function getMajorProjects(): Promise<MajorProject[]> {
  const result = await db.query('SELECT * FROM major_projects ORDER BY created_at DESC')
  return result.rows.map(normalizeMajorProject)
}

export async function getMajorProjectById(id: string): Promise<MajorProject | null> {
  const result = await db.query('SELECT * FROM major_projects WHERE id = $1', [id])
  if (result.rowCount === 0) return null
  return normalizeMajorProject(result.rows[0])
}

export async function createMajorProject(input: CreateMajorProjectInput): Promise<MajorProject> {
  const id = randomUUID()
  const query = `
    INSERT INTO major_projects (
      id,
      title,
      phase,
      description,
      updates,
      progress,
      attachments,
      blueprint_attachments,
      checklist_items,
      custom_checklist_defs,
      assigned_engineer_name,
      assigned_engineer_email,
      created_at,
      updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
    ) RETURNING *
  `
  const values = [
    id,
    input.title,
    input.phase,
    input.description,
    null,
    input.progress,
    JSON.stringify([]),
    JSON.stringify([]),
    JSON.stringify([]),
    JSON.stringify([]),
    null,
    null,
    new Date().toISOString(),
    new Date().toISOString(),
  ]
  const result = await db.query(query, values)
  return normalizeMajorProject(result.rows[0])
}

export async function updateMajorProject(input: UpdateMajorProjectInput): Promise<MajorProject | null> {
  const query = `
    UPDATE major_projects
    SET phase = $2,
        updates = $3,
        progress = $4,
        attachments = $5,
        blueprint_attachments = $6,
        checklist_items = $7,
        custom_checklist_defs = $8,
        assigned_engineer_name = $9,
        assigned_engineer_email = $10,
        updated_at = $11
    WHERE id = $1
    RETURNING *
  `
  const values = [
    input.id,
    input.phase,
    input.updates || null,
    input.progress,
    JSON.stringify(input.attachments),
    JSON.stringify(input.blueprintAttachments),
    JSON.stringify(input.checklistItems),
    JSON.stringify(input.customChecklistDefs || []),
    input.assignedEngineerName || null,
    input.assignedEngineerEmail || null,
    new Date().toISOString(),
  ]
  const result = await db.query(query, values)
  if (result.rowCount === 0) return null
  return normalizeMajorProject(result.rows[0])
}

export async function deleteMajorProject(id: string): Promise<boolean> {
  const result = await db.query('DELETE FROM major_projects WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

export async function updateMajorProjectCustomDefs(id: string, defs: Array<{ id: string; label: string; progress: number }>): Promise<MajorProject | null> {
  const query = `
    UPDATE major_projects
    SET custom_checklist_defs = $2,
        updated_at = $3
    WHERE id = $1
    RETURNING *
  `
  const values = [id, JSON.stringify(defs || []), new Date().toISOString()]
  const result = await db.query(query, values)
  if (result.rowCount === 0) return null
  return normalizeMajorProject(result.rows[0])
}
