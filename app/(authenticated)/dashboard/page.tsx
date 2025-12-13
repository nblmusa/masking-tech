"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  BarChart3, 
  Image as ImageIcon, 
  Upload, 
  Settings, 
  CreditCard,
  History,
  Car,
  Shield,
  Gauge,
  Lock,
  ArrowRight,
  Sparkles,
  Key,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { useDashboard } from "@/hooks/use-dashboard"
import { formatDistanceToNow } from 'date-fns'
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { PLANS } from "@/lib/stripe"

export default function DashboardPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const {
    isLoading,
    stats,
    subscriptionTier,
    recentActivity,
    apiKey,
    isAuthenticated,
    user,
    generateNewApiKey,
    copyApiKey,
    refreshData
  } = useDashboard()
  const router = useRouter()
  const { toast } = useToast()
  
  const plan = PLANS[subscriptionTier.toUpperCase()] || PLANS.FREE
  const planName = plan.name

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const subscription = searchParams.get('subscription');
    const returnTo = searchParams.get('returnTo');

    // Handle subscription status
    if (subscription === 'success') {
      toast({
        title: "Success",
        description: "Your subscription has been updated successfully.",
      });
    } else if (subscription === 'cancelled') {
      toast({
        description: "Subscription process was cancelled.",
      });
    }

    // Clean up URL parameters
    if (subscription || returnTo) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('subscription');
      newUrl.searchParams.delete('returnTo');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Handle return URL if present
    if (returnTo) {
      try {
        const returnUrl = new URL(returnTo);
        // Only allow redirects to our own domain
        if (returnUrl.origin === window.location.origin) {
          router.push(returnUrl.pathname + returnUrl.search);
        }
      } catch (error) {
        console.error('Invalid return URL:', error);
      }
    }
  }, [router, toast]);

  // Add function to handle image click
  const handleImageClick = (processedUrl: string) => {
    window.open(processedUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-1 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <div className="p-6 border-b">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </div>
              </Card>

              <div className="space-y-8">
                <Card>
                  <div className="p-6 border-b">
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="p-6">
                    <Skeleton className="h-12 rounded-lg" />
                  </div>
                </Card>

                <Card>
                  <div className="p-6 border-b">
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="divide-y">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <Card className="max-w-md mx-auto p-6">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  let usagePercentage = (stats.imagesProcessed / stats.monthlyQuota) * 100
  if(stats.monthlyQuota < stats.imagesProcessed){
    usagePercentage = 100;
  }
  const isNearLimit = usagePercentage >= 80

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              Overview of your account activity and usage statistics
            </p>
          </div>
        </div>

        {/* Usage Alert */}
        {isNearLimit && (
          <Alert className="bg-yellow-50/50 bg-yellow-950/50 border-yellow-200/50 border-yellow-800/50">
            <AlertTriangle className="h-4 w-4 text-yellow-600 text-yellow-400" />
            <AlertTitle className="text-yellow-600 text-yellow-400">Usage Limit Approaching</AlertTitle>
            <AlertDescription className="text-yellow-600/90 text-yellow-400/90">
              You have used {Math.round(usagePercentage)}% of your monthly image processing limit. Consider upgrading to our Pro plan for unlimited processing.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 from-gray-800 via-blue-900/3 to-blue-800/5 border-blue-100/30 border-blue-800/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Images Processed</p>
                <h3 className="text-2xl font-bold">{stats.imagesProcessed}</h3>
              </div>
            </div>
            <Progress value={usagePercentage} className="h-2 mb-3" />
            <p className="text-xs text-muted-foreground">
              {stats.monthlyQuota - stats.imagesProcessed} images remaining this month
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 from-gray-800 via-blue-900/3 to-blue-800/5 border-blue-100/30 border-blue-800/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                <Gauge className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Usage</p>
                <h3 className="text-2xl font-bold">{Math.round(usagePercentage)}%</h3>
              </div>
            </div>
            <Progress value={usagePercentage} className="h-2 mb-3" />
            <p className="text-xs text-muted-foreground">Reset in {new Date().getDate()} days</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 from-gray-800 via-blue-900/3 to-blue-800/5 border-blue-100/30 border-blue-800/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">License Plates Detected</p>
                <h3 className="text-2xl font-bold">{stats.detectedPlates}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total plates detected and masked</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 from-gray-800 via-blue-900/3 to-blue-800/5 border-blue-100/30 border-blue-800/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Upload</p>
                <h3 className="text-2xl font-bold">
                  {stats.lastUploadTime ? formatDistanceToNow(new Date(stats.lastUploadTime), { addSuffix: true }) : 'Never'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Upload className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Process more images</span>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 from-gray-800 via-blue-900/3 to-blue-800/5 border-blue-100/30 border-blue-800/30">
            <div className="p-6 border-b border-blue-100/30 border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 from-blue-900/50 to-indigo-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/history">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square">
                      <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recentActivity.slice(0, 6).map((activity, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square relative bg-muted rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => handleImageClick(activity.processedUrl)}
                    >
                      {activity.processedUrl ? (
                        <Image
                          src={activity.processedUrl}
                          alt={activity.filename || 'Processed image'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Overlay with info */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                        <div className="p-2 w-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-medium truncate">
                            {activity.filename || 'Image processed'}
                          </p>
                          <p className="text-white/80 text-xs">
                            {formatDistanceToNow(new Date(activity.processedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Click indicator */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 bg-black/90 rounded-full p-1">
                          <Eye className="h-3 w-3 text-gray-700 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Image
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Right Column - API Access and Account Overview */}
          <div className="space-y-6">
            {/* API Access */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 from-gray-800 via-blue-900/3 to-blue-800/5 border-blue-100/30 border-blue-800/30">
              <div className="p-6 border-b border-blue-100/30 border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 from-blue-900/50 to-indigo-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">API Key</h2>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings/api-keys">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Keys
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <Skeleton className="h-12 rounded-lg" />
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 font-mono text-sm truncate">
                        {apiKey ? (showApiKey ? apiKey : '•'.repeat(40)) : 'No API key generated'}
                      </div>
                      {apiKey && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="h-8 w-8 p-0"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyApiKey}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* Account Overview */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 from-gray-800 via-blue-900/3 to-blue-800/5 border-blue-100/30 border-blue-800/30">
              <div className="p-6 border-b border-blue-100/30 border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 from-blue-900/50 to-indigo-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Account Overview</h2>
                  </div>
                </div>
              </div>
              <div className="divide-y">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{planName} Plan</p>
                      <p className="text-sm text-muted-foreground">{stats.monthlyQuota} images per month</p>
                    </div>
                    {subscriptionTier === 'free' && (
                      <Button variant="outline" size="sm" className="gap-2 flex-shrink-0" asChild>
                        <Link href="/settings/billing">
                          <Sparkles className="h-4 w-4" />
                          Upgrade
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Billing & Usage</p>
                      <p className="text-sm text-muted-foreground">View invoices and manage subscription</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 flex-shrink-0" asChild>
                      <Link href="/settings/billing">
                        <CreditCard className="h-4 w-4" />
                        View Billing
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}