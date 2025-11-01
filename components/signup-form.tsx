"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/hooks/use-auth"
import { useRateLimit } from "@/app/hooks/use-rate-limit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RateLimitModal } from "@/components/rate-limit-modal"
import Link from "next/link"

export function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signup } = useAuth()
  const { isBlocked, remainingSeconds, recordAttempt, reset } = useRateLimit(
    "signup",
    5,
    60
  )

  // Security: Strong password validation
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if rate limited
    if (isBlocked) {
      return
    }

    setError("")
    setSuccess("")

    // Validate email format first
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      recordAttempt(true)
      return
    }

    // Security: Strong password validation
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      recordAttempt(true)
      return
    }

    setIsLoading(true)

    // Check if email already exists BEFORE attempting signup
    try {
      const checkResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const checkData = await checkResponse.json()

      if (checkData.exists) {
        setError(checkData.message || "This email is already used. Please try another one.")
        recordAttempt(true)
        setIsLoading(false)
        return
      }
    } catch (checkError) {
      // If email check fails, continue with signup (fail open)
      // The API route will also check, so this is just for better UX
      console.warn("Could not verify email availability:", checkError)
    }

    try {
      await signup(email, password, name)
      
      // Reset rate limit on successful signup
      reset()
      
      // Check if we have a user session (email confirmation might be disabled)
      // Wait a bit to check if user was auto-logged in
      setTimeout(async () => {
        try {
          // Import supabase client to check session
          const { createBrowserClient } = await import("@/lib/supabaseClient")
          const supabase = createBrowserClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            // User was auto-logged in (email confirmation disabled)
            router.push("/dashboard")
          } else {
            // Email confirmation required
            setSuccess(
              "Account created successfully! Please check your email to confirm your account before signing in."
            )
          }
        } catch {
          // Email confirmation required
          setSuccess(
            "Account created successfully! Please check your email to confirm your account before signing in."
          )
        }
      }, 500)
    } catch (err: any) {
      // Record failed attempt
      recordAttempt(true)

      // Check for duplicate email error (fallback in case check-email didn't catch it)
      const errorMessage = err?.message || ""
      const isDuplicateEmail =
        errorMessage.toLowerCase().includes("user already registered") ||
        errorMessage.toLowerCase().includes("already registered") ||
        errorMessage.toLowerCase().includes("email address is already in use") ||
        errorMessage.toLowerCase().includes("user already exists") ||
        errorMessage.toLowerCase().includes("email already registered") ||
        errorMessage.toLowerCase().includes("already used") ||
        err?.code === "23505" // PostgreSQL unique violation

      if (isDuplicateEmail) {
        setError("This email is already used. Please try another one.")
      } else {
        setError(err?.message || "Signup failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isFormDisabled = isLoading || isBlocked

  return (
    <>
      <RateLimitModal
        isOpen={isBlocked}
        remainingSeconds={remainingSeconds}
        type="signup"
        totalCooldownSeconds={60}
      />
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm p-3 rounded">
              {success}
            </div>
          )}

          <Button type="submit" disabled={isFormDisabled} className="w-full">
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
