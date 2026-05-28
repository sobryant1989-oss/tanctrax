'use client'

interface MajorProjectProgressBarProps {
  progress: number
  inactive?: boolean
  progressLabel?: string
}

export default function MajorProjectProgressBar({ progress, inactive = false, progressLabel }: MajorProjectProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 text-xs font-semibold uppercase text-[#461D7C] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Progress
          {progressLabel && (
            <span className="ml-2 normal-case text-gray-600">- {progressLabel}</span>
          )}
        </span>
        <span>{inactive ? 'Inactive until Construction' : `${progress}%`}</span>
      </div>
      <div className="relative h-7 overflow-hidden rounded border-2 border-[#461D7C] bg-[#1b1230] p-1 shadow-inner">
        <div
          className={`h-full rounded-sm transition-all duration-500 ${
            inactive
              ? 'bg-gray-500/50'
              : 'bg-gradient-to-r from-[#FDD023] via-[#ffe76c] to-[#FDD023] shadow-[0_0_14px_rgba(253,208,35,0.75)]'
          }`}
          style={{ width: `${inactive ? 0 : progress}%` }}
        >
          <div className="grid h-full grid-cols-6 gap-1 px-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="bg-white/20" />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold tracking-wide text-white drop-shadow">
          {inactive ? 'LOADING BAR LOCKED' : `LOADING ${progress}%`}
        </div>
      </div>
    </div>
  )
}
