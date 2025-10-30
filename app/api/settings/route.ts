import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/settings
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      throw preferencesError
    }

    return NextResponse.json({
      profile: {
        firstName: session.user.user_metadata?.first_name || '',
        lastName: session.user.user_metadata?.last_name || '',
        email: session.user.email || '',
        phone: session.user.user_metadata?.phone || '',
        avatar_url: session.user.user_metadata?.avatar_url
      },
      preferences: {
        ...preferences,
        email_notifications: preferences?.email_notifications || {
          newLogin: true,
          usageAlerts: true,
          newsletter: false,
          marketing: false
        },
        auto_processing: preferences?.auto_processing || {
          autoMask: true,
          autoDownload: false,
          saveOriginal: true,
          highQuality: false
        }
      }
    })
  } catch (error) {
    console.error('Settings API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profile, preferences } = body

    console.log('Updating profile:', profile)

    // Update user metadata
    if (profile) {
      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          full_name: `${profile.firstName} ${profile.lastName}`,
          phone: profile.phone
        }
      })

      if (updateError) {
        console.error('Update user error:', updateError)
        throw updateError
      }
      
      console.log('User updated successfully:', updatedUser?.user?.user_metadata)
    }

    // Update preferences
    if (preferences) {
      const { error: preferencesError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })

      if (preferencesError) {
        console.error('Update preferences error:', preferencesError)
        throw preferencesError
      }
    }

    // Refresh the session to get updated user metadata
    const { data: { session: updatedSession }, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      console.error('Session refresh error:', refreshError)
    }
    
    console.log('Refreshed session metadata:', updatedSession?.user?.user_metadata)
    
    return NextResponse.json({ 
      success: true,
      profile: updatedSession ? {
        firstName: updatedSession.user.user_metadata?.first_name || '',
        lastName: updatedSession.user.user_metadata?.last_name || '',
        email: updatedSession.user.email || '',
        phone: updatedSession.user.user_metadata?.phone || ''
      } : undefined
    })
  } catch (error) {
    console.error('Settings Update Error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
} 