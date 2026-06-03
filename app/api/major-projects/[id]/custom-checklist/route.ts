import { NextResponse } from 'next/server'
import { updateMajorProjectCustomDefs, getMajorProjectById } from '@/lib/majorProjectRepository'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const input = await request.json().catch(() => null)
  if (!input || !Array.isArray(input.custom_checklist_defs)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const updated = await updateMajorProjectCustomDefs(id, input.custom_checklist_defs)
  if (!updated) {
    return NextResponse.json({ error: 'Major project not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}
