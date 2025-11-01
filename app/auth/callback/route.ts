import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth Callback Route
 * Handles OAuth and password reset callbacks from Supabase
 * Handles both success (code) and error cases
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/reset-password'

  // If there's an error, redirect to reset-password with error params
  if (error) {
    const redirectUrl = new URL('/reset-password', request.url)
    if (error) redirectUrl.searchParams.set('error', error)
    if (errorCode) redirectUrl.searchParams.set('error_code', errorCode)
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription)
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    // For password reset, redirect to reset-password with the code
    // The client will handle the code exchange since PKCE requires client-side handling
    const redirectUrl = new URL(next, request.url)
    redirectUrl.searchParams.set('code', code)
    redirectUrl.searchParams.set('type', 'recovery')
    return NextResponse.redirect(redirectUrl)
  }

  // If no code and no error, redirect to reset password page
  const redirectUrl = new URL('/reset-password', request.url)
  return NextResponse.redirect(redirectUrl)
}

