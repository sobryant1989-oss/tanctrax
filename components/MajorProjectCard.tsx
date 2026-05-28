'use client'

import Link from 'next/link'
import type { MajorProject } from '@/types'
import { getHighestChecklistItem } from '@/services/majorProjectService'
import MajorProjectProgressBar from './MajorProjectProgressBar'

export default function MajorProjectCard({ project }: { project: MajorProject }) {
  const highestChecklistItem = getHighestChecklistItem(project.checklist_items || [])

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

      <div className="mt-5">
        <MajorProjectProgressBar
          progress={project.progress}
          inactive={project.phase !== 'Construction'}
          progressLabel={highestChecklistItem?.label}
        />
      </div>
    </article>
  )
}
