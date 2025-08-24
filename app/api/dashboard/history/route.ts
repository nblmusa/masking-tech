import { NextResponse } from 'next/server';
import supabaseServer from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabase = supabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get paginated processed images
    const { data: images, error: imagesError } = await supabase
      .from('processed_images')
      .select('*')
      .eq('user_id', userId)
      .order('processed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (imagesError) {
      throw imagesError;
    }

    // Get total count for pagination info
    const { count, error: countError } = await supabase
      .from('processed_images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      throw countError;
    }

    return NextResponse.json({
      images: images || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image history' },
      { status: 500 }
    );
  }
}
