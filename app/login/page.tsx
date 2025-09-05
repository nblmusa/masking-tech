"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAnalytics } from "@/hooks/useAnalytics"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [tempSession, setTempSession] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const analytics = useAnalytics()

  // Check for success/error messages from URL params
  useEffect(() => {
    const message = searchParams.get('message')
    const error = searchParams.get('error')
    
    if (message) {
      toast({
        title: "Success",
        description: message,
      })
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      })
    }
  }, [searchParams, toast])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch('/auth/sign-in', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }

      if (data.requires2FA) {
        setRequires2FA(true)
        setTempSession(data.tempSession)
        analytics.trackFeatureUsage('2fa_required', true)
      } else {
        analytics.trackLogin('password')
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      analytics.trackApiError('/auth/sign-in', error instanceof Error ? error.message : 'Failed to sign in')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)
    try {
      analytics.trackLogin('google')
      // Redirect to Google OAuth initiation endpoint
      window.location.href = '/api/auth/google/signin'
    } catch (error) {
      analytics.trackApiError('/api/auth/google/signin', error instanceof Error ? error.message : 'Failed to initiate Google sign in')
      toast({
        title: "Error",
        description: "Failed to initiate Google sign in. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  async function handle2FAVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: verificationCode,
          session: tempSession
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify 2FA')
      }

      if (data.requiresEmailConfirmation) {
        toast({
          title: "2FA Verified",
          description: data.message,
        })
        // User needs to check email for final authentication
        setRequires2FA(false)
        setVerificationCode('')
        setTempSession(null)
        return
      }

      analytics.trackLogin('2fa')
      analytics.trackFeatureUsage('2fa_verification', true)
      
      toast({
        title: "Success",
        description: "Two-factor authentication verified successfully.",
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      analytics.trackApiError('/auth/verify-2fa', error instanceof Error ? error.message : 'Failed to verify 2FA')
      analytics.trackFeatureUsage('2fa_verification', false)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify 2FA",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="max-w-md mx-auto p-6 sm:p-8 border-blue-100/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center space-y-2 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-colors duration-300">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse-subtle" />
              </div>
              <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Welcome back</h1>
              <p className="text-sm text-muted-foreground text-center">
                {requires2FA ? "Enter your verification code" : "Enter your email to sign in to your account"}
              </p>
            </div>

            {!requires2FA ? (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-700 dark:text-blue-300">Email</Label>
                  <Input 
                    id="email"
                    name="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    required 
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-700 dark:text-blue-300">Password</Label>
                  <Input 
                    id="password"
                    name="password" 
                    type="password" 
                    required 
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                    disabled={isLoading}
                  />
                  <div className="text-right">
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handle2FAVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode" className="text-blue-700 dark:text-blue-300">Verification Code</Label>
                  <Input 
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(5deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-40px) rotate(5deg); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}