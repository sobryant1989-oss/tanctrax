'use client'

import React from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange'
  backgroundImage?: string
}

const colorClasses = {
  blue: 'bg-[#f7f2ff] border-[#461D7C]',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-[#f7f2ff] border-[#461D7C]',
  orange: 'bg-red-50 border-red-300',
}

const iconColorClasses = {
  blue: 'text-[#461D7C]',
  green: 'text-green-600',
  purple: 'text-[#461D7C]',
  orange: 'text-red-600',
}

export default function MetricCard({
  label,
  value,
  icon,
  color = 'blue',
  backgroundImage,
}: MetricCardProps) {
  if (backgroundImage) {
    return (
      <div
        className="relative overflow-hidden border border-[#FDD023] rounded-lg p-6 flex items-start space-x-4 bg-white"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.78)), url("${backgroundImage}")`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      >
        {icon && (
          <div className="text-gray-700 text-3xl">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className="text-[#461D7C] text-sm font-semibold">{label}</p>
          <p className="text-3xl font-bold text-[#461D7C] mt-2">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6 flex items-start space-x-4`}>
      {icon && (
        <div className={`${iconColorClasses[color]} text-3xl`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-[#461D7C] text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-[#461D7C] mt-2">{value}</p>
      </div>
    </div>
  )
}
