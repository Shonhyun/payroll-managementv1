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

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
