"use client"

import { AuthProvider } from "@/app/contexts/auth-context"
import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
