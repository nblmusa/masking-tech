import { stripe } from "@/lib/stripe";
import supabase from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new NextResponse("Webhook Error", { status: 400 });
  }

  // Handle bundle purchase
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.metadata?.type === "bundle") {
      const userId = session.metadata.userId;
      // Use priceId from session.metadata (set during checkout session creation)
      const priceId = session.metadata.priceId;
      const creditsToAdd = getCreditsForPriceId(priceId);
      if (userId && creditsToAdd > 0) {
        await incrementUserCredits(userId, creditsToAdd);
      }
    }
  }

  // Handle subscription renewal
  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    // Lookup user by subscriptionId
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("user_id, credits_per_month")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (subscription) {
      await incrementUserCredits(subscription.user_id, subscription.credits_per_month);
    }
  }

  // Handle subscription status updates (optional)
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    // Update subscription status in your DB if needed
  }

  return new NextResponse("OK");
}

// Helper: Map Stripe price IDs to credit amounts
function getCreditsForPriceId(priceId: string): number {
  switch (priceId) {
    case process.env.STRIPE_BUNDLE_500_PRICE_ID:
      return 500;
    case process.env.STRIPE_BUNDLE_2000_PRICE_ID:
      return 2000;
    case process.env.STRIPE_BUNDLE_5000_PRICE_ID:
      return 5000;
    case process.env.STRIPE_BUNDLE_10000_PRICE_ID:
      return 10000;
    default:
      return 0;
  }
}

// Helper: Increment user credits atomically
async function incrementUserCredits(userId: string, credits: number) {
  // Use a single update query for atomicity
  await supabase.rpc("increment_user_credits", { user_id: userId, credits });
} 