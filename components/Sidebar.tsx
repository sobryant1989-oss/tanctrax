'use client'

import React from 'react'
import Link from 'next/link'

interface SidebarProps {
  children?: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  const navItems = [
    { href: '/', label: 'Home', icon: '' },
    { href: '/work-orders', label: 'Work Order Trax', icon: '' },
    { href: '/major-projects', label: 'Construction Trax', icon: '' },
    { href: '/pdc-projects', label: 'PDC Projects Trax', icon: '' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-[#FDD023] text-[#461D7C]">
        <div className="p-4 flex items-center justify-center">
          <img
            src="/tanctrax-eye.jpg"
            alt="TancTrax"
            className="h-16 w-16 rounded bg-white object-contain"
          />
        </div>

        <nav className="mt-8 space-y-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center rounded-lg px-4 py-3 text-center font-semibold transition-colors hover:bg-[#461D7C] hover:text-[#FDD023]"
            >
              {item.icon && <span className="text-2xl">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}
