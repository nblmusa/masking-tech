# Google OAuth Integration Setup Guide

This guide will help you complete the Google OAuth integration with Supabase for your Next.js application.

## ✅ What's Already Implemented

1. **API Routes Created:**
   - `/api/auth/google/signin` - Initiates Google OAuth flow
   - `/api/auth/google` - Handles Google OAuth callback

2. **UI Components Updated:**
   - Login page now includes "Continue with Google" button
   - Sign-up page now includes "Continue with Google" button
   - Both pages have proper error handling and loading states

3. **Environment Configuration:**
   - Added Google OAuth credentials to environment variables (optional)

## 🔧 Required Setup Steps

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://yourdomain.com/auth/callback` (production)
     - `http://localhost:3000/auth/callback` (development)

### 2. Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and enable it
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Set the redirect URL to: `https://yourdomain.com/auth/callback`

### 3. Environment Variables (Optional)

Add these to your `.env.local` file (though Supabase handles the OAuth flow):

```bash
# Optional - Supabase handles OAuth internally
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Update Redirect URLs

Make sure your redirect URLs are properly configured:

**Development:**
- Google Console: `http://localhost:3000/auth/callback`
- Supabase: `http://localhost:3000/auth/callback`

**Production:**
- Google Console: `https://yourdomain.com/auth/callback`
- Supabase: `https://yourdomain.com/auth/callback`

## 🚀 How It Works

1. **User clicks "Continue with Google"** → Redirects to `/api/auth/google/signin`
2. **OAuth initiation** → Supabase redirects to Google OAuth
3. **User authenticates with Google** → Google redirects back to `/auth/callback`
4. **Callback handling** → Supabase exchanges code for session
5. **User settings creation** → Automatically creates user settings for new users
6. **Redirect to dashboard** → User is logged in and redirected

## 🔍 Testing the Integration

1. Start your development server: `npm run dev`
2. Go to `/login` or `/signup`
3. Click "Continue with Google"
4. Complete the Google OAuth flow
5. Verify you're redirected to the dashboard

## 🛠️ Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error:**
   - Check that your redirect URIs match exactly in Google Console and Supabase
   - Ensure no trailing slashes or extra characters

2. **"Client ID not found" error:**
   - Verify your Google OAuth credentials are correctly set in Supabase
   - Check that the Google+ API is enabled

3. **"Access denied" error:**
   - Make sure your Google OAuth consent screen is properly configured
   - Check that your domain is added to authorized domains

4. **User settings not created:**
   - Check the server logs for any errors in user settings creation
   - Verify the `user_settings` table exists in your Supabase database

### Debug Steps:

1. Check browser network tab for failed requests
2. Check server logs for authentication errors
3. Verify Supabase logs in the dashboard
4. Test with a different Google account

## 📝 Additional Notes

- The integration automatically creates user settings for new Google OAuth users
- Existing users can link their Google account by signing in with Google using the same email
- The OAuth flow works for both sign-in and sign-up scenarios
- All authentication state is managed by Supabase

## 🔒 Security Considerations

- Never expose your Google Client Secret in client-side code
- Use environment variables for sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor authentication logs for suspicious activity

Your Google OAuth integration is now ready! Users can sign in or sign up using their Google accounts seamlessly.
