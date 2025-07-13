import { NextResponse } from 'next/server'
import sharp, { Blend } from 'sharp'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { detectAndMask } from '@/app/lib/image-processing'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Add schema for background removal settings
const BackgroundRemovalSettingsSchema = z.object({
  enabled: z.boolean(),
  refinementLevel: z.enum(['fast', 'balanced', 'detailed']).default('balanced'),
  keepShadows: z.boolean().default(false),
  backgroundColor: z.string().nullable().default(null)
})

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

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    let imageBuffer: Buffer | undefined;
    let imageMetadata: { name: string; type: string; } | undefined;
    let logoBuffer: Buffer | undefined;
    let logoSettings: any;
    let watermarkSettings: any;
    let backgroundRemovalSettings: any;

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

      // Get logo file if provided
      const logoFile = formData.get('logo') as File;
      if (logoFile) {
        logoBuffer = Buffer.from(await logoFile.arrayBuffer());
      }

      // Parse settings
      try {
        logoSettings = formData.get('logoSettings') ? 
          JSON.parse(formData.get('logoSettings') as string) : 
          null;

        watermarkSettings = formData.get('watermarkSettings') ? 
          JSON.parse(formData.get('watermarkSettings') as string) : 
          null;

        // Parse and validate background removal settings
        backgroundRemovalSettings = BackgroundRemovalSettingsSchema.parse({
          enabled: formData.get('backgroundRemovalEnabled') === 'true',
          refinementLevel: formData.get('refinementLevel') || 'balanced',
          keepShadows: formData.get('keepShadows') === 'true',
          backgroundColor: formData.get('backgroundColor') || null
        });
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
          imageMetadata = {
            name: body.filename || 'image.jpg',
            type: 'image/jpeg'
          };
        }
        
        if (body.logo) {
          const logoBase64 = body.logo.split(',')[1] || body.logo;
          logoBuffer = Buffer.from(logoBase64, 'base64');
        }
        
        logoSettings = body.logoSettings;
        watermarkSettings = body.watermarkSettings;

        // Parse and validate background removal settings
        backgroundRemovalSettings = BackgroundRemovalSettingsSchema.parse({
          enabled: body.backgroundRemovalEnabled || false,
          refinementLevel: body.refinementLevel || 'balanced',
          keepShadows: body.keepShadows || false,
          backgroundColor: body.backgroundColor || null
        });
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

    // Process the image
    console.log('Starting image processing with buffer size:', imageBuffer.length);
    const result = await detectAndMask(
      imageBuffer,
      logoBuffer,
      logoSettings,
      watermarkSettings,
      backgroundRemovalSettings
    );
    console.log('Processing result:', {
      hasProcessedImage: !!result.processedImage,
      processedImageSize: result.processedImage?.length,
      detectedPlates: result.detectedPlates,
      hasError: !!result.error,
      error: result.error?.message
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
              logoApplied: !!logoBuffer
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
        logoApplied: !!logoBuffer,
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