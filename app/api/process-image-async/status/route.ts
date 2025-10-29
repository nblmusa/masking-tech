import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Get the process ID from the URL
    const { searchParams } = new URL(request.url)
    const processId = searchParams.get('processId')

    if (!processId) {
      return NextResponse.json({ error: 'Process ID is required' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || 'anonymous'

    // Query the database for the processing status
    const { data: processingData, error } = await supabase
      .from('image_processing_queue')
      .select('*')
      .eq('id', processId)
      .single()

    if (error) {
      console.error('Error fetching process status:', error)
      return NextResponse.json({ error: 'Failed to fetch process status' }, { status: 500 })
    }

    if (!processingData) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Check if the user has permission to access this process
    // Skip this check for anonymous users or if you want to allow public access
    if (session && processingData.user_id !== userId && processingData.user_id !== 'anonymous') {
      return NextResponse.json({ error: 'Unauthorized access to process' }, { status: 403 })
    }

    // Return the process status
    return NextResponse.json({
      success: true,
      processId: processingData.id,
      status: processingData.status,
      created_at: processingData.created_at,
      updated_at: processingData.updated_at,
      error_message: processingData.error_message || null,
      progress: processingData.progress || 0,
      estimated_completion_time: processingData.estimated_completion_time || null
    })

  } catch (error) {
    console.error('Error in process-image-async/status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch process status' },
      { status: 500 }
    )
  }
}
