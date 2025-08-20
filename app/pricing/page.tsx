"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Car, Shield, Gauge, Lock, Sparkles, ImageIcon, Zap, Users, Loader2, Star, CreditCard, BadgeDollarSign, UserCheck, Image as ImageIcon2 } from "lucide-react"
import Link from "next/link"
import { PLANS } from "@/lib/stripe"
import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAnalytics } from "@/hooks/useAnalytics"

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

// Update credit bundles to match screenshot
const CREDIT_BUNDLES = [
  { credits: 500, price: 29, pricePerCredit: 0.058, priceId: process.env.NEXT_PUBLIC_STRIPE_BUNDLE_500_PRICE_ID },
  { credits: 2000, price: 79, pricePerCredit: 0.0395, priceId: process.env.NEXT_PUBLIC_STRIPE_BUNDLE_2000_PRICE_ID },
  { credits: 5000, price: 159, pricePerCredit: 0.0318, priceId: process.env.NEXT_PUBLIC_STRIPE_BUNDLE_5000_PRICE_ID },
  { credits: 10000, price: 299, pricePerCredit: 0.0299, priceId: process.env.NEXT_PUBLIC_STRIPE_BUNDLE_10000_PRICE_ID },
];

// Subscription plans (monthly/yearly)
const SUBSCRIPTION_PLANS = [
  {
    name: 'Basic',
    monthly: 49,
    yearly: 499,
    credits: 1000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_SUB_BASIC_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_SUB_BASIC_YEARLY,
    savings: 'save vs. buying bundles',
  },
  {
    name: 'Advanced',
    monthly: 139,
    yearly: 1399,
    credits: 5000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_SUB_ADVANCED_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_SUB_ADVANCED_YEARLY,
    savings: 'save vs. buying bundles',
  },
  {
    name: 'Growth',
    monthly: 269,
    yearly: 2699,
    credits: 10000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_SUB_GROWTH_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_SUB_GROWTH_YEARLY,
    savings: 'save vs. buying bundles',
  },
];

// Service credit costs
const SERVICE_CREDITS = [
  { name: 'Face Blur', credits: 1, description: 'Automatically detects and blurs faces.' },
  { name: 'Number Plate Blur/Replacement + Logo', credits: 1, description: 'Blurs or replaces license plates, optionally adds your logo.' },
  { name: 'Make/Model Detection', credits: 1, description: "Identifies the vehicle's make and model." },
  { name: 'Number Plate Detection', credits: 1, description: 'Locates and reads license plate text (OCR).' },
  { name: 'Background Replacement', credits: 3, description: 'Replaces the entire background behind the car.' },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();
  const analytics = useAnalytics();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paygAmount, setPaygAmount] = useState(3);
  const [volumeAmount, setVolumeAmount] = useState(500);

  // Example options for dropdowns
  const paygOptions = [3, 10, 50, 100, 500];
  const volumeOptions = [500, 1000, 5000, 10000];

  // Credit bundles for table
  const creditBundles = [
    { credits: 500, price: 29, perCredit: 0.058 },
    { credits: 2000, price: 79, perCredit: 0.0395 },
    { credits: 5000, price: 159, perCredit: 0.0318 },
    { credits: 10000, price: 299, perCredit: 0.0299 },
  ];

  // Services & credit costs
  const serviceCredits = [
    { name: 'Face Blur', credits: 1, description: 'Automatically detects and blurs faces.' },
    { name: 'Number Plate Blur/Replacement + Logo', credits: 1, description: 'Blurs or replaces license plates, optionally adds your logo.' },
    { name: 'Make/Model Detection', credits: 1, description: "Identifies the vehicle's make and model." },
    { name: 'Number Plate Detection', credits: 1, description: 'Locates and reads license plate text (OCR).' },
    { name: 'Background Replacement', credits: 3, description: 'Replaces the entire background behind the car.' },
  ];

  // MaskingTech-specific features for each plan
  type PlanCard = {
    key: string;
    name: string;
    price: string;
    credits: string;
    cta: string;
    features: string[];
    perCredit: string;
    savings: string | null;
    button: () => void | Promise<void>;
    highlight: boolean;
    badge: string | null;
    accent: boolean;
    select?: {
      value: number;
      options: number[];
      onChange: (e: any) => void;
      label: string;
    };
  };

  const plans: PlanCard[] = [
    // {
    //   key: 'payg',
    //   name: 'Pay-as-you-go',
    //   price: `$${paygAmount}`,
    //   credits: `${paygAmount} credits`,
    //   cta: 'Buy now',
    //   features: [
    //     'One-off credit purchase',
    //     'No subscription required',
    //     'Use for any service: plate masking, face blur, background replacement',
    //     'Credits never expire',
    //     'Upgrade or top up anytime',
    //   ],
    //   select: {
    //     value: paygAmount,
    //     options: paygOptions,
    //     onChange: (e: any) => setPaygAmount(Number(e.target.value)),
    //     label: 'Select credits for Pay-as-you-go',
    //   },
    //   perCredit: `$${(paygAmount / paygAmount).toFixed(2)}`,
    //   savings: null,
    //   button: () => handleBuyCredits('PAYG_PRICE_ID'),
    //   highlight: false,
    //   badge: null,
    //   accent: false,
    // },
    {
      key: 'lite',
      name: 'Basic',
      price: billingPeriod === 'monthly' ? '$99' : '$499',
      credits: '1,000 credits/month',
      cta: 'Subscribe',
      features: [
        'Background replacement',
        'Number plate masking',
        'Custom number plate logo',
        'Face blur',
        'Watermark',
        'Web portal access',
        'API access',
      ],
      perCredit: '$0.049',
      savings: 'Save vs. buying bundles',
      button: () => handleUpgrade('BASIC_PRICE_ID'),
      highlight: false,
      badge: null,
      accent: false,
    },
    {
      key: 'pro',
      name: 'Advanced',
      price: billingPeriod === 'monthly' ? '$399' : '$3,999',
      credits: '5,000 credits/month',
      cta: 'Subscribe',
      features: [
        'Everything in Basic',
        'Save 20% compared to Basic',
        'Priority support',
      ],
      perCredit: '$0.0278',
      savings: 'Save vs. buying bundles',
      button: () => handleUpgrade('ADVANCED_PRICE_ID'),
      highlight: false,
      badge: null,
      accent: false,
    },
    {
      key: 'growth',
      name: 'Growth',
      price: billingPeriod === 'monthly' ? '$699' : '$6,999',
      credits: '10,000 credits/month',
      cta: 'Subscribe',
      features: [
        'Everything in Advanced',
        'Save 30% compared to Basic',
      ],
      perCredit: '$0.0269',
      savings: 'Save vs. buying bundles',
      button: () => handleUpgrade('GROWTH_PRICE_ID'),
      highlight: true,
      badge: 'Best Value',
      accent: true,
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      credits: '> 10,000 credits/month',
      cta: 'Contact Sales',
      features: [
        // 'Everything in Growth',
        'Custom credit volume',
      ],
      perCredit: '-',
      savings: null,
      button: () => router.push('/contact'),
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

  // Add handler for credit bundle purchase
  async function handleBuyCredits(priceId: string) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(data.url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start credit purchase",
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

  // Helper for plan price
  function getPlanPrice(plan: typeof SUBSCRIPTION_PLANS[number]) {
    return billingPeriod === 'monthly' ? plan.monthly : plan.yearly;
  }

  function getPlanPriceLabel() {
    return billingPeriod === 'monthly' ? '/mo' : '/yr';
  }

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
            planKey === 'PRO' 
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
              : planKey === 'ENTERPRISE' 
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
              : 'border-blue-200/50 dark:border-blue-800/50'
          }`}
          variant={planKey === 'BASIC' ? 'outline' : 'default'}
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

    // Enterprise plan - contact sales
    if (planKey === 'ENTERPRISE') {
      return (
        <Button 
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
          asChild
        >
          <Link href="/contact">Contact Sales</Link>
        </Button>
      );
    }

    // Upgrade button
    return (
      <Button
        className={`w-full group ${
          planKey === 'PRO' 
            ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
            : 'border-blue-200/50 dark:border-blue-800/50'
        }`}
        variant={planKey === 'BASIC' ? 'outline' : 'default'}
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
    <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950 min-h-screen">
      {/* Overview Info Box */}
      <div className="max-w-3xl mx-auto mt-12 mb-10 p-6 rounded-2xl bg-muted/30 border border-muted shadow text-center">
        <h1 className="text-2xl font-bold mb-2">MaskingTech.com Pricing</h1>
        <p className="text-base text-muted-foreground">MaskingTech offers advanced AI-powered image processing services tailored for the automotive industry and privacy protection.</p>
      </div>

      {/* Pricing Cards Row */}
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-6xl mx-auto px-4 mb-16">
        {plans.map((plan, idx) => (
          <div
            key={plan.key}
            className={`flex-1 flex flex-col bg-white dark:bg-background rounded-3xl shadow-xl p-8 min-w-[270px] max-w-[320px] mx-auto md:mx-0 mb-8 md:mb-0 border-2 ${plan.highlight ? 'border-yellow-400 ring-2 ring-yellow-300 relative z-10' : 'border-transparent'} ${plan.accent ? 'scale-105 shadow-2xl' : ''}`}
            style={{ position: 'relative' }}
          >
            {plan.badge && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow -rotate-6">
                {plan.badge}
              </div>
            )}
            <div className="flex flex-col items-center mb-4">
              <div className="text-2xl font-bold mb-1">{plan.name}</div>
              {plan.select ? (
                <select
                  title={plan.select.label}
                  aria-label={plan.select.label}
                  className="mb-2 px-3 py-1 rounded border border-muted text-lg font-semibold text-center focus:outline-none"
                  value={plan.select.value}
                  onChange={plan.select.onChange}
                >
                  {plan.select.options.map((opt: number) => (
                    <option key={opt} value={opt}>{opt} credits</option>
                  ))}
                </select>
              ) : (
                <div className="text-base text-muted-foreground mb-2 font-semibold">{plan.credits}</div>
              )}
              <div className="text-4xl font-extrabold mb-2">{plan.price}<span className="text-base font-normal text-muted-foreground">{billingPeriod === 'monthly' ? '/month' : (plan.key === 'payg' || plan.key === 'enterprise') ? '' : 'billed yearly'}</span></div>
              <button
                className="w-full mt-2 mb-4 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg transition-transform hover:scale-105"
                onClick={plan.button}
              >
                {plan.cta}
              </button>
            </div>
            <ul className="flex-1 flex flex-col gap-2 text-sm text-muted-foreground">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-400" /> {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>


      {/* Free Trial & Overage Pricing Banners */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-2xl shadow-sm">
          <span className="font-semibold">Free Trial:</span> All new users receive 20 free credits to try our services risk-free.
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-2xl shadow-sm">
          <span className="font-semibold">Overage Pricing:</span> If you exceed your subscription&apos;s credits, additional usage is billed at your discounted rate.
        </div>
      </div>

    </div>
  );
}