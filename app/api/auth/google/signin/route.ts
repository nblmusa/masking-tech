import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendNewUserNotification } from '@/lib/email'


export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const redirectTo = `${requestUrl.origin}/auth/callback`
    console.log('Redirect URI being sent to Google:', redirectTo)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to initiate Google authentication. Please try again.')}`
      )
    }

    if (data.url) {
      return NextResponse.redirect(data.url)
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to initiate Google authentication.')}`
    )
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to initiate Google authentication. Please try again.')}`
    )
  }
}
