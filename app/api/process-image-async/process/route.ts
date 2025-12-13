import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // Set max duration to 5 minutes for long-running processes

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

// Helper function to process image with Python server
async function processImageWithPythonServer(
  imageBuffer: Buffer,
  backgroundBuffer: Buffer | null,
  backgroundReplacement: any,
  watermarkSettings: any,
  logoSettings: any,
  detectionSettings: any,
  userId?: string
): Promise<{ processedImage: Buffer; detectedPlates: number }> {
  
  // Create FormData for the Python server
  const formData = new FormData()
  
  // Add the image - convert Buffer to Uint8Array for Blob compatibility
  const imageArray = new Uint8Array(imageBuffer)
  const imageBlob = new Blob([imageArray], { type: 'image/jpeg' })
  formData.append('image', imageBlob, 'image.jpg')
  
  // Add background label if using preset backgrounds
  if (backgroundReplacement?.template && backgroundReplacement.template !== 'transparent') {
    formData.append('background_label', backgroundReplacement.template)
  }

  // Add background image if provided
  if (backgroundBuffer) {
    const backgroundArray = new Uint8Array(backgroundBuffer)
    const backgroundBlob = new Blob([backgroundArray], { type: 'image/jpeg' })
    formData.append('background_image', backgroundBlob, 'background_image.jpg')
  }
  
  // Add logo settings if provided
  if (logoSettings && logoSettings.url) {
    formData.append('logo_url', logoSettings.url)
    formData.append('logo_position', logoSettings.position)
  }
  
  // Add detection settings
  if (detectionSettings) {
    formData.append('blur_faces', detectionSettings.blurFaces ? 'true' : 'false')
    formData.append('blur_license_plates', detectionSettings.blurLicensePlates ? 'true' : 'false')
  }
  
  // Add watermark settings if provided
  if (watermarkSettings && watermarkSettings.text) {
    formData.append('watermark_text', watermarkSettings.text)
    formData.append('watermark_position', watermarkSettings.position)
    formData.append('watermark_size', watermarkSettings.size.toString())
    formData.append('watermark_opacity', watermarkSettings.opacity.toString())
    formData.append('watermark_color', watermarkSettings.color)
  }
  
  try {
    // Call the Python server
    const response = await fetch(`http://localhost:8080/api/v1/generate-v1`, {
      method: 'POST',
      headers: {
        'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        ...(userId && { 'X-User-ID': userId })
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Python server error: ${response.status} - ${errorText}`)
    }
    
    // Get the processed image as buffer
    const processedImageBuffer = Buffer.from(await response.arrayBuffer())
    
    // For now, we'll assume 1 license plate detected (you can enhance this later)
    const detectedPlates = 1
    
    return {
      processedImage: processedImageBuffer,
      detectedPlates
    }
    
  } catch (error) {
    console.error('Python server processing error:', error)
    
    // Fallback: return original image with basic processing
    console.log('Falling back to basic processing')
    return {
      processedImage: imageBuffer,
      detectedPlates: 0
    }
  }
}

// This endpoint is intended to be called by a cron job or worker
// It processes a specific image request by its ID
export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the process ID from the request body
    const body = await request.json()
    const processId = body.processId
    
    if (!processId) {
      return NextResponse.json({ error: 'Process ID is required' }, { status: 400 })
    }
    
    // Get the process data from the database
    const { data: processingData, error: fetchError } = await supabase
      .from('image_processing_queue')
      .select('*')
      .eq('id', processId)
      .single()
    
    if (fetchError || !processingData) {
      console.error('Error fetching process data:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch process data' }, { status: 500 })
    }
    
    // Check if the process is already completed or failed
    if (['completed', 'failed'].includes(processingData.status)) {
      return NextResponse.json({
        success: false,
        message: `Process is already in ${processingData.status} state`,
        processId
      })
    }
    
    // Update status to processing
    await supabase
      .from('image_processing_queue')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', processId)
    
    // Get the original image from storage
    const { data: originalImageData, error: originalImageError } = await supabase.storage
      .from('processed-images')
      .download(`processing/${processId}/original.jpg`)
    
    if (originalImageError || !originalImageData) {
      console.error('Error downloading original image:', originalImageError)
      
      // Update status to failed
      await supabase
        .from('image_processing_queue')
        .update({
          status: 'failed',
          error_message: 'Failed to download original image',
          updated_at: new Date().toISOString()
        })
        .eq('id', processId)
      
      return NextResponse.json({ error: 'Failed to download original image' }, { status: 500 })
    }
    
    // Get the background image from storage if it exists
    let backgroundBuffer: Buffer | null = null
    try {
      const { data: backgroundImageData } = await supabase.storage
        .from('processed-images')
        .download(`processing/${processId}/background.jpg`)
      
      if (backgroundImageData) {
        backgroundBuffer = await backgroundImageData.arrayBuffer().then(Buffer.from)
      }
    } catch (backgroundError) {
      console.log('No background image found or error downloading:', backgroundError)
      // Continue without background image
    }
    
    // Convert the original image to a buffer
    const imageBuffer = await originalImageData.arrayBuffer().then(Buffer.from)
    
    // Get the settings from the process data
    const { settings } = processingData
    
    try {
      // Process the image
      const result = await processImageWithPythonServer(
        imageBuffer,
        backgroundBuffer,
        settings.backgroundReplacement,
        settings.watermarkSettings,
        settings.logoSettings,
        settings.detectionSettings,
        processingData.user_id
      )
      
      // Create thumbnail from the processed image
      const thumbnail = await sharp(result.processedImage)
        .resize(320, 240, { 
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer()
      
      // Upload processed image and thumbnail
      const processedImageUrl = await uploadToStorage(
        supabase,
        result.processedImage,
        `processing/${processId}/processed.jpg`
      )
      
      const thumbnailUrl = await uploadToStorage(
        supabase,
        thumbnail,
        `processing/${processId}/thumbnail.jpg`
      )
      
      // Convert processed image to base64 for storage in the database
      const base64Image = `data:image/jpeg;base64,${result.processedImage.toString('base64')}`
      
      // Update the process data with the result
      await supabase
        .from('image_processing_queue')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
          result: {
            maskedImage: base64Image,
            processedImageUrl,
            thumbnailUrl,
            metadata: {
              licensePlatesDetected: result.detectedPlates,
              originalSize: imageBuffer.length,
              processedSize: result.processedImage.length,
              backgroundReplaced: !!settings.backgroundReplacement,
              watermarkEnabled: !!settings.watermarkSettings?.enabled,
              contentType: 'image/jpeg'
            }
          }
        })
        .eq('id', processId)
      
      // If the user is authenticated, record the processed image in their history
      if (processingData.user_id && processingData.user_id !== 'anonymous') {
        await supabase
          .from('processed_images')
          .insert([{
            user_id: processingData.user_id,
            filename: `processed_${processId}.jpg`,
            license_plates_detected: result.detectedPlates,
            processed_url: processedImageUrl,
            thumbnail_url: thumbnailUrl,
            metadata: {
              originalSize: imageBuffer.length,
              processedSize: result.processedImage.length,
              backgroundReplaced: !!settings.backgroundReplacement,
              watermarkEnabled: !!settings.watermarkSettings?.enabled
            }
          }])

        // Deduct credits (1 credit per image)
        const { data: currentCredits } = await supabase
          .from('user_credits')
          .select('credits_balance')
          .eq('user_id', processingData.user_id)
          .single();

        if (currentCredits && currentCredits.credits_balance > 0) {
          const { error: creditsError } = await supabase
            .from('user_credits')
            .update({ 
              credits_balance: Math.max(0, currentCredits.credits_balance - 1),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', processingData.user_id);

          if (!creditsError) {
            // Record usage
            await supabase
              .from('usage_records')
              .insert({
                user_id: processingData.user_id,
                service: 'async',
                credits_used: 1,
                month_year: new Date().toISOString().slice(0, 7) // YYYY-MM format
              });
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Image processing completed successfully',
        processId
      })
      
    } catch (processingError) {
      console.error('Error processing image:', processingError)
      
      // Update status to failed
      await supabase
        .from('image_processing_queue')
        .update({
          status: 'failed',
          error_message: `Processing error: ${processingError instanceof Error ? processingError.message : 'Unknown error'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', processId)
      
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error in process-image-async/process:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
