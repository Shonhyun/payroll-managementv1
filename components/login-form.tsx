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

const REMEMBER_ME_KEY = "payroll_remember_email"
const REMEMBER_ME_CHECKED_KEY = "payroll_remember_me_checked"

// Helper function to safely get initial email from localStorage
function getInitialEmail(): string {
  if (typeof window === "undefined") return ""
  try {
    const savedEmail = localStorage.getItem(REMEMBER_ME_KEY)
    const wasRememberMeChecked = localStorage.getItem(REMEMBER_ME_CHECKED_KEY) === "true"
    return wasRememberMeChecked && savedEmail ? savedEmail : ""
  } catch (e) {
    return ""
  }
}

// Helper function to safely get initial remember me state from localStorage
function getInitialRememberMe(): boolean {
  if (typeof window === "undefined") return false
  try {
    const savedEmail = localStorage.getItem(REMEMBER_ME_KEY)
    const wasRememberMeChecked = localStorage.getItem(REMEMBER_ME_CHECKED_KEY) === "true"
    return !!(wasRememberMeChecked && savedEmail)
  } catch (e) {
    return false
  }
}

export function LoginForm() {
  const [email, setEmail] = useState(() => getInitialEmail())
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(() => getInitialRememberMe())
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { isBlocked, remainingSeconds, recordAttempt, reset } = useRateLimit(
    "login",
    5,
    60
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if rate limited
    if (isBlocked) {
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      
      // Handle remember me functionality
      if (rememberMe) {
        // Save email and remember me preference
        try {
          localStorage.setItem(REMEMBER_ME_KEY, email)
          localStorage.setItem(REMEMBER_ME_CHECKED_KEY, "true")
        } catch (e) {
          // Handle localStorage errors gracefully
          console.error("Failed to save remembered email:", e)
        }
      } else {
        // Clear saved email and preference if remember me is unchecked
        try {
          localStorage.removeItem(REMEMBER_ME_KEY)
          localStorage.removeItem(REMEMBER_ME_CHECKED_KEY)
        } catch (e) {
          // Handle localStorage errors gracefully
          console.error("Failed to clear remembered email:", e)
        }
      }
      
      // Reset rate limit on successful login
      reset()
      router.push("/dashboard")
    } catch (err: any) {
      // Record failed attempt
      recordAttempt(true)

      // Handle email confirmation error with helpful message
      if (
        err?.message?.toLowerCase().includes("email not confirmed") ||
        err?.message?.toLowerCase().includes("email_not_confirmed")
      ) {
        setError(
          "Please check your email and confirm your account before signing in. Check your spam folder if you don't see the email."
        )
      } else {
        setError("Invalid email or password. Please try again.")
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
        type="login"
        totalCooldownSeconds={60}
      />
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-border"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isFormDisabled}
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isFormDisabled} className="w-full">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
