import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

// Define processing statuses
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

// Helper function to upload processed images to storage
async function uploadToStorage(
  supabase: any,
  buffer: Buffer,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('processed-images')
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('processed-images')
    .getPublicUrl(path)
  
  return publicUrl
}

// Main POST endpoint for initiating async image processing
export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session
    const userId = session?.user?.id || 'anonymous'

    // Parse request body
    let imageBuffer: Buffer | undefined
    let backgroundBuffer: Buffer | undefined
    let backgroundReplacement: any
    let watermarkSettings: any
    let logoSettings: any
    let detectionSettings: any
    let contentType = 'image/jpeg' // Default content type

    const requestContentType = request.headers.get('content-type')

    // Handle different content types
    if (requestContentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      // Get image file
      const imageFile = formData.get('image') as File
      if (!imageFile) {
        return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
      }
      imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      
      // Get background image if provided
      const backgroundFile = formData.get('backgroundImage') as File
      if (backgroundFile) {
        backgroundBuffer = Buffer.from(await backgroundFile.arrayBuffer())
      }

      // Parse settings
      try {
        backgroundReplacement = formData.get('backgroundReplacement') ? 
          JSON.parse(formData.get('backgroundReplacement') as string) : 
          null
        watermarkSettings = formData.get('watermarkSettings') ? 
          JSON.parse(formData.get('watermarkSettings') as string) : 
          null
        logoSettings = formData.get('logoSettings') ? 
          JSON.parse(formData.get('logoSettings') as string) : 
          null
        detectionSettings = formData.get('detectionSettings') ? 
          JSON.parse(formData.get('detectionSettings') as string) : 
          null
      } catch (error) {
        console.error('Settings parsing error:', error)
        return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
      }
    } else if (requestContentType?.includes('application/json')) {
      try {
        const body = await request.json()
        
        if (body.image) {
          const base64Data = body.image.split(',')[1] || body.image
          imageBuffer = Buffer.from(base64Data, 'base64')
          contentType = body.contentType || 'image/jpeg'
          
          if (body.backgroundImage) {
            const backgroundBase64Data = body.backgroundImage.split(',')[1] || body.backgroundImage
            backgroundBuffer = Buffer.from(backgroundBase64Data, 'base64')
          }
        }
        
        backgroundReplacement = body.backgroundReplacement
        watermarkSettings = body.watermarkSettings
        logoSettings = body.logoSettings
        detectionSettings = body.detectionSettings
      } catch (error) {
        console.error('Request parsing error:', error)
        return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
      }
    } else {
      return NextResponse.json({
        error: 'Unsupported content type',
        expected: 'multipart/form-data or application/json',
        received: requestContentType
      }, { status: 400 })
    }

    if (!imageBuffer) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    // Generate a unique process ID
    const processId = uuidv4()
    const timestamp = new Date().toISOString()
    
    // Store the request data in Supabase for async processing
    const { error: insertError } = await supabase
      .from('image_processing_queue')
      .insert({
        id: processId,
        user_id: userId,
        status: 'pending' as ProcessingStatus,
        created_at: timestamp,
        updated_at: timestamp,
        settings: {
          backgroundReplacement,
          watermarkSettings,
          logoSettings,
          detectionSettings,
          contentType
        },
        result: null
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to queue processing request' }, { status: 500 })
    }

    // Store the image and background buffers in Supabase storage
    try {
      // Upload original image
      await uploadToStorage(
        supabase,
        imageBuffer,
        `processing/${processId}/original.jpg`
      )
      
      // Upload background image if provided
      if (backgroundBuffer) {
        await uploadToStorage(
          supabase,
          backgroundBuffer,
          `processing/${processId}/background.jpg`
        )
      }
    } catch (uploadError) {
      console.error('Storage upload error:', uploadError)
      
      // Update the status to failed
      await supabase
        .from('image_processing_queue')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString(),
          error_message: 'Failed to upload images to storage'
        })
        .eq('id', processId)
      
      return NextResponse.json({ error: 'Failed to store images' }, { status: 500 })
    }

    // Trigger background processing (this would typically be done by a worker/cron job)
    // For now, we'll just update the status to processing
    await supabase
      .from('image_processing_queue')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', processId)
    
    // Return the process ID immediately
    return NextResponse.json({
      success: true,
      processId,
      message: 'Image processing has been queued',
      status: 'pending'
    })

  } catch (error) {
    console.error('Error in process-image-async:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
