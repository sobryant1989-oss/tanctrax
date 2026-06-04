'use client'

import Link from 'next/link'
import type { MajorProject } from '@/types'
import { CONSTRUCTION_CHECKLIST, getHighestChecklistItem, getChecklistProgress } from '@/services/majorProjectService'
import MajorProjectProgressBar from './MajorProjectProgressBar'

export default function MajorProjectCard({ project }: { project: MajorProject }) {
  const customDefs = Array.isArray(project.custom_checklist_defs) ? project.custom_checklist_defs : []
  const checklistDefs = [...CONSTRUCTION_CHECKLIST, ...customDefs]
  const highestChecklistItem = getHighestChecklistItem(project.checklist_items || [], customDefs)
  const displayProgress = project.phase === 'Construction' ? getChecklistProgress(project.phase, project.checklist_items || [], customDefs) : project.progress
  const pcrSoNumber = project.pcr_so_number?.trim() || 'Not entered'

  // Get recently checked items (with timestamps) for display
  const checkedWithDates = (project.checklist_items || []).filter((item: any) => item.checked_at)
  const sortedByDate = [...checkedWithDates].sort((a: any, b: any) => {
    const aTime = new Date(a.checked_at).getTime()
    const bTime = new Date(b.checked_at).getTime()
    return bTime - aTime
  })
  const recentChecked = sortedByDate.slice(0, 2) // Show 2 most recent

  return (
    <article className="rounded-lg border border-[#461D7C]/20 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/major-projects/${project.id}`}
            className="text-xl font-bold text-[#461D7C] hover:underline"
          >
            {project.title}
          </Link>
          <p className="mt-1 inline-flex rounded-full bg-[#FDD023] px-3 py-1 text-xs font-bold uppercase text-[#461D7C]">
            {project.phase}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#461D7C]/20 bg-[#f7f2ff] px-3 py-1 text-xs font-semibold text-[#461D7C]">
            <span className="uppercase">PCR SO #</span>
            <span className="text-gray-800">{pcrSoNumber}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-700">
        {project.description || 'No description provided.'}
      </p>

      {project.assigned_engineer_name && (
        <div className="mt-4 rounded-lg border border-[#461D7C]/20 bg-[#f7f2ff] px-3 py-2">
          <p className="text-xs font-semibold uppercase text-[#461D7C]">Assigned To</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{project.assigned_engineer_name}</p>
          {project.assigned_engineer_email && (
            <p className="text-xs text-gray-600">{project.assigned_engineer_email}</p>
          )}
        </div>
      )}

      {recentChecked.length > 0 && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase text-green-700">Recently Checked</p>
          <div className="mt-2 space-y-1">
            {recentChecked.map((item: any) => {
              const itemLabel = checklistDefs.find(def => def.id === item.id)?.label || item.id
              return (
                <p key={item.id} className="text-xs text-green-700">
                  {itemLabel} - {new Date(item.checked_at).toLocaleDateString()}
                </p>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-5">
        <MajorProjectProgressBar
          progress={displayProgress}
          inactive={project.phase !== 'Construction'}
          progressLabel={highestChecklistItem?.label}
        />
      </div>
    </article>
  )
}
