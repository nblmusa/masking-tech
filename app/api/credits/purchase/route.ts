import { stripe } from "@/lib/stripe";
// TODO: Adjust the import path if needed for your project structure
import { getUserIdFromSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { priceId } = await req.json(); // Stripe Price ID for the bundle
  const userId = await getUserIdFromSession();

  const session = await stripe.checkout.sessions.create({
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
      userId,
      type: "bundle",
      priceId, // Include priceId in metadata for webhook
    },
  });

  return NextResponse.json({ url: session.url });
} 