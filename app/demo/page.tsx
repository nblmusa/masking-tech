"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Camera, Car, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ImageComparison } from "@/app/components/image-comparison"
import { useEffect } from "react"
import { useAnalytics } from "@/hooks/useAnalytics"

export default function DemoPage() {
  const analytics = useAnalytics()

  useEffect(() => {
    // Track feature view with campaign data from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const campaign = urlParams.get('utm_campaign') || 'direct'
    const source = urlParams.get('utm_source') || 'direct'
    const medium = urlParams.get('utm_medium') || 'none'
    
    // Use feature usage tracking instead
    analytics.trackFeatureUsage('demo_view', true)
    
    // Track subscription view for the demo page
    analytics.trackSubscriptionView('demo')
  }, [analytics])

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-900/95">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col items-center space-y-6 sm:space-y-8 text-center">
            <div className="space-y-4 sm:space-y-6 max-w-3xl">
              <div className="mx-auto bg-gradient-to-r from-blue-400/3 via-blue-300/3 to-indigo-400/3 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-blue-800/20 w-fit animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300">
                <p className="text-xs sm:text-sm font-medium text-blue-300/90 flex items-center gap-2">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4 animate-bounce-subtle" />
                  <span className="relative">
                    AI-Powered Demo
                  </span>
                </p>
              </div>
              <h1 className="text-3xl pb-2 sm:text-4xl md:text-5xl lg:text-6xl/none font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 via-blue-300/80 to-blue-200/80 animate-fade-in-up [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
                See MaskingTech in Action
              </h1>
              <p className="mx-auto max-w-[700px] text-base sm:text-lg md:text-xl text-gray-300/90 animate-fade-in-up delay-100 px-4">
                Experience our powerful AI technology that automatically detects and masks license plates and faces while enhancing vehicle images.
              </p>
            </div>

            {/* Image comparison section with responsive layout */}
            <div className="w-full max-w-5xl mt-8 sm:mt-12 animate-fade-in-up delay-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* First comparison */}
                <div className="flex flex-col">
                  <ImageComparison
                    beforeImage="/images/volvo-before.webp"
                    afterImage="/images/volvo-after.jpeg"
                    beforeLabel="Original Image"
                    afterLabel="Protected Image"
                    className="hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="mt-3 text-center text-sm text-muted-foreground">
                    Drag the slider to compare • License plate detection
                  </div>
                </div>
                
                {/* Second comparison */}
                <div className="flex flex-col">
                  <ImageComparison
                    beforeImage="/images/listing-before.jpeg"
                    afterImage="/images/listing-after.jpeg"
                    beforeLabel="Original Image"
                    afterLabel="Protected Image"
                    className="hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="mt-3 text-center text-sm text-muted-foreground">
                    Drag the slider to compare • AI-powered masking
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up delay-200 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-w-[150px] group bg-gradient-to-r from-blue-500/80 via-blue-600/80 to-indigo-500/80 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Link href="/signup" className="flex items-center justify-center w-full">
                  Get 50 Free Credits <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[150px] border-blue-800/30 hover:bg-blue-950/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/pricing" className="w-full text-center">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-900/90 via-gray-900/95 to-gray-800/90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 via-blue-300/80 to-indigo-400/80 [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
              How MaskingTech Works
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our AI-powered technology provides industry-leading accuracy and speed
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="group flex flex-col items-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-gray-800 via-blue-900/3 to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Car className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">License Plate Detection</h3>
              <p className="text-center text-sm sm:text-base text-gray-300">
                Our AI instantly identifies license plates in any orientation or lighting condition.
              </p>
            </div>
            <div className="group flex flex-col items-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-gray-800 via-blue-900/3 to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">Privacy Protection</h3>
              <p className="text-center text-sm sm:text-base text-gray-300">
                Automatically mask sensitive information while maintaining image quality.
              </p>
            </div>
            <div className="group flex flex-col items-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-gray-800 via-blue-900/3 to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">Background Replacement</h3>
              <p className="text-center text-sm sm:text-base text-gray-300">
                Replace backgrounds with professional studio environments for a polished look.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-16 sm:py-20 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-gray-900" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl pb-2 sm:text-4xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 via-blue-300/80 to-indigo-400/80">
              Ready to Try MaskingTech?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Sign up today and get 50 free credits to experience our AI-powered image processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link href="/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-blue-800/30 hover:bg-blue-950/30" asChild>
                <Link href="/pricing">View All Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
