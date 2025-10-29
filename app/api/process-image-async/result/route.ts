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

    // Query the database for the processing result
    const { data: processingData, error } = await supabase
      .from('image_processing_queue')
      .select('*')
      .eq('id', processId)
      .single()

    if (error) {
      console.error('Error fetching process data:', error)
      return NextResponse.json({ error: 'Failed to fetch process data' }, { status: 500 })
    }

    if (!processingData) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Check if the user has permission to access this process
    // Skip this check for anonymous users or if you want to allow public access
    if (session && processingData.user_id !== userId && processingData.user_id !== 'anonymous') {
      return NextResponse.json({ error: 'Unauthorized access to process' }, { status: 403 })
    }

    // Check if the process is completed
    if (processingData.status !== 'completed') {
      return NextResponse.json({
        success: false,
        processId: processingData.id,
        status: processingData.status,
        message: 'Processing not yet completed',
        error_message: processingData.error_message || null
      }, { status: 202 }) // 202 Accepted - request accepted but not yet completed
    }

    // If there's no result data, return an error
    if (!processingData.result) {
      return NextResponse.json({ error: 'No result data available' }, { status: 404 })
    }

    // Return the processed image result
    return NextResponse.json({
      success: true,
      processId: processingData.id,
      status: processingData.status,
      result: processingData.result,
      metadata: processingData.metadata || {},
      created_at: processingData.created_at,
      completed_at: processingData.updated_at
    })

  } catch (error) {
    console.error('Error in process-image-async/result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch process result' },
      { status: 500 }
    )
  }
}
