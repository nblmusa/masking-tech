import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select('credits_balance')
    .eq('user_id', session.user.id)
    .single();
  if (error || !data) return new Response("Not found", { status: 404 });
  return Response.json({ credits: data.credits_balance });
} 