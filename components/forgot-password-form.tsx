"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRateLimit } from "@/app/hooks/use-rate-limit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RateLimitModal } from "@/components/rate-limit-modal"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabaseClient"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isBlocked, remainingSeconds, recordAttempt, reset } = useRateLimit(
    "forgot-password",
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
    setSuccess(false)
    setIsLoading(true)

    try {
      // First check rate limit via API (server-side validation)
      const rateLimitResponse = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!rateLimitResponse.ok) {
        const data = await rateLimitResponse.json()
        throw new Error(data.error || "Failed to send reset email")
      }

      // If rate limit check passes, call Supabase directly from client
      // This ensures PKCE code_verifier is stored in browser localStorage
      const supabase = createBrowserClient()
      const siteUrl = window.location.origin
      const redirectTo = `${siteUrl}/auth/callback`

      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo,
        }
      )

      if (supabaseError) {
        // Don't expose specific error (email enumeration protection)
        // But log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.error('Password reset error:', supabaseError)
        }
        // Still show success message for security
      }

      // Reset rate limit on successful request
      reset()
      setSuccess(true)
    } catch (err: any) {
      // Record failed attempt
      recordAttempt(true)
      // Show generic error to prevent email enumeration
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormDisabled = isLoading || isBlocked

  if (success) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Check your email</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            We've sent a password reset link to <strong className="text-foreground">{email}</strong>
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or try again.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <RateLimitModal
        isOpen={isBlocked}
        remainingSeconds={remainingSeconds}
        type="forgot-password"
        totalCooldownSeconds={60}
      />
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isFormDisabled}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isFormDisabled} className="w-full">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline font-medium">
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

