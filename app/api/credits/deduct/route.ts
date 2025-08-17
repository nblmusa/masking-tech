import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// TODO: Adjust the import path if needed for your project structure
import { getUserIdFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  const supabase = createClientComponentClient();
  const { service, credits } = await req.json();
  const userId = await getUserIdFromSession();

  const { data: userCredits, error } = await supabase
    .from('user_credits')
    .select('credits_balance')
    .eq('user_id', userId)
    .single();

  if (error || !userCredits) return new Response("Not found", { status: 404 });
  if (userCredits.credits_balance < credits) {
    return new Response("Insufficient credits", { status: 402 });
  }

  await supabase
    .from('user_credits')
    .update({ credits_balance: userCredits.credits_balance - credits })
    .eq('user_id', userId);

  await supabase.from('usage_logs').insert({
    user_id: userId,
    service,
    credits_used: credits,
  });

  return new Response("OK");
} 