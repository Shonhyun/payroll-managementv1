import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto md:ml-0">
          <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
