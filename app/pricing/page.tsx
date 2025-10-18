"use client"

import { Button } from "@/components/ui/button"
import { Check, Zap, Loader2, Shield, Clock, Users, CreditCard, ArrowRight, Star, Award, Eye, Car, Lock, Camera } from "lucide-react"
import Link from "next/link"
import { PLANS } from "@/lib/stripe"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase-client'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAnalytics } from "@/hooks/useAnalytics"
import UseCase from "../components/use-case"
import FAQSection from "../components/faqs"

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionData {
  plan: typeof PLANS[keyof typeof PLANS];
  subscription: Subscription | null;
}

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const analytics = useAnalytics();

  // MaskingTech-specific features for each plan
  type PlanCard = {
    key: string;
    name: string;
    price: string;
    credits: string;
    cta: string;
    features: string[];
    perCredit: string;
    highlight: boolean;
    badge: string | null;
    accent: boolean;
  };

  // Convert PLANS from stripe.ts to PlanCard format (monthly only)
  const plans: PlanCard[] = [
    {
      key: 'basic',
      name: PLANS.BASIC.name,
      price: `$${PLANS.BASIC.price}`,
      credits: `${PLANS.BASIC.limits.imagesPerMonth} credits/month`,
      cta: 'Subscribe',
      features: PLANS.BASIC.features,
      perCredit: `$${(PLANS.BASIC.price / PLANS.BASIC.limits.imagesPerMonth).toFixed(4)}`,
      highlight: false,
      badge: null,
      accent: false,
    },
    {
      key: 'starter',
      name: PLANS.STARTER.name,
      price: `$${PLANS.STARTER.price}`,
      credits: `${PLANS.STARTER.limits.imagesPerMonth} credits/month`,
      cta: 'Subscribe',
      features: PLANS.STARTER.features,
      perCredit: `$${(PLANS.STARTER.price / PLANS.STARTER.limits.imagesPerMonth).toFixed(4)}`,
      highlight: false,
      badge: null,
      accent: false,
    },
    {
      key: 'advanced',
      name: PLANS.ADVANCED.name,
      price: `$${PLANS.ADVANCED.price}`,
      credits: `${PLANS.ADVANCED.limits.imagesPerMonth} credits/month`,
      cta: 'Subscribe',
      features: PLANS.ADVANCED.features,
      perCredit: `$${(PLANS.ADVANCED.price / PLANS.ADVANCED.limits.imagesPerMonth).toFixed(4)}`,
      highlight: true,
      badge: 'Best Value',
      accent: true,
    },
    {
      key: 'growth',
      name: PLANS.GROWTH.name,
      price: `$${PLANS.GROWTH.price}`,
      credits: `${PLANS.GROWTH.limits.imagesPerMonth} credits/month`,
      cta: 'Subscribe',
      features: PLANS.GROWTH.features,
      perCredit: `$${(PLANS.GROWTH.price / PLANS.GROWTH.limits.imagesPerMonth).toFixed(4)}`,
      highlight: false,
      badge: null,
      accent: false,
    },
  ];

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const response = await fetch('/api/billing/subscription');
        if (!response.ok) throw new Error('Failed to fetch subscription');
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      analytics.trackApiError('/api/billing/subscription', error instanceof Error ? error.message : 'Failed to fetch subscription');
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpgrade(planId: string) {
    try {
      // Check if user is logged in
      if (!user) {
        // Redirect to signup if not logged in
        router.push('/signup');
        return;
      }

      setIsLoading(true);
      
      // Track subscription start
      const plan = Object.values(PLANS).find(p => p.id.toLowerCase() === planId.toLowerCase());
      if (plan) {
        analytics.trackSubscriptionStart(plan.name.toLowerCase(), plan.price);
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Redirect to checkout
      router.push(data.url);
    } catch (error) {
      console.error('Upgrade error:', error);
      analytics.trackApiError('/api/billing/checkout', error instanceof Error ? error.message : 'Failed to start upgrade');
      toast({
        title: "Error",
        description: "Failed to start upgrade process",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Track plan view on component mount
  useEffect(() => {
    Object.values(PLANS).forEach(plan => {
      analytics.trackSubscriptionView(plan.name.toLowerCase());
    });
  }, [analytics]);

  function getPlanAction(planKey: string, plan: typeof PLANS[keyof typeof PLANS]) {
    if (isLoading) {
      return (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      );
    }

    // Not logged in - direct to signup
    if (!user) {
      return (
        <Button 
          className={`w-full group ${
            planKey === 'ADVANCED' 
              ? 'shadow-lg hover:shadow-xl' 
              : 'border-blue-200/50 border-blue-800/50'
          }`}
          variant={'default'}
          asChild
        >
          <Link href="/signup" className="flex items-center justify-center">
            Get Started
            <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
          </Link>
        </Button>
      );
    }

    // Current plan
    if (subscriptionData?.plan?.id === plan.id.toLowerCase()) {
      return (
        <Button disabled className="w-full">
          Current Plan
        </Button>
      );
    }

    // Free plan can't downgrade
    if (subscriptionData?.plan?.id === 'free' && plan.id === 'free') {
      return (
        <Button disabled className="w-full">
          Current Plan
        </Button>
      );
    }

    // Upgrade button
    return (
      <Button
        className={`w-full group ${
          planKey === 'ADVANCED' 
            ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
            : 'border-blue-200/50 border-blue-800/50'
        }`}
        // variant={planKey === 'BASIC' ? 'outline' : 'default'}
        variant="default"
        onClick={() => handleUpgrade(plan.id)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Upgrade
            <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-background to-blue-950 min-h-screen">

      {/* Use Cases Section */}
      <UseCase/>

      {/* Pricing Cards Row */}
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 max-w-7xl mx-auto px-4 mb-20">
        {plans.map((plan, idx) => (
          <div
            key={plan.key}
            className={`flex-1 flex flex-col bg-background rounded-3xl shadow-xl p-8 min-w-[280px] max-w-[340px] mx-auto lg:mx-0 mb-8 lg:mb-0 border-2 ${plan.highlight ? 'border-yellow-400 ring-2 ring-yellow-300 relative z-10' : 'border-transparent'} ${plan.accent ? 'scale-105 shadow-2xl' : ''}`}
            style={{ position: 'relative' }}
          >
            {plan.badge && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow -rotate-6">
                <Star className="h-3 w-3" />
                {plan.badge}
              </div>
            )}
            <div className="flex flex-col items-center mb-6">
              <div className="text-2xl font-bold mb-2 text-center">{plan.name}</div>
              <div className="text-base text-muted-foreground mb-3 font-semibold text-center">{plan.credits}</div>
              <div className="text-4xl font-extrabold mb-4">{plan.price}<span className="text-base font-normal text-muted-foreground">/month</span></div>
              {/* <div className="text-sm text-muted-foreground mb-4">${plan.perCredit} per credit</div> */}
              
              {/* Render button dynamically based on plan */}
              {(() => {
                const planKey = plan.key.toUpperCase();
                const planObject = Object.values(PLANS).find(p => p.id === plan.key) || PLANS.BASIC;
                return getPlanAction(planKey, planObject);
              })()}
            </div>
            <ul className="flex-1 flex flex-col gap-3 text-sm text-muted-foreground">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /> 
                  <span className={feature.includes('Everything') ? 'font-bold text-white' : ''}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Enterprise/Custom Plan Section */}
      <div className="max-w-4xl mx-auto mb-16 px-4 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Need more credits or a custom enterprise plan?</h3>
        <p className="text-base text-muted-foreground mb-2">
          We offer scalable packages tailored to high-volume users and large dealerships.
        </p>
        <p className="text-base text-muted-foreground">
          Contact our sales team at <span className="font-bold text-white">sales@maskingtech.com</span>
        </p>
      </div>

      {/* Features Overview Section */}
      <div className="max-w-6xl mx-auto mb-20 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Advanced AI Technology for Privacy Protection</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our cutting-edge machine learning algorithms provide industry-leading accuracy and speed
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted">
            <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">License Plate Detection</h3>
            <p className="text-muted-foreground">
              Advanced OCR technology that identifies license plates in any orientation, lighting, or angle with 99.9% accuracy
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Processing</h3>
            <p className="text-muted-foreground">
              Process images in under 5 seconds with our optimized AI infrastructure. No waiting, no delays
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted">
            <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-muted-foreground">
              Collaborate with your team. Share projects, manage permissions, and track usage across multiple users
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted">
            <div className="w-16 h-16 bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Flexible Plans</h3>
            <p className="text-muted-foreground">
              Scale up or down based on your needs. Upgrade, downgrade, or cancel anytime with no penalties
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">REST API</h3>
            <p className="text-muted-foreground">
              Integrate our services into your applications with our powerful REST API and comprehensive documentation
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted">
            <div className="w-16 h-16 bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground">
              Bank-level security with SOC 2 compliance, end-to-end encryption, and automatic data deletion
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto mb-20 px-4">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Protect Privacy?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust MaskingTech for their privacy protection needs. Start with 20 free credits today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/signup" className="flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <Link href="/contact" className="flex items-center">
                Contact Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Free Trial Banner */}
      <div className="max-w-6xl mx-auto mb-12 px-4">
        <div className="bg-green-900/20 border-l-4 border-green-400 p-6 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Free Trial Available</h3>
              <p className="text-muted-foreground">
                All new users receive <strong>20 free credits</strong> to try our services risk-free. No credit card required, no commitment. Experience the power of AI-powered license plate masking and privacy protection today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}