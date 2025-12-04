import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { stripe, PLANS } from '@/lib/stripe';
import Stripe from 'stripe';

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    if (!webhookSecret) {
      console.error('Missing webhook secret');
      return NextResponse.json(
        { error: 'Missing webhook secret' },
        { status: 400 }
      );
    }

    const signature = (await headers()).get('stripe-signature');
    if (!signature) {
      console.error('Missing stripe signature');
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Get the raw body
    const rawBody = await request.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('session', session);
        
        // Get the price ID from the session's line items
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        const userId = session.metadata?.user_id;

        console.log('userId', userId);
        console.log('priceId', priceId);

        // We'll let the subscription.created event handle the tier update
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log(`webhook: ${event.type}`);
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const priceId = subscription.items.data[0].price.id;
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        let userId = subscription.metadata?.user_id;

        console.log(`Processing subscription update: ${event.type}`, {
          customerId,
          status,
          priceId,
          userId
        });

        if (!userId) {
          // Try to find userId from customer metadata
          const customer = await stripe.customers.retrieve(customerId);
          console.log(`Retrieved customer: ${event.type}`, customer);
          if ('metadata' in customer && customer.metadata?.user_id) {
            userId = customer.metadata.user_id;
            console.log(`Found userId in customer metadata: ${event.type}`, userId);
          }
        }

        if (userId) {
          // Calculate tier based on new plan structure
          let tier = 'basic';
          if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
            tier = 'starter';
          } else if (priceId === process.env.STRIPE_ADVANCED_PRICE_ID) {
            tier = 'advanced';
          } else if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) {
            tier = 'growth';
          }
          
          console.log(`Calculated tier: ${event.type}`, {
            tier,
            priceId
          });

          // Update subscription in database
          // Use stripe_subscription_id as conflict key since it uniquely identifies the subscription
          const { error: updateError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: customerId,
              stripe_price_id: priceId,
              plan_id: tier,
              status,
              current_period_start: currentPeriodStart,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
              quantity: subscription.items.data[0].quantity || 1,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'stripe_subscription_id',
              ignoreDuplicates: false
            });

          if (updateError) {
            console.error('Failed to update subscription:', updateError);
          } else {
            console.log(`Successfully updated subscription: ${event.type}`);
            
            // Only update the profile tier if the subscription is active
            if (status === 'active' || status === 'trialing') {
              console.log(`Updating profile tier to: ${event.type}`, tier);
              
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .update({
                  subscription_tier: tier,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single();

              if (profileError) {
                console.error('Failed to update profile tier:', profileError);
              } else {
                console.log(`Successfully updated profile: ${event.type}`, profile);
              }

              // Upsert user_credits with plan allowance
              // Get credits from PLANS definition to ensure single source of truth
              const plan = PLANS[tier.toUpperCase()];
              const credits = plan?.limits.imagesPerMonth ?? 20;

              const { error: creditsError } = await supabase
                .from('user_credits')
                .upsert({
                  user_id: userId,
                  credits_balance: credits,
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id', ignoreDuplicates: false });

              if (creditsError) {
                console.error('Failed to upsert user credits:', creditsError);
              } else {
                console.log(`Credits upserted for user: ${event.type}`, userId);
              }
            } else {
              console.log(`Skipping profile update, subscription status: ${event.type}`, status);
            }
          }
        } else {
          console.error(`No userId found for subscription: ${event.type}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          // Update subscription status to canceled
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .match({ user_id: userId, stripe_customer_id: customerId });

          if (updateError) {
            console.error(`Failed to cancel subscription: ${event.type}`, updateError);
          }

          // Reset user's subscription tier
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        let userId: string | undefined;

        // Try to get userId from subscription metadata
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            userId = subscription.metadata?.user_id;
          } catch (error) {
            console.error(`Error retrieving subscription for invoice: ${event.type}`, error);
          }
        }

        // If not found, try to get from customer metadata
        if (!userId) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if ('metadata' in customer && customer.metadata?.user_id) {
              userId = customer.metadata.user_id;
            }
          } catch (error) {
            console.error(`Error retrieving customer for invoice: ${event.type}`, error);
          }
        }

        if (userId) {
          // Record the invoice
          const { error: insertError } = await supabase
            .from('invoices')
            .upsert([{
              user_id: userId,
              stripe_invoice_id: invoice.id,
              stripe_customer_id: customerId,
              amount_due: invoice.amount_due,
              amount_paid: invoice.amount_paid,
              status: invoice.status,
              invoice_pdf: invoice.invoice_pdf,
              created_at: new Date(invoice.created * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }], {
              onConflict: 'stripe_invoice_id',
              ignoreDuplicates: false
            });

          if (insertError) {
            console.error(`Failed to record invoice: ${event.type}`, insertError);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        let userId: string | undefined;

        // Try to get userId from subscription metadata
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            userId = subscription.metadata?.user_id;
          } catch (error) {
            console.error(`Error retrieving subscription for failed invoice: ${event.type}`, error);
          }
        }

        // If not found, try to get from customer metadata
        if (!userId && customerId) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if ('metadata' in customer && customer.metadata?.user_id) {
              userId = customer.metadata.user_id;
            }
          } catch (error) {
            console.error(`Error retrieving customer for failed invoice: ${event.type}`, error);
          }
        }

        // Update subscription status to past_due
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error(`Failed to update subscription status: ${event.type}`, updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription status' },
            { status: 500 }
          );
        }

        // Update user's subscription tier if userId is available
        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// We need this to handle raw body
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// } 