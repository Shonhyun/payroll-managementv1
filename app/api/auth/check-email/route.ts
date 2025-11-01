import { type NextRequest, NextResponse } from "next/server"
import { createServerClientLegacy } from "@/lib/supabaseClient"

/**
 * Check Email API route
 * Checks if email already exists in user_accounts table
 * Used before signup to prevent duplicate email registration
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Input validation
    if (!email) {
      return NextResponse.json(
        { error: "Email is required", exists: false },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format", exists: false },
        { status: 400 }
      )
    }

    const supabase = createServerClientLegacy()

    // Check if email exists in user_accounts table (case-insensitive via LOWER)
    const normalizedEmail = email.trim().toLowerCase()
    
    const { data, error } = await supabase
      .from("user_accounts")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle() // Returns null if no match instead of error

    if (error) {
      // If there's a database error, log it but don't block signup
      // (table might not exist yet or RLS issue)
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking email:", error)
      }
      // Return false so signup can proceed (fail open for development)
      return NextResponse.json({ exists: false, error: null }, { status: 200 })
    }

    // If data exists, email is already registered
    if (data) {
      return NextResponse.json(
        {
          exists: true,
          message: "This email is already used. Please try another one.",
        },
        { status: 200 }
      )
    }

    // Email doesn't exist, available for signup
    return NextResponse.json({ exists: false, message: null }, { status: 200 })
  } catch (error: any) {
    // Catch any unexpected errors
    if (process.env.NODE_ENV === "development") {
      console.error("Check email error:", error)
    }
    // Return false so signup can proceed (fail open)
    return NextResponse.json({ exists: false, error: null }, { status: 200 })
  }
}

