import type { Metadata } from 'next'

import { Inter } from 'next/font/google'

import Sidebar from '@/components/Sidebar'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {

  title: 'Work Order Tracker',

  description: 'Work order ticket tracking for campus maintenance',

}

export default function RootLayout({

  children,

}: {

  children: React.ReactNode

}) {

  return (

    <html lang="en">

      <body className={inter.className}>

        <Sidebar>{children}</Sidebar>

      </body>

    </html>

  )

}