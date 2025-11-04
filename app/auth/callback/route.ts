import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth Callback Route
 * Handles OAuth, password reset, and email change confirmation callbacks from Supabase
 * Handles both success (code) and error cases
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next')
  
  // Create Supabase client to check session and process email change
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

  // Check if user has a session - if yes, might be email change confirmation
  const { data: { session } } = await supabase.auth.getSession()

  // If there's an error, determine redirect based on type
  if (error) {
    if (type === 'email_change' || (session && !type)) {
      // Email change error - redirect to settings
      const redirectUrl = new URL('/dashboard/settings', request.url)
      redirectUrl.searchParams.set('error', error)
      if (errorCode) redirectUrl.searchParams.set('error_code', errorCode)
      if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription)
      return NextResponse.redirect(redirectUrl)
    }
    // Password reset error - redirect to reset-password
    const redirectUrl = new URL('/reset-password', request.url)
    if (error) redirectUrl.searchParams.set('error', error)
    if (errorCode) redirectUrl.searchParams.set('error_code', errorCode)
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription)
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    // Check if this is an email change confirmation
    // Email change can be identified by: type=email_change, next includes settings, OR if user has active session
    // If user is logged in and has a code, it's likely an email change (password reset requires no session)
    if (type === 'email_change' || next?.includes('/dashboard/settings') || (session && type !== 'recovery')) {
      // Handle email change confirmation
      // Redirect to settings - the client will process the code
      const redirectUrl = new URL('/dashboard/settings', request.url)
      redirectUrl.searchParams.set('code', code)
      redirectUrl.searchParams.set('emailConfirmed', 'true')
      if (type) redirectUrl.searchParams.set('type', type)
      else redirectUrl.searchParams.set('type', 'email_change')
      return NextResponse.redirect(redirectUrl)
    }
    
    // For password reset, redirect to reset-password with the code
    // The client will handle the code exchange since PKCE requires client-side handling
    const redirectUrl = new URL(next || '/reset-password', request.url)
    redirectUrl.searchParams.set('code', code)
    redirectUrl.searchParams.set('type', 'recovery')
    return NextResponse.redirect(redirectUrl)
  }

  // If no code and no error but user has session, likely email change was auto-confirmed
  // Redirect to settings with confirmation flag
  if (session) {
    const redirectUrl = new URL('/dashboard/settings', request.url)
    redirectUrl.searchParams.set('emailConfirmed', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  // Default: redirect to reset password page
  const redirectUrl = new URL('/reset-password', request.url)
  return NextResponse.redirect(redirectUrl)
}

