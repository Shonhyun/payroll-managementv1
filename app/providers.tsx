"use client"

import { AuthProvider } from "@/app/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}
