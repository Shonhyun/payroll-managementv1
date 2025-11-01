"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabaseClient"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase] = useState(() => createBrowserClient())

  // Convert Supabase user to our User format
  const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || undefined,
    }
  }

  // Check if user is logged in on mount and set up auth state listener
  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user))
        }
      } catch (error) {
        // Security: Log error details only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Session check failed:", error)
        }
        // In production, silently fail - user will see loading state
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user))
      }
    } catch (error: any) {
      // Re-throw with user-friendly message
      throw new Error(error.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      })

      if (error) {
        throw error
      }

      // Check if email confirmation is required
      // If user exists but email is not confirmed, Supabase won't sign them in
      if (data.user && !data.session) {
        // Email confirmation required - user will need to confirm before logging in
        // Don't set user yet, let them know to check their email
        return
      }

      // After signup, if session exists, user is automatically signed in
      if (data.user && data.session) {
        setUser(mapSupabaseUser(data.user))
      }
    } catch (error: any) {
      // Re-throw with user-friendly message
      throw new Error(error.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
    } catch (error: any) {
      // Security: Don't log sensitive errors in production
      if (process.env.NODE_ENV === 'development') {
        console.error("Logout error:", error)
      }
      // Still throw for error handling, but don't expose details
      throw new Error("Logout failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        signup,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
