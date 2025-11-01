import { type NextRequest, NextResponse } from "next/server"
import { createServerClientLegacy } from "@/lib/supabaseClient"
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit"

/**
 * Login API route with security enhancements:
 * - Rate limiting (5 attempts per 15 minutes per IP)
 * - Input validation and sanitization
 * - Generic error messages to prevent user enumeration
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Rate limiting - max 5 attempts per 15 minutes per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 })) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    // Security: Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Security: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Security: Password length validation (minimum 6 chars)
    if (password.length < 6) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const supabase = createServerClientLegacy()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), // Normalize email
      password,
    })

    if (error) {
      // Security: Generic error message to prevent user enumeration
      // Don't reveal whether email exists or password is wrong
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Security: Clear rate limit on successful login
    clearRateLimit(`login:${ip}`)

    // Security: Don't expose sensitive user data
    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
    })
  } catch (error: any) {
    // Security: Don't leak error details in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Login error:", error)
    }
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
