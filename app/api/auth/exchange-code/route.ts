import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * Exchange Code for Session API Route
 * Handles PKCE code exchange server-side for password reset
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    // Create Supabase client with proper cookie handling
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Try to exchange code for session
    // Note: For PKCE, this might fail if code_verifier is missing
    // For password reset, we'll try verifyOtp instead
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && exchangeData.session) {
      // Success - return the session info
      const redirectResponse = NextResponse.json({ 
        success: true,
        session: {
          access_token: exchangeData.session.access_token,
          // Don't send full session for security
        }
      }, { status: 200 })
      
      // Copy cookies to response
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          path: cookie.path || '/',
          ...cookie,
        })
      })
      
      return redirectResponse
    }

    // If exchangeCodeForSession fails (PKCE issue), try verifyOtp
    // The code might actually be a token_hash for recovery
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: 'recovery'
    })

    if (!otpError && otpData.session) {
      // Set the session
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: otpData.session.access_token,
        refresh_token: otpData.session.refresh_token,
      })

      if (!setSessionError) {
        const successResponse = NextResponse.json({ success: true }, { status: 200 })
        
        // Copy cookies
        response.cookies.getAll().forEach(cookie => {
          successResponse.cookies.set(cookie.name, cookie.value, {
            path: cookie.path || '/',
            ...cookie,
          })
        })
        
        return successResponse
      }
    }

    // Both methods failed - log details for debugging
    const errorDetails = {
      exchangeError: exchangeError?.message,
      otpError: otpError?.message,
      hasCode: !!code,
      codeLength: code?.length
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error("Code exchange failed:", errorDetails)
    }
    
    return NextResponse.json(
      { 
        error: "Invalid or expired reset code. Please request a new password reset link.",
        ...(process.env.NODE_ENV === 'development' ? { details: errorDetails } : {})
      },
      { status: 400 }
    )
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Exchange code error:", error)
    }
    return NextResponse.json(
      { error: "Failed to verify reset code. Please request a new password reset link." },
      { status: 500 }
    )
  }
}

