"use client"

import { useAuth as useAuthContext } from "@/app/contexts/auth-context"

export function useAuth() {
  return useAuthContext()
}
