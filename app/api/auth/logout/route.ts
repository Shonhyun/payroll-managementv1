import { type NextRequest, NextResponse } from "next/server"
import { createServerClientLegacy } from "@/lib/supabaseClient"

/**
 * Logout API route - Note: Client-side logout in AuthContext is the primary method
 * This route exists for compatibility but logout is handled client-side
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientLegacy()
    
    // Get the authorization header if provided
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "")
      await supabase.auth.signOut()
    }

    // Security: Always return success to prevent information leakage
    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Security: Don't leak error details
    if (process.env.NODE_ENV === 'development') {
      console.error("Logout error:", error)
    }
    // Even if there's an error, return success (logout should always succeed client-side)
    return NextResponse.json({ success: true })
  }
}
