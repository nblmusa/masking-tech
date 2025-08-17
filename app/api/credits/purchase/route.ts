import { stripe } from "@/lib/stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// TODO: Adjust the import path if needed for your project structure
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { priceId } = await req.json(); // Stripe Price ID for the bundle
  const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=1`,
    metadata: {
      userId: session.user.id,
      type: "bundle",
      priceId, // Include priceId in metadata for webhook
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
} 