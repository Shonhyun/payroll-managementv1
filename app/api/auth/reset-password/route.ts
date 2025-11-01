import { type NextRequest, NextResponse } from "next/server"
import { createServerClientLegacy } from "@/lib/supabaseClient"

/**
 * Reset Password API route
 * Updates user password using the reset token from email
 */
export async function POST(request: NextRequest) {
  try {
    const { token, password, type } = await request.json()

    // Security: Input validation
    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Security: Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      )
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      )
    }

    const supabase = createServerClientLegacy()

    // For password recovery flow, we need to exchange the token for a session
    // then update the password
    if (type === "recovery") {
      // Exchange the recovery token for a session
      const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })

      if (sessionError || !sessionData.session) {
        return NextResponse.json(
          { error: "Invalid or expired reset link. Please request a new password reset." },
          { status: 400 }
        )
      }

      // Set the session to update password
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      })

      if (setSessionError) {
        return NextResponse.json(
          { error: "Failed to verify reset link. Please request a new password reset." },
          { status: 400 }
        )
      }
    } else {
      // For email links, we need to check if there's an active session
      // This happens when user clicks the reset link from email
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return NextResponse.json(
          { error: "Reset link has expired or is invalid. Please request a new password reset." },
          { status: 400 }
        )
      }
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password. Please try again or request a new reset link." },
        { status: 400 }
      )
    }

    // Clear the session after password reset for security
    await supabase.auth.signOut()

    return NextResponse.json({
      message: "Password has been successfully reset."
    })
  } catch (error: any) {
    // Security: Don't leak error details in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Reset password error:", error)
    }
    return NextResponse.json(
      { error: "An error occurred. Please try again or request a new reset link." },
      { status: 500 }
    )
  }
}

