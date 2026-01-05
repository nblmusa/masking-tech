import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServiceClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { error } from 'console'


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
): Promise<{ processedImage: Buffer | null; detectedPlates: number }> {
  
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

  if(backgroundBuffer && backgroundBuffer.length > 0){
    const imageArray = new Uint8Array(backgroundBuffer)
    const imageBlob = new Blob([imageArray], { type: 'image/jpeg' })
    console.log('Background image blob:', imageBlob)
    formData.append('background_image', imageBlob, 'background_image.jpg')
  } else {
    console.log('No background image buffer or empty buffer - skipping background_image')
  }
  
  // Add logo settings if provided
  console.log('Logo settings received:', logoSettings)
  if (logoSettings && logoSettings.url) {
    console.log('Adding logo to form data:', {
      url: logoSettings.url,
      position: logoSettings.position,
      hasWatermarkImage: !!logoSettings.watermark_image
    })
    formData.append('logo_url', logoSettings.url)
    formData.append('logo_position', logoSettings.position)
    
    // Add watermark image if available
    if (logoSettings.watermark_image) {
      try {
        // Convert base64 to Blob
        const watermarkImageBuffer = Buffer.from(logoSettings.watermark_image, 'base64')
        const watermarkImageArray = new Uint8Array(watermarkImageBuffer)
        const watermarkImageBlob = new Blob([watermarkImageArray], { type: 'image/png' })
        
        console.log('Adding watermark image to form data')
        formData.append('watermark_image', watermarkImageBlob, 'watermark_image.png')
      } catch (error) {
        console.error('Error processing watermark image:', error)
      }
    }
  } else {
    console.log('No logo settings provided')
  }

  if(logoSettings && logoSettings.plate_logo){
          // Convert base64 to Blob
          const plateLogoBuffer = Buffer.from(logoSettings.plate_logo, 'base64')
          const plateLogoArray = new Uint8Array(plateLogoBuffer)
          const plateLogoBlob = new Blob([plateLogoArray], { type: 'image/png' })
          
          console.log('Adding plate logo to form data')
          formData.append('plate_logo', plateLogoBlob, 'plate_logo.png')
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


    console.log('hereeeeee',process.env.INTERNAL_API_SECRET,userId);

  
  try {
      // Call the Python server

      //77.104.167.149:43159
      //142.170.89.112:23487 - new server
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
      processedImage: null,
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
          
          // If logoSettings contains watermark_image, ensure it's properly formatted
          if (body.logoSettings?.watermark_image) {
            // Make sure we're using the base64 data without the data URI prefix
            if (typeof body.logoSettings.watermark_image === 'string') {
              if (body.logoSettings.watermark_image.includes(',')) {
                body.logoSettings.watermark_image = body.logoSettings.watermark_image.split(',')[1];
              }
            }
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
      console.warn('No background image file found in request - continuing without background image');
      // Continue processing without background image
    }

    // Process the image using Python server
    console.log('Starting image processing with Python server, buffer size:', imageBuffer.length);
    
    const result = await processImageWithPythonServer(
      imageBuffer,
      backgroundBuffer || Buffer.alloc(0), // Pass an empty buffer if backgroundBuffer is undefined
      backgroundReplacement,
      watermarkSettings,
      logoSettings,
      detectionSettings,
      session?.user?.id
    );


    if(!result.processedImage){
      return NextResponse.json({
        success: false,
        error: "Failed to process image"
      })
    }
    
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

        // Deduct credits (1 credit per image)
        // Use service client to bypass RLS for credit deduction
        const serviceSupabase = createServiceClient();
        const { data: currentCredits } = await serviceSupabase
          .from('user_credits')
          .select('credits_balance')
          .eq('user_id', userId)
          .single();

        if (currentCredits && currentCredits.credits_balance > 0) {
          const { error: creditsError } = await serviceSupabase
            .from('user_credits')
            .update({ 
              credits_balance: Math.max(0, currentCredits.credits_balance - 1),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (creditsError) {
            console.error('Credits deduction error:', creditsError);
            // Don't throw - image is already processed, just log the error
          } else {
            // Record usage
            await serviceSupabase
              .from('usage_records')
              .insert({
                user_id: userId,
                service: 'web',
                credits_used: 1,
                month_year: new Date().toISOString().slice(0, 7) // YYYY-MM format
              });
          }
        } else {
          console.warn('User has no credits or credits record not found');
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