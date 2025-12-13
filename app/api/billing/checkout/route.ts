import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    // Validate environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get plan and return URL from request
    const { planId, returnUrl } = await request.json();
    
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const plan = PLANS[planId.toUpperCase()];

    console.log('plan id: ', planId);
    console.log('plan: ', plan);
    if (!plan || !plan.priceId || plan.priceId === 'free') {
      console.error('Invalid plan:', { planId, plan });
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Validate and construct return URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not set');
      return NextResponse.json(
        { error: 'Configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Construct success and cancel URLs with proper encoding
    const successUrl = new URL('/dashboard', baseUrl);
    successUrl.searchParams.set('subscription', 'success');
    if (returnUrl) {
      successUrl.searchParams.set('returnTo', returnUrl);
    }

    const cancelUrl = new URL('/dashboard', baseUrl);
    cancelUrl.searchParams.set('subscription', 'cancelled');
    if (returnUrl) {
      cancelUrl.searchParams.set('returnTo', returnUrl);
    }

    // Check if user already has a Stripe customer ID
    let { data: subscription, error: subQueryError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();

    if (subQueryError && subQueryError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is OK, but other errors are not
      console.error('Error querying subscriptions:', subQueryError);
      // Continue anyway - we'll create a new customer
    }

    let customerId = subscription?.stripe_customer_id;

    // Verify customer exists in current Stripe mode (handles test/live mode switching)
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        // If customer was deleted or doesn't exist, customer will be undefined or throw
        if (customer.deleted) {
          console.log('Customer was deleted, creating new one');
          customerId = null;
        } else {
          console.log('Using existing customer:', customerId);
        }
      } catch (error: any) {
        // Customer doesn't exist (e.g., from different mode), create a new one
        if (error.code === 'resource_missing') {
          console.log('Customer ID not found in current Stripe mode, creating new customer');
          customerId = null;
        } else {
          // Some other error, log it but continue to create new customer
          console.error('Error retrieving customer:', error.message);
          customerId = null;
        }
      }
    }

    // If no customer ID exists or it's invalid, create a new customer
    if (!customerId) {
      try {
        if (!session.user.email) {
          console.error('User email is missing');
          return NextResponse.json(
            { error: 'User email is required' },
            { status: 400 }
          );
        }

        const customer = await stripe.customers.create({
          email: session.user.email,
          metadata: {
            user_id: session.user.id
          }
        });
        customerId = customer.id;
        console.log('created new customer id', customerId);

        // Update the database with the new customer ID if subscription record exists
        if (subscription) {
          await supabase
            .from('subscriptions')
            .update({
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', session.user.id);
          console.log('Updated subscription record with new customer ID');
        }
      } catch (stripeError: any) {
        console.error('Error creating Stripe customer:', stripeError);
        return NextResponse.json(
          { error: `Failed to create customer: ${stripeError.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    console.log('customer id: ', customerId);

    // Validate price ID before creating checkout session
    if (!plan.priceId || plan.priceId === 'free') {
      console.error('Invalid price ID for plan:', plan);
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 500 }
      );
    }

    // Create checkout session with properly encoded URLs
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: plan.priceId,
          quantity: 1,
        }],
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        subscription_data: {
          metadata: {
            user_id: session.user.id,
            plan_id: planId
          },
          // trial_period_days: 14
        },
        metadata: {
          user_id: session.user.id,
          plan_id: planId,
          return_url: returnUrl || ''
        }
      });
    } catch (stripeError: any) {
      console.error('Error creating Stripe checkout session:', stripeError);
      return NextResponse.json(
        { error: `Failed to create checkout session: ${stripeError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!checkoutSession.url) {
      console.error('Checkout session created but no URL returned:', checkoutSession);
      return NextResponse.json(
        { error: 'Failed to create checkout session URL' },
        { status: 500 }
      );
    }

    // If this is a new customer, create initial subscription record
    if (!subscription) {
      console.log('subscription data ', {
        user_id: session.user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: 'pending_' + checkoutSession.id, // Temporary ID until subscription is created
        stripe_price_id: plan.priceId,
        plan_id: planId,
        status: 'incomplete',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const { error: dbError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: session.user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: 'pending_' + checkoutSession.id, // Temporary ID until subscription is created
          stripe_price_id: plan.priceId,
          plan_id: planId,
          status: 'incomplete',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (dbError) {
        console.error('Failed to create subscription record:', dbError);
      }
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    const errorMessage = error?.message || 'Failed to create checkout session';
    const errorDetails = process.env.NODE_ENV === 'development' ? errorMessage : 'Failed to create checkout session';
    
    return NextResponse.json(
      { error: errorDetails },
      { status: 500 }
    );
  }
} 