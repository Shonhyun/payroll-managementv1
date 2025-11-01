import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { checkRateLimit } from "@/lib/rate-limit"

/**
 * Forgot Password API route
 * Sends password reset email via Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Rate limiting - max 5 attempts per 15 minutes per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(`forgot-password:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 })) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    // Security: Input validation
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Security: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Create Supabase client for API route with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Note: Cannot set cookies in API route response directly
            // But this is okay for password reset as we don't need session
          },
          remove(name: string, options: any) {
            // Note: Cannot remove cookies in API route response directly
          },
        },
      }
    )

    const normalizedEmail = email.trim().toLowerCase()

    // Security: Use Supabase password reset
    // This will send a password reset email to the user
    // The redirectTo URL should match your site URL configuration in Supabase
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : 'http://localhost:3000'
    
    // Redirect directly to reset-password - the client will handle the code
    const redirectTo = `${siteUrl}/reset-password`

    // Use resetPasswordForEmail - Supabase will send email with code
    // Note: If PKCE is enabled in Supabase, we'll handle it client-side
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
      // Disable PKCE flow for password reset if possible (depends on Supabase version)
      // Some versions support this option
    })

    if (error) {
      // Log error in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error("Password reset error:", error.message)
        console.error("Full error:", error)
      }
      
      // Security: Generic error message to prevent email enumeration
      // But we should still log for debugging
      // Supabase will silently fail if email doesn't exist, which is the correct behavior
      
      // Return success even on error to prevent email enumeration
      // In production, Supabase handles this correctly
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent."
      })
    }

    // Security: Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent."
    })
  } catch (error: any) {
    // Security: Don't leak error details in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Forgot password error:", error)
    }
    
    // Still return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent."
    })
  }
}

