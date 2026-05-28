'use client'

import React from 'react'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 bg-gray-300 rounded w-32 mb-8 animate-pulse"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 h-32 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-96 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
        </div>
      </div>
    </div>
  )
}