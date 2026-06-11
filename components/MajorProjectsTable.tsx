'use client'

import Link from 'next/link'
import type { MajorProject } from '@/types'
import { getChecklistProgress, getHighestChecklistItem } from '@/services/majorProjectService'
import MajorProjectProgressBar from './MajorProjectProgressBar'

export default function MajorProjectsTable({ projects }: { projects: MajorProject[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#461D7C]/20 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#461D7C]/10">
          <thead className="bg-[#f7f2ff]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-[#461D7C]">
                Project Title
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-[#461D7C]">
                Project Phase
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-[#461D7C]">
                PCR SO#
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-[#461D7C]">
                Assigned Engineer
              </th>
              <th scope="col" className="min-w-[300px] px-4 py-3 text-left text-xs font-bold uppercase text-[#461D7C]">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {projects.map(project => {
              const customDefs = Array.isArray(project.custom_checklist_defs) ? project.custom_checklist_defs : []
              const highestChecklistItem = getHighestChecklistItem(project.checklist_items || [], customDefs)
              const displayProgress = project.phase === 'Construction'
                ? getChecklistProgress(project.phase, project.checklist_items || [], customDefs)
                : project.progress
              const pcrSoNumber = project.pcr_so_number?.trim() || 'Not entered'
              const assignedEngineer = project.assigned_engineer_name?.trim() || 'Unassigned'

              return (
                <tr key={project.id} className="transition hover:bg-[#f7f2ff]/50">
                  <td className="px-4 py-4 align-middle">
                    <Link
                      href={`/major-projects/${project.id}`}
                      className="font-bold text-[#461D7C] hover:underline"
                    >
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className="inline-flex rounded-full bg-[#FDD023] px-3 py-1 text-xs font-bold uppercase text-[#461D7C]">
                      {project.phase}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className="inline-flex rounded-md border border-[#461D7C]/20 bg-[#f7f2ff] px-3 py-1 text-xs font-semibold text-gray-800">
                      {pcrSoNumber}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="text-sm font-medium text-gray-900">{assignedEngineer}</div>
                    {project.assigned_engineer_email && (
                      <div className="mt-1 text-xs text-gray-600">{project.assigned_engineer_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <MajorProjectProgressBar
                      progress={displayProgress}
                      inactive={project.phase !== 'Construction'}
                      progressLabel={highestChecklistItem?.label}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
