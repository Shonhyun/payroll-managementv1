import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth Callback Route
 * Handles OAuth and password reset callbacks from Supabase
 * For password reset, we redirect to reset-password with the code
 * and let the client handle it (since PKCE requires client-side handling)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/reset-password'

  if (code) {
    // For password reset, redirect to reset-password with the code
    // The client will handle the code exchange since PKCE requires client-side handling
    const redirectUrl = new URL(next, request.url)
    redirectUrl.searchParams.set('code', code)
    redirectUrl.searchParams.set('type', 'recovery')
    return NextResponse.redirect(redirectUrl)
  }

  // If no code, redirect to reset password page
  const redirectUrl = new URL('/reset-password', request.url)
  return NextResponse.redirect(redirectUrl)
}

