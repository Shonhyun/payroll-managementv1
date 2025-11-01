"use client"

import { useState, useCallback, useEffect } from "react"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "employee" | "manager" | "admin"
}

const MOCK_USERS = [
  { email: "admin@payroll.com", password: "admin123", id: "1", name: "Admin User", role: "admin" as const },
  { email: "john@payroll.com", password: "john123", id: "2", name: "John Doe", role: "employee" as const },
  { email: "manager@payroll.com", password: "manager123", id: "3", name: "Jane Manager", role: "manager" as const },
]

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("payroll_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem("payroll_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)
      if (!foundUser) {
        throw new Error("Invalid email or password")
      }

      const loggedInUser: AuthUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      }
      setUser(loggedInUser)
      localStorage.setItem("payroll_user", JSON.stringify(loggedInUser))
      return loggedInUser
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("payroll_user")
  }, [])

  return { user, isLoading, error, login, logout }
}
