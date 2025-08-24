import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (error) {
    // Handle authentication errors
    const errorMessage = errorDescription || 'Authentication failed'
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorMessage)}`
    )
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to verify email. Please try again.')}`
        )
      }

      if (data.user) {
        // Check if this is an email confirmation
        if (data.user.email_confirmed_at) {
          // Email was just confirmed, redirect to login with success message
          return NextResponse.redirect(
            `${requestUrl.origin}/login?message=${encodeURIComponent('Email confirmed successfully! You can now sign in to your account.')}`
          )
        }
        
        // Regular authentication, redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
      )
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}