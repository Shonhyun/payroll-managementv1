"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/hooks/use-auth"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
      onLinkClick?.()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const mainModules = [
    { label: "Time Management", href: "/dashboard/time-management", icon: "⏱️" },
    { label: "Daily Time Record", href: "/dashboard/dtr", icon: "📅" },
    { label: "Payroll Computation", href: "/dashboard/payroll", icon: "💰" },
  ]

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Employees", href: "/dashboard/employees", icon: "👥" },
    { label: "Reports", href: "/dashboard/reports", icon: "📋" },
    { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ]

  return (
    <>
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <h2 className="text-lg sm:text-xl font-bold text-sidebar-foreground">Payroll Manager</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase px-4 mb-3">Main Modules</p>
          {mainModules.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors font-medium"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="pt-4 border-t border-sidebar-border">
          <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase px-4 mb-3">Tools</p>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className="px-4 py-3 bg-sidebar-primary/10 rounded-lg">
          <p className="text-xs text-sidebar-foreground/60 mb-1">Logged in as</p>
          <p className="font-medium text-sidebar-foreground text-sm truncate">{user?.name || user?.email || "User"}</p>
          {user?.name && <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80 transition-colors font-medium text-sm"
        >
          Logout
        </button>
      </div>
    </>
  )
}

export function DashboardSidebar() {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-50 bg-background border border-border shadow-md h-9 w-9 sm:h-10 sm:w-10"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full">
              <SidebarContent onLinkClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
      <SidebarContent />
    </aside>
  )
}
