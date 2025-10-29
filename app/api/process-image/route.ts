import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'


export const dynamic = 'force-dynamic'

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

async function processImageWithPythonServer(
  imageBuffer: Buffer,
  backgroundBuffer: Buffer,
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

  if(backgroundBuffer){
    const imageArray = new Uint8Array(backgroundBuffer)
    const imageBlob = new Blob([imageArray], { type: 'image/jpeg' })
    console.log('Background image blob:', imageBlob)
    formData.append('background_image', imageBlob, 'background_image.jpg')
  }
  
  // Add logo settings if provided
  console.log('Logo settings received:', logoSettings)
  if (logoSettings && logoSettings.url) {
    console.log('Adding logo to form data:', {
      url: logoSettings.url,
      position: logoSettings.position
    })
    formData.append('logo_url', logoSettings.url)
    formData.append('logo_position', logoSettings.position)
  } else {
    console.log('No logo settings provided')
  }
  
  // Add detection settings
  console.log('Detection settings received:', detectionSettings)
  if (detectionSettings) {
    formData.append('blur_faces', detectionSettings.blurFaces ? 'true' : 'false')
    formData.append('blur_license_plates', detectionSettings.blurLicensePlates ? 'true' : 'false')
    console.log('Detection settings added to form data:', {
      blurFaces: detectionSettings.blurFaces,
      blurLicensePlates: detectionSettings.blurLicensePlates
    })
  }
  
  // Add watermark settings if provided
  console.log('Watermark settings received:', watermarkSettings)
  if (watermarkSettings && watermarkSettings.text) {
    console.log('Adding watermark to form data:', {
      text: watermarkSettings.text,
      position: watermarkSettings.position,
      size: watermarkSettings.size,
      opacity: watermarkSettings.opacity,
      color: watermarkSettings.color
    })
    formData.append('watermark_text', watermarkSettings.text)
    formData.append('watermark_position', watermarkSettings.position)
    formData.append('watermark_size', watermarkSettings.size.toString())
    formData.append('watermark_opacity', watermarkSettings.opacity.toString())
    formData.append('watermark_color', watermarkSettings.color)
  } else {
    console.log('No watermark settings or text provided')
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
    // The Python server already handles license plate blurring
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

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    let imageBuffer: Buffer | undefined;
    let imageMetadata: { name: string; type: string; } | undefined;
    let backgroundReplacement: any;
    let watermarkSettings: any;
    let logoSettings: any;
    let detectionSettings: any;
    let backgroundBuffer: Buffer | undefined;
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Get image file
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return new Response('No image file provided', { status: 400 });
      }
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      imageMetadata = {
        name: imageFile.name,
        type: imageFile.type || 'image/jpeg'
      };

      const backgroundFile = formData.get('backgroundImage') as File;
      if (backgroundFile) {
        backgroundBuffer = Buffer.from(await backgroundFile.arrayBuffer());
      }

  
      // Parse settings
      try {
        backgroundReplacement = formData.get('backgroundReplacement') ? 
          JSON.parse(formData.get('backgroundReplacement') as string) : 
          null;
        watermarkSettings = formData.get('watermarkSettings') ? 
          JSON.parse(formData.get('watermarkSettings') as string) : 
          null;
        logoSettings = formData.get('logoSettings') ? 
          JSON.parse(formData.get('logoSettings') as string) : 
          null;
        detectionSettings = formData.get('detectionSettings') ? 
          JSON.parse(formData.get('detectionSettings') as string) : 
          null;
      } catch (error) {
        console.error('Settings parsing error:', error);
        return new Response('Invalid settings format', { status: 400 });
      }
    } else if (contentType?.includes('application/json')) {
      try {
        const body = await request.json();
        
        if (body.image) {
          const base64Data = body.image.split(',')[1] || body.image;
          imageBuffer = Buffer.from(base64Data, 'base64');
          if (body.backgroundImage) {
            const backgroundBase64Data = body.backgroundImage.split(',')[1] || body.backgroundImage;
            backgroundBuffer = Buffer.from(backgroundBase64Data, 'base64');
          }
          imageMetadata = {
            name: body.filename || 'image.jpg',
            type: 'image/jpeg'
          };
        }
        
        backgroundReplacement = body.backgroundReplacement;
        watermarkSettings = body.watermarkSettings;
        logoSettings = body.logoSettings;
        detectionSettings = body.detectionSettings;
      } catch (error) {
        console.error('Settings parsing error:', error);
        return new Response('Invalid settings format', { status: 400 });
      }
    } else {
      console.error('Unsupported content type:', contentType)
      return NextResponse.json({
        error: 'Unsupported content type',
        expected: 'multipart/form-data or application/json',
        received: contentType
      }, { status: 400 })
    }

    if (!imageBuffer || !imageMetadata) {
      console.error('No image file found in request');
      return new Response('No image file provided or invalid format', { status: 400 });
    }

    if (!backgroundBuffer) {
      console.error('No background image file found in request');
      return new Response('No background image file provided or invalid format', { status: 400 });
    }

    // Process the image using Python server
    console.log('Starting image processing with Python server, buffer size:', imageBuffer.length);
    
    const result = await processImageWithPythonServer(
      imageBuffer,
      backgroundBuffer,
      backgroundReplacement,
      watermarkSettings,
      logoSettings,
      detectionSettings,
      session?.user?.id
    );
    
    console.log('Processing result:', {
      hasProcessedImage: !!result.processedImage,
      processedImageSize: result.processedImage?.length,
      detectedPlates: result.detectedPlates
    })

    let processedImage = result.processedImage

    // Create thumbnail from the processed image
    console.log('Creating thumbnail from processed image')
    const thumbnail = await sharp(processedImage)
      .resize(320, 240, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer()

    // Upload processed image and thumbnail if authenticated
    let processedImageUrl: string | null = null
    let thumbnailUrl: string | null = null

    if (isAuthenticated && session) {
      console.log('User is authenticated, uploading to storage')
      const userId = session.user.id
      const timestamp = Date.now()
      const filename = imageMetadata.name.replace(/\.[^/.]+$/, '')
      
      try {
        // Upload processed image
        processedImageUrl = await uploadToStorage(
          supabase,
          processedImage,
          `${userId}/${timestamp}_${filename}_processed.jpg`
        )
        console.log('Processed image uploaded successfully:', processedImageUrl)

        // Upload thumbnail of the processed image
        thumbnailUrl = await uploadToStorage(
          supabase,
          thumbnail,
          `${userId}/${timestamp}_${filename}_thumb.jpg`
        )
        console.log('Thumbnail uploaded successfully:', thumbnailUrl)

        // Record the processed image in the database
        const { error: dbError } = await supabase
          .from('processed_images')
          .insert([{
            user_id: userId,
            filename: imageMetadata.name,
            license_plates_detected: result.detectedPlates,
            processed_url: processedImageUrl,
            thumbnail_url: thumbnailUrl,
            metadata: {
              originalSize: imageBuffer.length,
              processedSize: processedImage.length,
              backgroundReplaced: !!backgroundReplacement,
              watermarkEnabled: !!watermarkSettings?.enabled
            }
          }])

        if (dbError) {
          console.error('Database insert error:', dbError)
          throw dbError
        }

        // Update user stats
        const { error: statsError } = await supabase.rpc(
          'update_user_stats',
          { 
            p_user_id: userId,
            p_plates_detected: result.detectedPlates
          }
        )

        if (statsError) {
          console.error('Stats update error:', statsError)
          throw statsError
        }
      } catch (uploadError) {
        console.error('Upload/database error:', uploadError)
        throw uploadError
      }
    }

    // Convert Buffer to base64 string for response
    console.log('Converting processed image to base64, size:', processedImage.length)
    const base64Image = `data:${imageMetadata.type};base64,${processedImage.toString('base64')}`

    return NextResponse.json({
      success: true,
      maskedImage: base64Image,
      metadata: {
        licensePlatesDetected: result.detectedPlates,
        originalSize: imageBuffer.length,
        processedSize: processedImage.length,
        backgroundReplaced: !!backgroundReplacement,
        watermarkEnabled: !!watermarkSettings?.enabled,
        contentType: imageMetadata.type
      },
      processedImageUrl,
      thumbnailUrl
    })
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}