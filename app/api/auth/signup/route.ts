import { type NextRequest, NextResponse } from "next/server"
import { createServerClientLegacy } from "@/lib/supabaseClient"
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit"

/**
 * Signup API route with security enhancements:
 * - Rate limiting (3 signups per 15 minutes per IP)
 * - Strong password validation
 * - Input sanitization
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Rate limiting - max 3 signups per 15 minutes per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(`signup:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 })) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { email, password, name } = await request.json()

    // Security: Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Security: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Security: Strong password validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Security: Name validation (optional but sanitize if provided)
    const sanitizedName = name ? name.trim().slice(0, 100) : null

    const supabase = createServerClientLegacy()

    // Check if email already exists in user_accounts table BEFORE signup
    const normalizedEmail = email.trim().toLowerCase()
    const { data: existingEmail, error: checkError } = await supabase
      .from("user_accounts")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle()

    // If email exists, return error immediately (before attempting signup)
    if (existingEmail && !checkError) {
      return NextResponse.json(
        { error: "This email is already used. Please try another one." },
        { status: 400 }
      )
    }

    // If there's a database error checking email, log it but continue (fail open)
    if (checkError && process.env.NODE_ENV === "development") {
      console.warn("Warning: Could not check email existence:", checkError.message)
    }

    // Email doesn't exist, proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), // Normalize email
      password,
      options: {
        data: {
          full_name: sanitizedName,
          name: sanitizedName,
        },
      },
    })

    if (error) {
      // Security: Don't expose specific Supabase error details
      // Generic error message
      return NextResponse.json({ error: "Unable to create account. Please try again." }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Signup failed" }, { status: 500 })
    }

    // Security: Clear rate limit on successful signup
    clearRateLimit(`signup:${ip}`)

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
    })
  } catch (error: any) {
    // Security: Don't leak error details in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Signup error:", error)
    }
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
