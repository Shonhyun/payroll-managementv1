// Simple in-memory rate limiter
// For production, use Redis-based solution like Upstash Ratelimit
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  limit?: number
  windowMs?: number
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit configuration
 * @returns true if within limit, false if exceeded
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): boolean {
  const { limit = 5, windowMs = 15 * 60 * 1000 } = options // Default: 5 attempts per 15 minutes
  const now = Date.now()
  const key = identifier

  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(identifier: string): number {
  const record = rateLimitMap.get(identifier)
  if (!record) return 5 // Default limit

  const now = Date.now()
  if (now > record.resetAt) {
    return 5 // Reset window expired
  }

  return Math.max(0, 5 - record.count)
}

/**
 * Get reset time for an identifier (in milliseconds)
 */
export function getResetTime(identifier: string): number | null {
  const record = rateLimitMap.get(identifier)
  if (!record) return null

  const now = Date.now()
  if (now > record.resetAt) {
    return null
  }

  return record.resetAt - now
}

/**
 * Clear rate limit for an identifier (useful after successful auth)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier)
}

/**
 * Clean up expired entries (should be called periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}

