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
    const errorMessage = errorDescription || 'Google authentication failed'
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
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to authenticate with Google. Please try again.')}`
        )
      }

      if (data.user) {
        // Check if this is a new user (Google OAuth signup)
        const isNewUser = !data.user.created_at || 
          new Date(data.user.created_at).getTime() > Date.now() - 10000 // Created within last 10 seconds

        if (isNewUser) {
          // Create user settings for new Google OAuth users
          try {
            const { createClient } = await import('@supabase/supabase-js')
            const serviceClient = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              {
                auth: {
                  autoRefreshToken: false,
                  persistSession: false
                }
              }
            )

            const { error: settingsError } = await serviceClient
              .from('user_settings')
              .insert([{
                user_id: data.user.id,
                two_factor_enabled: false,
                two_factor_secret: null,
                settings: {
                  notifications: {
                    email: true,
                    push: false
                  },
                  preferences: {
                    theme: 'system',
                    language: 'en'
                  }
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }])

            if (settingsError) {
              console.error('Failed to create user settings for Google OAuth user:', settingsError)
              // Don't fail the authentication if settings creation fails
            } else {
              console.log('User settings created successfully for Google OAuth user:', data.user.id)
            }
          } catch (settingsError) {
            console.error('Error creating user settings for Google OAuth user:', settingsError)
            // Continue with authentication even if settings creation fails
          }
        }

        // Redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error('Error in Google OAuth callback:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Google authentication failed. Please try again.')}`
      )
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
