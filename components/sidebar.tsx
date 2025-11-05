"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/time-management", label: "Time Management", icon: "⏱️" },
  { href: "/dashboard/dtr", label: "Daily Time Record", icon: "📅" },
  { href: "/dashboard/payroll", label: "Payroll Computation", icon: "💰" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {/* Full-screen loading overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="size-12 text-primary" />
            <p className="text-lg font-semibold text-foreground">Signing out...</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </div>
        </div>
      )}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary/20">
            <span className="text-xl">💼</span>
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">Payroll Pro</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/10",
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className="px-4 py-3 bg-sidebar-accent/10 rounded-lg">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-semibold text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoggingOut ? (
            <>
              <Spinner className="size-4" />
              Signing out...
            </>
          ) : (
            "Sign Out"
          )}
        </button>
      </div>
    </aside>
    </>
  )
}
