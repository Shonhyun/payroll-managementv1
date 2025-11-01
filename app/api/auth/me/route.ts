import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabaseServer"

/**
 * Get current user API route - Fetches user from Supabase session
 * Security: Uses server-side session validation
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get user from server-side session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Security: Don't expose sensitive user data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    })
  } catch (error: any) {
    // Security: Don't leak error details in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Get user error:", error)
    }
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
