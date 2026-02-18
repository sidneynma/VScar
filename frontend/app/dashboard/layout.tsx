"use client"

import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <DashboardHeader />

      {/* Main content area with proper margin for sidebar */}
      <main className="md:ml-64 pt-0">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
