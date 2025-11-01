import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

// Supabase client for browser/client-side usage
// This file is safe to import in client components
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Legacy server client for API routes (keep for backward compatibility)
// Note: This uses browser client, for proper SSR use createServerClient from supabaseServer.ts
export function createServerClientLegacy() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey)
}

