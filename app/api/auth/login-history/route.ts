import { type NextRequest, NextResponse } from "next/server"
import { createServerClientLegacy } from "@/lib/supabaseClient"

/**
 * Get login history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientLegacy()
    
    // Get the current user session
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Extract token from header
    const token = authHeader.replace("Bearer ", "")
    
    // Set the session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Fetch login history
    const { data, error } = await supabase
      .from("login_history")
      .select("*")
      .eq("user_id", user.id)
      .order("login_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching login history:", error)
      return NextResponse.json(
        { error: "Failed to fetch login history" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      history: data || [],
      total: data?.length || 0,
    })
  } catch (error: any) {
    console.error("Login history error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching login history" },
      { status: 500 }
    )
  }
}

/**
 * Record a login event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      userId,
      sessionId,
      ipAddress,
      userAgent,
      location,
      status = "success",
      sessionToken,
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Create supabase client
    const supabase = createServerClientLegacy()
    
    // If session token is provided, verify and set the session
    if (sessionToken) {
      // Verify the session token
      const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken)
      
      if (userError || !user) {
        console.error("User verification failed:", userError)
        return NextResponse.json(
          { error: "Invalid session token" },
          { status: 401 }
        )
      }
      
      if (user.id !== userId) {
        console.error("User ID mismatch")
        return NextResponse.json(
          { error: "User ID mismatch" },
          { status: 403 }
        )
      }
      
      // Set the session for RLS policies
      // Note: In API routes, we need to use the session token in the request context
      // For RLS to work, we'll use supabase.auth.setSession or create a client with the token
      try {
        // Create a session object and set it
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: sessionToken,
          refresh_token: sessionToken, // Use access token as fallback
        })
        
        // If setSession fails, try to get the session another way
        if (sessionError) {
          console.warn("Could not set session, trying alternative method:", sessionError)
        }
      } catch (sessionErr) {
        console.warn("Session setting failed, continuing with insert:", sessionErr)
      }
    }

    // Get device info from user agent
    const deviceType = getDeviceType(userAgent || "")
    const deviceName = getDeviceName(userAgent || "")

    // Insert login history - RLS will allow this if user is authenticated
    // We need to set the session in the request context
    // For API routes, we can use the session token directly
    const { data, error } = await supabase
      .from("login_history")
      .insert({
        user_id: userId,
        session_id: sessionId,
        ip_address: ipAddress || "unknown",
        user_agent: userAgent || "",
        device_type: deviceType,
        device_name: deviceName,
        location: location || "Unknown",
        status: status,
        login_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error recording login history:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      
      // Check if it's a permission error (RLS)
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        return NextResponse.json(
          { 
            error: "Permission denied",
            details: "RLS policy may be blocking the insert. Make sure the user is authenticated and the login_history table policies allow inserts.",
            hint: "Run the SQL script in supabase-login-history-table.sql to set up the table and policies"
          },
          { status: 403 }
        )
      }
      
      // Return error but don't fail - this is a non-critical operation
      return NextResponse.json(
        { 
          error: "Failed to record login history",
          details: error.message,
          code: error.code,
          hint: "Make sure the login_history table exists and RLS policies are set up correctly"
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      loginHistory: data,
    })
  } catch (error: any) {
    console.error("Login history recording error:", error)
    return NextResponse.json(
      { 
        error: "An error occurred while recording login history",
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Logout a specific session (mark as logged out)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClientLegacy()
    const body = await request.json()
    
    const { sessionId, userId } = body

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Session ID and User ID are required" },
        { status: 400 }
      )
    }

    // Get the current user session
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Update logout_at for the session
    const { error } = await supabase
      .from("login_history")
      .update({
        logout_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating login history:", error)
      return NextResponse.json(
        { error: "Failed to logout session" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Session logged out successfully",
    })
  } catch (error: any) {
    console.error("Logout session error:", error)
    return NextResponse.json(
      { error: "An error occurred while logging out session" },
      { status: 500 }
    )
  }
}

// Helper functions
function getDeviceType(userAgent: string): string {
  if (!userAgent) return "desktop"
  
  const ua = userAgent.toLowerCase()
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "mobile"
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet"
  }
  return "desktop"
}

function getDeviceName(userAgent: string): string {
  if (!userAgent) return "Unknown Device"
  
  const ua = userAgent.toLowerCase()
  if (ua.includes("iphone")) {
    return "iPhone"
  }
  if (ua.includes("ipad")) {
    return "iPad"
  }
  if (ua.includes("android") && ua.includes("mobile")) {
    return "Android Phone"
  }
  if (ua.includes("android")) {
    return "Android Tablet"
  }
  if (ua.includes("windows")) {
    return "Windows Desktop"
  }
  if (ua.includes("mac") || ua.includes("macintosh")) {
    return "Mac Desktop"
  }
  if (ua.includes("linux")) {
    return "Linux Desktop"
  }
  return "Unknown Device"
}

