import { NextResponse } from 'next/server';
import crypto from 'crypto';
import supabaseServer from "@/lib/supabase-server";
import { PLANS } from "@/lib/stripe";

function generateApiKey() {
  return `lpm_${crypto.randomBytes(32).toString('hex')}`;
}

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's subscription tier from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    const tier = profile?.subscription_tier || 'free';
    const plan = PLANS[tier.toUpperCase()];
    const monthlyQuota = plan?.limits.imagesPerMonth || 20;

    // Get user credits balance
    const { data: credits } = await supabase
      .from('user_credits')
      .select('credits_balance')
      .eq('user_id', userId)
      .single();

    // Get count of processed images for current billing period
    // Use subscription period if available, otherwise use current month
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('current_period_start, current_period_end')
      .eq('user_id', userId)
      .single();

    let periodStart: Date;
    if (subscription?.current_period_start) {
      periodStart = new Date(subscription.current_period_start);
    } else {
      // Fallback to start of current month
      periodStart = new Date();
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
    }

    // Count processed images in current period - this is the source of truth
    const { count: processedCount } = await supabase
      .from('processed_images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('processed_at', periodStart.toISOString());

    // Use processed images count as the primary source of truth
    // Credits balance is used for quota enforcement, but display should use actual count
    const imagesProcessed = processedCount || 0;
    
    // Verify credits balance matches (for debugging/monitoring)
    const creditsBalance = credits?.credits_balance ?? monthlyQuota;
    const expectedCreditsBalance = Math.max(0, monthlyQuota - imagesProcessed);
    
    // If there's a mismatch, log it (but don't fail - credits might be adjusted elsewhere)
    if (Math.abs(creditsBalance - expectedCreditsBalance) > 1) {
      console.warn(`Credits balance mismatch for user ${userId}:`, {
        actual: creditsBalance,
        expected: expectedCreditsBalance,
        imagesProcessed,
        monthlyQuota
      });
    }

    // Get or create user stats (for detected_plates and other stats)
    let { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('detected_plates, last_upload_time')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    // Update user_stats with correct monthly_quota and images_processed
    const { error: updateStatsError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        images_processed: imagesProcessed,
        monthly_quota: monthlyQuota,
        detected_plates: stats?.detected_plates || 0,
        last_upload_time: stats?.last_upload_time || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (updateStatsError) {
      console.error('Error updating user_stats:', updateStatsError);
    }

    // Return stats with correct values
    const statsData = {
      images_processed: imagesProcessed,
      monthly_quota: monthlyQuota,
      detected_plates: stats?.detected_plates || 0,
      last_upload_time: stats?.last_upload_time || null
    };

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('processed_images')
      .select('*')
      .eq('user_id', userId)
      .order('processed_at', { ascending: false })
      .limit(6);

    if (activityError) {
      throw activityError;
    }

    // Get or create API key
    let { data: apiKeys, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (keyError || !apiKeys?.length) {
      // Create a new API key if none exists
      const newKey = generateApiKey();
      const { data: newApiKey, error: createKeyError } = await supabase
        .from('api_keys')
        .insert([{
          user_id: userId,
          key: newKey,
          name: 'Default API Key',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
          is_active: true
        }])
        .select()
        .single();

      if (createKeyError) {
        throw createKeyError;
      }
      apiKeys = [newApiKey];
    }

    return NextResponse.json({
      stats: statsData,
      recentActivity: recentActivity || [],
      apiKey: apiKeys[0],
      subscriptionTier: tier // Include tier for frontend display
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 
