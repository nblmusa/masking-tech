import Stripe from 'stripe';
// import './envConfig';

// Types
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  features: string[];
  limits: {
    imagesPerMonth: number;
    maxFileSize: number;
    apiAccess: boolean;
    teamMembers: number;
  };
  metadata: {
    recommended?: boolean;
    enterprise?: boolean;
  };
}

export interface PlanWithUsage extends Plan {
  usage: {
    imagesProcessed: number;
    periodStart: Date;
    periodEnd: Date;
    daysLeft: number;
  };
}

// Stripe configuration
const STRIPE_CONFIG = {
  currency: 'usd',
  taxRates: process.env.STRIPE_TAX_RATES?.split(',') || [],
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=cancelled`,
  trialDays: 14,
};

if (!process.env.STRIPE_SECRET_KEY) {
  // throw new Error('STRIPE_SECRET_KEY must be set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Plan definitions - Updated to match new pricing structure
export const PLANS: Record<string, Plan> = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Great for testing and getting started',
    price: 0,
    priceId: '',
    features: [
      'Background replacement',
      'Number plate masking',
      'Custom number plate logo',
      'Face blur',
      'Watermark',
      'Web portal access',
      'API access',
    ],
    limits: {
      imagesPerMonth: 20, // 20 credits by default
      maxFileSize: 10 * 1024 * 1024, // 10MB
      apiAccess: true,
      teamMembers: 1,
    },
    metadata: {},
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    description: 'Great for individuals and small projects',
    price: 29,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_1RzblsPcpoWva5n6yfomgbiq',
    features: [
      'Background replacement',
      'Number plate masking',
      'Custom number plate logo',
      'Face blur',
      'Watermark',
      'Web portal access',
      'API access',
      '300 credits per month',
      'Approx. 75 cars per month',
    ],
    limits: {
      imagesPerMonth: 300, // 300 credits
      maxFileSize: 10 * 1024 * 1024, // 10MB
      apiAccess: true,
      teamMembers: 1,
    },
    metadata: {},
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for growing businesses and professionals',
    price: 99,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_1RzbngPcpoWva5n6oONWqYsN',
    features: [
      'Everything in Basic',
      '1200 credits per month',
      'Approx. 300 cars per month',
      'Priority support',
    ],
    limits: {
      imagesPerMonth: 1200, // 1200 credits
      maxFileSize: 25 * 1024 * 1024, // 25MB
      apiAccess: true,
      teamMembers: 3,
    },
    metadata: {},
  },
  ADVANCED: {
    id: 'advanced',
    name: 'Advanced',
    description: 'For established businesses with high volume needs',
    price: 199,
    priceId: process.env.STRIPE_ADVANCED_PRICE_ID || 'price_1RzbpMPcpoWva5n62joHnlPP',
    features: [
      'Everything in Starter',
      '2500 credits per month',
      'Approx. 625 cars per month',
    ],
    limits: {
      imagesPerMonth: 2500, // 2500 credits
      maxFileSize: 25 * 1024 * 1024, // 25MB
      apiAccess: true,
      teamMembers: 5,
    },
    metadata: {
      recommended: true,
    },
  },
  GROWTH: {
    id: 'growth',
    name: 'Growth',
    description: 'For large organizations with enterprise needs',
    price: 399,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || 'price_1RzbqWPcpoWva5n63BY9xvuj',
    features: [
      'Everything in Advanced',
      '6000 credits per month',
      'Approx. 1500 cars per month',
    ],
    limits: {
      imagesPerMonth: 6000, // 6000 credits
      maxFileSize: 100 * 1024 * 1024, // 100MB
      apiAccess: true,
      teamMembers: 10,
    },
    metadata: {
      enterprise: true,
    },
  },
};

// Helper functions
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  returnUrl?: string
): Promise<string> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription' as const,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: returnUrl ?? STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      subscription_data: {
        trial_period_days: STRIPE_CONFIG.trialDays,
        metadata: {
          plan: Object.keys(PLANS).find(key => PLANS[key].priceId === priceId) ?? '',
        },
      },
    });

    if (!session?.url) throw new Error('Failed to create checkout session');
    return session.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    if (!session?.url) throw new Error('Failed to create portal session');
    return session.url;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
}

export function getPlanById(planId: string): Plan | undefined {
  return PLANS[planId.toUpperCase()];
}

export function isValidPlan(planId: string): boolean {
  return planId.toUpperCase() in PLANS;
}

export function getNextPlan(currentPlanId: string): Plan | undefined {
  const planIds = Object.keys(PLANS);
  const currentIndex = planIds.indexOf(currentPlanId.toUpperCase());
  if (currentIndex === -1 || currentIndex === planIds.length - 1) return undefined;
  return PLANS[planIds[currentIndex + 1]];
}

export function calculateUsage(
  imagesProcessed: number,
  planId: string
): number {
  const plan = getPlanById(planId);
  if (!plan || plan.limits.imagesPerMonth === Infinity) return 0;
  return (imagesProcessed / plan.limits.imagesPerMonth) * 100;
}