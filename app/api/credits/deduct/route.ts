import { createClientComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// TODO: Adjust the import path if needed for your project structure
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { service, credits } = await req.json();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userCredits, error } = await supabase
    .from('user_credits')
    .select('credits_balance')
    .eq('user_id', session.user.id)
    .single();

  if (error || !userCredits) return new Response("Not found", { status: 404 });
  if (userCredits.credits_balance < credits) {
    return new Response("Insufficient credits", { status: 402 });
  }

  await supabase
    .from('user_credits')
    .update({ credits_balance: userCredits.credits_balance - credits })
    .eq('user_id', session.user.id);

  await supabase.from('usage_logs').insert({
    user_id: session.user.id,
    service,
    credits_used: credits,
  });

  return new Response("OK");
} 