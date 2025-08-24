import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { code, session } = await request.json();

    if (!code || !session?.email || !session?.userId || !session?.sessionToken) {
      return NextResponse.json(
        { error: 'Invalid request - missing required fields' },
        { status: 400 }
      );
    }

    // Validate session token expiry
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 400 }
      );
    }

    // Get user's 2FA settings
    let { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('two_factor_enabled, two_factor_secret')
      .eq('user_id', session.userId)
      .single();

    if (!settings?.two_factor_enabled || !settings?.two_factor_secret) {
      console.error('2FA is not properly configured:', { 
        enabled: settings?.two_factor_enabled,
        hasSecret: !!settings?.two_factor_secret 
      });
      return NextResponse.json(
        { error: '2FA is not properly configured' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: settings.two_factor_secret
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // If code is valid, we need to re-authenticate the user
    // Since we don't have the password anymore, we'll use a different approach
    // We can either:
    // 1. Use a magic link approach
    // 2. Store a temporary auth token
    // 3. Use Supabase's built-in 2FA flow
    
    // For now, let's use a magic link approach for security
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: session.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`
      }
    });

    if (magicLinkError) {
      console.error('Failed to send magic link:', magicLinkError);
      return NextResponse.json(
        { error: 'Failed to complete authentication. Please try signing in again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: '2FA verified. Please check your email for the final authentication link.',
      requiresEmailConfirmation: true
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 