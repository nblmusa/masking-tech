"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Building, Users, Shield, Zap, CheckCircle2, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useAnalytics } from "@/hooks/useAnalytics"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function EnterprisePage() {
  const analytics = useAnalytics()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Track feature usage with campaign data from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const campaign = urlParams.get('utm_campaign') || 'direct'
    const source = urlParams.get('utm_source') || 'direct'
    const medium = urlParams.get('utm_medium') || 'none'
    
    analytics.trackFeatureUsage('enterprise_view', true)
    analytics.trackSubscriptionView('enterprise')
  }, [analytics])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Request Submitted",
        description: "Our enterprise team will contact you shortly.",
      })
      
      analytics.trackFeatureUsage('enterprise_contact', true)
      
      // Reset form
      const form = e.target as HTMLFormElement
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      })
      analytics.trackClientError('enterprise_contact', 'Form submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                  <Building className="h-3 w-3 sm:h-4 sm:w-4 animate-bounce-subtle" />
                  <span className="relative">
                    Enterprise Solutions
                  </span>
                </p>
              </div>
              <h1 className="text-3xl pb-2 sm:text-4xl md:text-5xl lg:text-6xl/none font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 via-blue-300/80 to-blue-200/80 animate-fade-in-up [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
                Scalable Solutions for Large Dealerships
              </h1>
              <p className="mx-auto max-w-[700px] text-base sm:text-lg md:text-xl text-gray-300/90 animate-fade-in-up delay-100 px-4">
                Custom pricing, dedicated support, and enterprise-grade features for high-volume vehicle image processing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up delay-200 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-w-[150px] group bg-gradient-to-r from-blue-500/80 via-blue-600/80 to-indigo-500/80 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                <a href="#contact" className="flex items-center justify-center w-full">
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[150px] border-blue-800/30 hover:bg-blue-950/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/pricing" className="w-full text-center">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-900/90 via-gray-900/95 to-gray-800/90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 via-blue-300/80 to-indigo-400/80 [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
              Enterprise-Grade Features
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Designed for high-volume dealerships and automotive marketplaces
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="group flex flex-col items-start space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-gray-800 via-blue-900/3 to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">Team Management</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Manage multiple users with role-based permissions. Control access levels and monitor usage across your organization.
              </p>
              <ul className="space-y-2 w-full">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Role-based permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Activity logging</span>
                </li>
              </ul>
            </div>
            
            <div className="group flex flex-col items-start space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-gray-800 via-blue-900/3 to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">Bulk Processing</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Process thousands of images simultaneously with our high-throughput API and batch processing tools.
              </p>
              <ul className="space-y-2 w-full">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Unlimited batch size</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Priority processing queue</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automated workflows</span>
                </li>
              </ul>
            </div>
            
            <div className="group flex flex-col items-start space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-gray-800 via-blue-900/3 to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">Enterprise Security</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Bank-level security with SOC 2 compliance, end-to-end encryption, and automatic data deletion.
              </p>
              <ul className="space-y-2 w-full">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>SOC 2 compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Custom data retention</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-gray-800/90 via-gray-900/95 to-gray-900/90">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/5 via-blue-400/5 to-indigo-500/5 px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:shadow-lg transition-all duration-300">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                <span className="font-medium text-sm sm:text-base text-blue-300">Advanced Analytics</span>
              </div>
              <h2 className="text-2xl pb-2 sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 via-blue-300/80 to-indigo-400/80 [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
                Comprehensive Reporting
              </h2>
              <div className="space-y-4">
                <div className="group flex items-start gap-3 p-3 sm:p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-900/5 hover:to-indigo-900/5 transition-colors duration-300">
                  <div className="shrink-0">
                    <div className="p-2 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">Usage Analytics</h3>
                    <p className="text-sm sm:text-base text-gray-300">Track usage patterns, processing times, and resource allocation across your organization.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-3 p-3 sm:p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-900/5 hover:to-indigo-900/5 transition-colors duration-300">
                  <div className="shrink-0">
                    <div className="p-2 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 to-indigo-400/80">Custom Reports</h3>
                    <p className="text-sm sm:text-base text-gray-300">Generate custom reports with the metrics that matter most to your business.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 border border-blue-800/30 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <Image
                src="/images/dashboard.png"
                alt="Analytics dashboard"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="relative w-full py-16 sm:py-20 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-gray-900" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400/80 via-blue-300/80 to-indigo-400/80">
                Contact Our Enterprise Team
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Get a custom quote tailored to your organization's needs
              </p>
            </div>
            
            <Card className="p-6 sm:p-8 border-blue-800/30 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      required 
                      disabled={isSubmitting}
                      className="border-blue-800/30 focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      required 
                      disabled={isSubmitting}
                      className="border-blue-800/30 focus:border-blue-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    disabled={isSubmitting}
                    className="border-blue-800/30 focus:border-blue-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    name="company" 
                    required 
                    disabled={isSubmitting}
                    className="border-blue-800/30 focus:border-blue-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyVolume">Estimated monthly image volume</Label>
                  <Input 
                    id="monthlyVolume" 
                    name="monthlyVolume" 
                    required 
                    disabled={isSubmitting}
                    className="border-blue-800/30 focus:border-blue-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    rows={4} 
                    required 
                    disabled={isSubmitting}
                    className="border-blue-800/30 focus:border-blue-600"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Request Enterprise Quote"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
