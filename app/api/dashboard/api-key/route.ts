import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseApi } from "@/lib/supabase-server"; 

// Generate a secure API key
function generateApiKey() {
  return `lpm_${crypto.randomBytes(32).toString('hex')}`;
}

// GET - Fetch all API keys for the authenticated user
export async function GET() {
  try {
    const supabase = supabaseApi();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch only active API keys for the user
    const { data: apiKeys, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({ apiKeys: apiKeys || [] });
  } catch (error) {
    console.error('API Key Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Generate a new API key
export async function POST(request: Request) {
  try {
    const supabase = supabaseApi();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    
    // Parse request body
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
    }

    // Generate and insert new API key
    const newKey = generateApiKey();
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .insert([{
        user_id: userId,
        key: newKey,
        name: name.trim(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        is_active: true
      }])
      .select()
      .single();

    if (keyError) {
      throw keyError;
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('API Key Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke a specific API key
export async function DELETE(request: Request) {
  try {
    const supabase = supabaseApi();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    
    // Parse request body
    const { keyId } = await request.json();
    
    if (!keyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }

    // Deactivate the specific API key
    const { error: keyError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId); // Ensure user owns the key

    if (keyError) {
      throw keyError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Key Deletion Error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
} 