"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabaseClient"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name?: string
  passwordChangedAt?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  updateEmail: (newEmail: string) => Promise<void>
  updatePassword: (newPassword: string, currentPassword: string) => Promise<void>
  updateName: (newName: string) => Promise<void>
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
      passwordChangedAt: supabaseUser.user_metadata?.password_changed_at || undefined,
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
      // Check if there's a session first
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          // If signOut fails but we have a session, still clear local state
          if (process.env.NODE_ENV === 'development') {
            console.error("SignOut error:", error)
          }
        }
      }
      
      // Always clear user state, even if signOut fails
      setUser(null)
    } catch (error: any) {
      // Security: Don't log sensitive errors in production
      if (process.env.NODE_ENV === 'development') {
        console.error("Logout error:", error)
      }
      // Always clear user state on logout attempt
      setUser(null)
      // Don't throw - logout should always succeed from user's perspective
    } finally {
      setIsLoading(false)
    }
  }

  const updateEmail = async (newEmail: string) => {
    setIsLoading(true)
    try {
      // Check if there's an active session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("No active session found. Please log in again.")
      }

      // Set redirect URL for email confirmation
      // This tells Supabase where to redirect after user confirms email change
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback?type=email_change&next=/dashboard/settings`
        : undefined

      // Update email - Supabase will send a confirmation email to the new address
      const { data, error } = await supabase.auth.updateUser(
        {
          email: newEmail,
        },
        {
          emailRedirectTo: redirectUrl,
        }
      )

      if (error) {
        throw error
      }

      // Update user state
      if (data.user) {
        // Note: Email won't be updated in user object until confirmed
        // The user needs to confirm the new email via the link sent to them
        setUser(mapSupabaseUser(data.user))
      }
    } catch (error: any) {
      // Re-throw with user-friendly message
      const errorMessage = error.message || "Failed to update email"
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = async (newPassword: string, currentPassword: string) => {
    setIsLoading(true)
    try {
      // First verify current password
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) {
        throw new Error("No active session found. Please log in again.")
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      })

      if (verifyError) {
        throw new Error("Current password is incorrect")
      }

      // If password is correct, update password
      const passwordChangedAt = new Date().toISOString()
      
      // Update password and metadata in one call
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          password_changed_at: passwordChangedAt,
        },
      })

      if (error) {
        throw error
      }

      // Refresh user data to get updated metadata
      if (data.user) {
        setUser(mapSupabaseUser(data.user))
      }
    } catch (error: any) {
      // Re-throw with user-friendly message
      throw new Error(error.message || "Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  const updateName = async (newName: string) => {
    setIsLoading(true)
    try {
      // Check if there's an active session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("No active session found. Please log in again.")
      }

      // Sanitize name input
      const sanitizedName = newName.trim()

      // Validate name
      if (!sanitizedName) {
        throw new Error("Name cannot be empty")
      }

      if (sanitizedName.length < 2) {
        throw new Error("Name must be at least 2 characters")
      }

      if (sanitizedName.length > 100) {
        throw new Error("Name must be less than 100 characters")
      }

      // Update name in user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: sanitizedName,
          name: sanitizedName,
        },
      })

      if (error) {
        throw error
      }

      // Update user state
      if (data.user) {
        setUser(mapSupabaseUser(data.user))
      }
    } catch (error: any) {
      // Re-throw with user-friendly message
      throw new Error(error.message || "Failed to update name")
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
        updateEmail,
        updatePassword,
        updateName,
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
