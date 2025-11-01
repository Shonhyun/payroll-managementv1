"use client"

import { useState, useEffect, useCallback } from "react"

interface RateLimitState {
  isBlocked: boolean
  remainingSeconds: number
  attemptsRemaining: number
}

interface RateLimitStorage {
  attempts: number[]
  blockedUntil: number | null
}

/**
 * Custom hook for client-side rate limiting with localStorage persistence
 * @param key - Unique key for this rate limit (e.g., 'login' or 'signup')
 * @param limit - Maximum number of attempts allowed
 * @param cooldown - Cooldown period in seconds after limit is reached
 * @returns Object with rate limit state and methods
 */
export function useRateLimit(
  key: string,
  limit: number = 5,
  cooldown: number = 60
) {
  const storageKey = `rate_limit_${key}`
  const windowMs = 60 * 1000 // 1 minute window for attempts

  const [state, setState] = useState<RateLimitState>(() => {
    // Initialize from localStorage
    if (typeof window === "undefined") {
      return {
        isBlocked: false,
        remainingSeconds: 0,
        attemptsRemaining: limit,
      }
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        return {
          isBlocked: false,
          remainingSeconds: 0,
          attemptsRemaining: limit,
        }
      }

      const data: RateLimitStorage = JSON.parse(stored)
      const now = Date.now()

      // Check if currently blocked
      if (data.blockedUntil && now < data.blockedUntil) {
        const remainingSeconds = Math.ceil((data.blockedUntil - now) / 1000)
        return {
          isBlocked: true,
          remainingSeconds,
          attemptsRemaining: 0,
        }
      }

      // Clean up old attempts outside the 1-minute window
      const validAttempts = data.attempts.filter(
        (timestamp) => now - timestamp < windowMs
      )

      // If we have a stored block that expired, clear it
      if (data.blockedUntil && now >= data.blockedUntil) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            attempts: validAttempts,
            blockedUntil: null,
          })
        )
      }

      return {
        isBlocked: false,
        remainingSeconds: 0,
        attemptsRemaining: limit - validAttempts.length,
      }
    } catch {
      return {
        isBlocked: false,
        remainingSeconds: 0,
        attemptsRemaining: limit,
      }
    }
  })

  // Update state from localStorage periodically during countdown
  useEffect(() => {
    if (!state.isBlocked) return

    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(storageKey)
        if (!stored) {
          setState({
            isBlocked: false,
            remainingSeconds: 0,
            attemptsRemaining: limit,
          })
          return
        }

        const data: RateLimitStorage = JSON.parse(stored)
        const now = Date.now()

        if (data.blockedUntil && now < data.blockedUntil) {
          const remainingSeconds = Math.ceil((data.blockedUntil - now) / 1000)
          setState({
            isBlocked: true,
            remainingSeconds,
            attemptsRemaining: 0,
          })
        } else {
          // Block expired
          setState({
            isBlocked: false,
            remainingSeconds: 0,
            attemptsRemaining: limit,
          })
        }
      } catch {
        setState({
          isBlocked: false,
          remainingSeconds: 0,
          attemptsRemaining: limit,
        })
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [state.isBlocked, storageKey, limit])

  const recordAttempt = useCallback(
    (failed: boolean = true) => {
      if (typeof window === "undefined") return false

      try {
        const stored = localStorage.getItem(storageKey)
        const now = Date.now()

        let data: RateLimitStorage = stored
          ? JSON.parse(stored)
          : { attempts: [], blockedUntil: null }

        // Clean up old attempts outside the 1-minute window
        data.attempts = data.attempts.filter(
          (timestamp) => now - timestamp < windowMs
        )

        // If currently blocked, don't record new attempts
        if (data.blockedUntil && now < data.blockedUntil) {
          const remainingSeconds = Math.ceil(
            (data.blockedUntil - now) / 1000
          )
          setState({
            isBlocked: true,
            remainingSeconds,
            attemptsRemaining: 0,
          })
          return true // Indicates blocked
        }

        // Only record failed attempts
        if (failed) {
          data.attempts.push(now)
        }

        // Check if limit exceeded
        if (data.attempts.length >= limit) {
          const blockedUntil = now + cooldown * 1000
          data.blockedUntil = blockedUntil

          setState({
            isBlocked: true,
            remainingSeconds: cooldown,
            attemptsRemaining: 0,
          })
        } else {
          data.blockedUntil = null
          setState({
            isBlocked: false,
            remainingSeconds: 0,
            attemptsRemaining: limit - data.attempts.length,
          })
        }

        localStorage.setItem(storageKey, JSON.stringify(data))
        return data.blockedUntil !== null // Return true if blocked
      } catch (error) {
        console.error("Rate limit storage error:", error)
        return false
      }
    },
    [storageKey, limit, cooldown, windowMs]
  )

  const reset = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(storageKey)
      setState({
        isBlocked: false,
        remainingSeconds: 0,
        attemptsRemaining: limit,
      })
    } catch (error) {
      console.error("Rate limit reset error:", error)
    }
  }, [storageKey, limit])

  return {
    isBlocked: state.isBlocked,
    remainingSeconds: state.remainingSeconds,
    attemptsRemaining: state.attemptsRemaining,
    recordAttempt,
    reset,
  }
}

