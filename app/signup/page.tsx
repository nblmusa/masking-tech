"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAnalytics } from "@/hooks/useAnalytics"

interface PasswordRequirement {
  text: string;
  met: boolean;
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([])
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
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

  // Password strength calculation
  useEffect(() => {
    const requirements: PasswordRequirement[] = [
      { text: 'At least 8 characters', met: password.length >= 8 },
      { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'One lowercase letter', met: /[a-z]/.test(password) },
      { text: 'One number', met: /[0-9]/.test(password) },
      { text: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
    ]
    
    setPasswordRequirements(requirements)
    
    const metCount = requirements.filter(req => req.met).length
    setPasswordStrength((metCount / requirements.length) * 100)
  }, [password])

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'text-red-500'
    if (passwordStrength < 80) return 'text-yellow-500'
    return 'text-green-500'
  }

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak'
    if (passwordStrength < 80) return 'Fair'
    return 'Strong'
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms of service to continue.",
        variant: "destructive"
      })
      return
    }

    if (password !== confirmPassword) {
      analytics.trackClientError('signup', 'Passwords do not match')
      throw new Error('Passwords do not match')
    }

    if (passwordStrength < 100) {
      analytics.trackClientError('signup', 'Password too weak')
      throw new Error('Password does not meet security requirements')
    }
    
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      
      const response = await fetch('/auth/sign-up', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      analytics.trackSignup('email')
      
      if (data.requiresEmailConfirmation) {
        toast({
          title: "Account Created!",
          description: data.message,
        })
        router.push('/login?message=' + encodeURIComponent('Please check your email to confirm your account before signing in.'))
      } else {
        toast({
          title: "Success",
          description: data.message || "Account created successfully!",
        })
        router.push('/login')
      }
    } catch (error) {
      analytics.trackApiError('/auth/sign-up', error instanceof Error ? error.message : 'Failed to sign up')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
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
              <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Create an account</h1>
              <p className="text-sm text-muted-foreground text-center">
                Enter your details to create your account
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-blue-700 dark:text-blue-300">First name</Label>
                  <Input 
                    id="firstName"
                    name="firstName"
                    required 
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-blue-700 dark:text-blue-300">Last name</Label>
                  <Input 
                    id="lastName"
                    name="lastName"
                    required 
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
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
                <div className="relative">
                  <Input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-medium ${getPasswordStrengthColor()}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength < 40 ? 'bg-red-500' : 
                          passwordStrength < 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    
                    {/* Password requirements */}
                    <div className="space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-700 dark:text-blue-300">Confirm password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    className={`border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors pr-10 ${
                      confirmPassword && password !== confirmPassword ? 'border-red-300 dark:border-red-600' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Terms of Service */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                  aria-label="Accept terms of service and privacy policy"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading || !acceptedTerms || passwordStrength < 100 || password !== confirmPassword}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Sign in
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