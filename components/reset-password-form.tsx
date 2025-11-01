"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabaseClient"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasCheckedRef = useRef(false)
  
  // Helper function to get hash params
  const getHashParams = () => {
    if (typeof window === 'undefined') return {}
    const hash = window.location.hash.substring(1)
    const params: Record<string, string> = {}
    hash.split('&').forEach(param => {
      const [key, value] = param.split('=')
      if (key && value) {
        params[key] = decodeURIComponent(value)
      }
    })
    return params
  }
  
  // Get token/code from URL - check both query params and hash fragments
  // Supabase can send code in query params or hash fragments depending on flow
  const hashParams = typeof window !== 'undefined' ? getHashParams() : {}
  const code = searchParams.get("code") || hashParams.code || ""
  const tokenHash = searchParams.get("token_hash") || searchParams.get("token") || hashParams.token_hash || hashParams.token || ""
  const type = searchParams.get("type") || hashParams.type || ""
  

  useEffect(() => {
    // Get error parameters from URL - check both query params and hash
    const errorParam = searchParams.get("error") || ""
    const errorCode = searchParams.get("error_code") || ""
    const errorDescription = searchParams.get("error_description") || ""
    
    const urlHashParams = getHashParams()
    const hashError = urlHashParams.error || ""
    const hashErrorCode = urlHashParams.error_code || ""
    
    // Determine final error state
    const hasError = errorParam || hashError
    const finalErrorCode = errorCode || hashErrorCode
    const finalErrorDescription = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : ""
    
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true
    
    let subscription: { unsubscribe: () => void } | null = null
    
    const checkSession = async () => {
      const supabase = createBrowserClient()
      setIsChecking(true)
      setError("")
      
      // Debug: Log what we're working with
      if (process.env.NODE_ENV === 'development') {
        console.log('Reset password check:', {
          code: code ? `${code.substring(0, 10)}...` : 'none',
          codeLength: code.length,
          tokenHash: tokenHash ? `${tokenHash.substring(0, 10)}...` : 'none',
          type,
          hashParams: Object.keys(hashParams),
          searchParams: Array.from(searchParams.entries())
        })
      }
      
      // FIRST: Check for error in URL parameters (from Supabase)
      if (hasError) {
        if (finalErrorCode === 'otp_expired' || finalErrorCode === 'expired') {
          setError("The reset link has expired. Please request a new password reset link.")
        } else if (finalErrorCode === 'invalid_token' || finalErrorCode === 'invalid') {
          setError("The reset link is invalid. Please request a new password reset link.")
        } else if (finalErrorDescription) {
          setError(finalErrorDescription)
        } else {
          setError("Invalid or expired reset link. Please request a new password reset link.")
        }
        setIsChecking(false)
        
        // Clean up URL
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.searchParams.delete('error')
          url.searchParams.delete('error_code')
          url.searchParams.delete('error_description')
          url.hash = '' // Clear hash
          window.history.replaceState({}, '', url.toString())
        }
        
        if (subscription) {
          subscription.unsubscribe()
        }
        return
      }
      
      // Listen for auth state changes first - Supabase will create a session when user clicks email link
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change event:', event, 'Has session:', !!session)
        if (event === 'PASSWORD_RECOVERY') {
          // When PASSWORD_RECOVERY event fires, we have a valid session
          if (session) {
            setHasSession(true)
            setError("")
            setIsChecking(false)
            if (subscription) {
              subscription.unsubscribe()
            }
            return
          }
        } else if (event === 'SIGNED_IN' && session) {
          // Also handle SIGNED_IN event
          setHasSession(true)
          setError("")
          setIsChecking(false)
          if (subscription) {
            subscription.unsubscribe()
          }
          return
        }
      })
      subscription = authSubscription

      // If we have a 'code' parameter, try multiple methods to verify it
      // Supabase password reset can use different token types depending on configuration
      if (code) {
        try {
          // First, try to get session - Supabase SSR might have already processed hash fragments
          // Give it a moment to process
          await new Promise(resolve => setTimeout(resolve, 300))
          const { data: { session: initialSession } } = await supabase.auth.getSession()
          if (initialSession) {
            setHasSession(true)
            setError("")
            setIsChecking(false)
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('code')
              url.searchParams.delete('type')
              url.hash = ''
              window.history.replaceState({}, '', url.toString())
            }
            if (subscription) {
              subscription.unsubscribe()
            }
            return
          }

          // Method 1: Try verifyOtp with code as token_hash (recovery token flow)
          // This is the most common method for password reset
          let otpData, verifyError
          try {
            const result = await supabase.auth.verifyOtp({
              token_hash: code,
              type: 'recovery'
            })
            otpData = result.data
            verifyError = result.error
          } catch (e) {
            verifyError = e as any
          }
          
          if (!verifyError && otpData?.session) {
            setHasSession(true)
            setError("")
            setIsChecking(false)
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('code')
              url.searchParams.delete('type')
              url.hash = ''
              window.history.replaceState({}, '', url.toString())
            }
            if (subscription) {
              subscription.unsubscribe()
            }
            return
          }

          // Method 2: Try exchangeCodeForSession (for PKCE flow)
          // This might work if the same browser session that requested the reset is still active
          let exchangeData, exchangeError
          try {
            const result = await supabase.auth.exchangeCodeForSession(code)
            exchangeData = result.data
            exchangeError = result.error
          } catch (e) {
            exchangeError = e as any
          }
          
          if (!exchangeError && exchangeData?.session) {
            setHasSession(true)
            setError("")
            setIsChecking(false)
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('code')
              url.searchParams.delete('type')
              url.hash = ''
              window.history.replaceState({}, '', url.toString())
            }
            if (subscription) {
              subscription.unsubscribe()
            }
            return
          }

          // All methods failed - log details for debugging
          const errorMsg = verifyError?.message || exchangeError?.message || 'Unknown error'
          if (process.env.NODE_ENV === 'development') {
            console.error('Password reset verification failed:', {
              verifyError: verifyError?.message,
              exchangeError: exchangeError?.message,
              codeLength: code.length,
              codePreview: code.substring(0, 20),
              type
            })
          }
          setError("Invalid or expired reset link. Please request a new password reset.")
          setIsChecking(false)
          if (subscription) {
            subscription.unsubscribe()
          }
          return
        } catch (err) {
          console.error('Code exchange error:', err)
          setError("Failed to verify reset link. Please request a new password reset.")
          setIsChecking(false)
          if (subscription) {
            subscription.unsubscribe()
          }
          return
        }
      }

      // Check if we already have a session (Supabase creates one when user clicks reset link)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (session) {
        setHasSession(true)
        setIsChecking(false)
        if (subscription) {
          subscription.unsubscribe()
        }
        return
      }

      // Wait a bit for Supabase SSR to process the redirect (it handles hash fragments automatically)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check session again after waiting
      const { data: { session: sessionAfterWait } } = await supabase.auth.getSession()
      
      if (sessionAfterWait) {
        setHasSession(true)
        setIsChecking(false)
        if (subscription) {
          subscription.unsubscribe()
        }
        return
      }

      // Check if there's a hash fragment (Supabase redirects with hash fragments)
      const currentHashParams = getHashParams()
      const hasHashFragment = Object.keys(currentHashParams).length > 0
      
      // If we have hash fragments, Supabase SSR should process them automatically
      // Give it more time to process if hash fragments are present
      if (hasHashFragment) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session: hashSession } } = await supabase.auth.getSession()
        if (hashSession) {
          setHasSession(true)
          setIsChecking(false)
          if (subscription) {
            subscription.unsubscribe()
          }
          return
        }
      }

      // If we have a token_hash in query params, try to verify it manually
      if (tokenHash && type === 'recovery') {
        try {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          })
          
          if (verifyError || !data.session) {
            setError("Invalid or expired reset link. Please request a new password reset.")
            setIsChecking(false)
            if (subscription) {
              subscription.unsubscribe()
            }
            return
          }
          
          setHasSession(true)
          setError("")
          setIsChecking(false)
          if (subscription) {
            subscription.unsubscribe()
          }
          return
        } catch (err) {
          setError("Invalid or expired reset link. Please request a new password reset.")
          setIsChecking(false)
          if (subscription) {
            subscription.unsubscribe()
          }
          return
        }
      }

      // Final check - wait a bit more and then show error if still no session
      setTimeout(async () => {
        const { data: { session: finalSession } } = await supabase.auth.getSession()
        if (!finalSession) {
          // Only show error if we truly don't have a session and no code/token
          if (!code && !hasHashFragment && !tokenHash) {
            setError("Invalid or missing reset token. Please request a new password reset link.")
          } else {
            setError("Reset link could not be verified. Please request a new password reset link.")
          }
        } else {
          setHasSession(true)
          setError("")
        }
        setIsChecking(false)
        if (subscription) {
          subscription.unsubscribe()
        }
      }, 1000)
    }

    checkSession()
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - we check URL params inside

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

    if (!hasSession) {
      setError("Invalid reset link. Please request a new password reset.")
      return
    }

    setError("")

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Security: Strong password validation
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()
      
      // Update the password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        throw new Error(updateError.message || "Failed to reset password")
      }

      // Sign out to clear session after password reset for security
      await supabase.auth.signOut()

      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login?reset=success")
      }, 2000)
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. The link may have expired. Please request a new one.")
    } finally {
      setIsLoading(false)
    }
  }

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
          <h2 className="text-xl font-bold text-foreground">Password Reset Successful!</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your password has been successfully updated. You can now login with your new password.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {isChecking && (
          <div className="bg-muted/50 border border-border text-muted-foreground text-sm p-3 rounded text-center">
            Verifying reset link...
          </div>
        )}

        {error && !isChecking && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
            {error}
          </div>
        )}

        {hasSession && !isChecking && (
          <>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading || !hasSession} className="w-full">
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </>
        )}

        <div className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline font-medium">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}

