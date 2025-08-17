import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserIdFromSession } from "@/lib/auth";

export async function GET() {
  const supabase = createClientComponentClient();
  const userId = await getUserIdFromSession();
  const { data, error } = await supabase
    .from('user_credits')
    .select('credits_balance')
    .eq('user_id', userId)
    .single();
  if (error || !data) return new Response("Not found", { status: 404 });
  return Response.json({ credits: data.credits_balance });
} 