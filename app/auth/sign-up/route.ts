import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendNewUserNotification } from '@/lib/email';


export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const formData = await request.formData();
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const firstName = String(formData.get('firstName'));
    const lastName = String(formData.get('lastName'));
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet security requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    console.log('signing up')
    // Simply attempt to sign up - Supabase will handle duplicates
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
        emailRedirectTo: `${requestUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      // Handle duplicate user errors
      if (error.message.includes('User already registered') || 
          error.message.includes('already been registered') ||
          error.message.includes('already exists') ||
          error.message.includes('duplicate key value')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 400 }
        );
      }
      
      // Provide user-friendly error messages for other errors
      const errorMessage = getErrorMessage(error.message);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // If signup successful, create user settings immediately using service role client
    // This bypasses RLS since the user isn't authenticated yet
    if (user) {
      try {
        // Create service role client to bypass RLS
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
console.log(user.id, user);
        const { error: settingsError } = await serviceClient
          .from('user_settings')
          .insert([{
            user_id: user.id,
            two_factor_enabled: false,
            two_factor_secret: null,
            settings: {
              notifications: {
                email: true,
                push: false
              },
              preferences: {
                theme: 'dark',
                language: 'en'
              }
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (settingsError) {
          console.error('Failed to create user settings:', settingsError);
          // Don't fail the signup if settings creation fails
          // User can still sign up, settings will be created on first login
        } else {
          console.log('User settings created successfully for:', user.id);
        }
      } catch (settingsError) {
        console.error('Error creating user settings:', settingsError);
        // Continue with signup even if settings creation fails
      }
    }

    if (user && !user.email_confirmed_at) {
      if (user) {
        sendNewUserNotification(user.email!, user.user_metadata.first_name + ' ' + user.user_metadata.last_name);
      }
      return NextResponse.json({
        success: true,
        requiresEmailConfirmation: true,
        message: 'Account created successfully! Please check your email to confirm your account before signing in.',
        userId: user.id
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      userId: user?.id
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Password validation function
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
}

// User-friendly error messages
function getErrorMessage(supabaseError: string): string {
  const errorMap: Record<string, string> = {
    'User already registered': 'An account with this email already exists. Please sign in instead.',
    'already been registered': 'An account with this email already exists. Please sign in instead.',
    'already exists': 'An account with this email already exists. Please sign in instead.',
    'duplicate key value': 'An account with this email already exists. Please sign in instead.',
    'Invalid email': 'Please enter a valid email address.',
    'Password should be at least 6 characters': 'Password must be at least 8 characters long.',
    'Unable to validate email address': 'Please enter a valid email address.',
    'Signup is disabled': 'Account creation is temporarily disabled. Please try again later.',
    'Email not confirmed': 'Please check your email and click the confirmation link.',
  };
  
  return errorMap[supabaseError] || 'An error occurred during sign up. Please try again.';
} 