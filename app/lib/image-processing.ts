// import * as tf from '@tensorflow/tfjs-node';
// import * as tf from '@tensorflow/tfjs-node';
import sharp, { Blend } from 'sharp';
import { LogoSettings, DEFAULT_SETTINGS } from './config';

export interface ProcessingResult {
  processedImage: Buffer;
  thumbnail: Buffer;
  detectedPlates: number;
  detectedFaces: number;
  detectedCars: number;
  error?: Error;
}

export interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
}

export interface WatermarkSettings {
  text: string;
  position: string;
  size: number;
  opacity: number;
  color: string;
  font: string;
}

export interface BackgroundRemovalSettings {
  enabled: boolean;
  refinementLevel: 'fast' | 'balanced' | 'detailed';
  keepShadows: boolean;
  backgroundColor: string | null; 
  licensePlateBlurring?: boolean;
  shadowEffect?: boolean;
}

export const MASK_TYPES = ['blur', 'solid'] as const;
export const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const;

async function addWatermark(imageBuffer: Buffer, watermarkSettings?: Partial<WatermarkSettings>): Promise<Buffer> {
  // Get image dimensions
  const metadata = await sharp(imageBuffer).metadata()
  const { width = 800, height = 600, format } = metadata
  
  // Default text if no settings provided
  const text = watermarkSettings?.text || 'MaskingTech.com'
  const fontSize = Math.min(width, height) * (watermarkSettings?.size || 20) / 100
  const opacity = watermarkSettings?.opacity || 0.7
  const color = watermarkSettings?.color || '#ffffff'
  const font = watermarkSettings?.font || 'Arial'
  const position = watermarkSettings?.position || 'bottom-right'

  // Calculate padding
  const padding = Math.min(width, height) * 0.05 // 5% padding

  // Create SVG watermark text with background for better visibility
  const svgText = `
    <svg width="${width}" height="${height}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="shadow"/>
          <feFlood flood-color="#000000" flood-opacity="0.3"/>
          <feComposite in2="shadow" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <text 
        x="${getXPosition(width, padding, position)}"
        y="${getYPosition(height, padding, position)}"
        font-family="${font}"
        font-size="${fontSize}px"
        fill="${color}"
        opacity="${opacity}"
        text-anchor="${getTextAnchor(position)}"
        dominant-baseline="${getBaseline(position)}"
        filter="url(#shadow)"
        transform="rotate(${position === 'center' ? '-30' : '0'}, ${getXPosition(width, padding, position)}, ${getYPosition(height, padding, position)})"
      >
        ${text}
      </text>
    </svg>
  `

  // Add watermark to image
  return await sharp(imageBuffer)
    .composite([{
      input: Buffer.from(svgText),
      blend: 'over' as Blend
    }])
    .toFormat(format || 'jpeg')
    .toBuffer()
}

// Helper functions for positioning
function getXPosition(width: number, padding: number, position = 'bottom-right'): number {
  if (position === 'center') return width / 2
  if (position.includes('left')) return padding
  if (position.includes('right')) return width - padding
  return width / 2 // center fallback
}

function getYPosition(height: number, padding: number, position = 'bottom-right'): number {
  if (position === 'center') return height / 2
  if (position.includes('top')) return padding * 2
  if (position.includes('bottom')) return height - padding
  return height / 2 // center fallback
}

function getTextAnchor(position = 'bottom-right'): string {
  if (position === 'center') return 'middle'
  if (position.includes('left')) return 'start'
  if (position.includes('right')) return 'end'
  return 'middle'
}

function getBaseline(position = 'bottom-right'): string {
  if (position === 'center') return 'middle'
  if (position.includes('top')) return 'hanging'
  if (position.includes('bottom')) return 'auto'
  return 'middle'
}

// export async function detectAndMask(
//   imageBuffer: Buffer,
//   logoBuffer?: Buffer,
//   logoSettings: LogoSettings = DEFAULT_SETTINGS,
//   watermarkSettings?: Partial<WatermarkSettings>,
//   backgroundRemovalSettings?: BackgroundRemovalSettings
// ): Promise<ProcessingResult> {
//   try {
//     // tf.engine().startScope();
// export async function detectAndMask(
//   imageBuffer: Buffer,
//   logoBuffer?: Buffer,
//   logoSettings: LogoSettings = DEFAULT_SETTINGS,
//   watermarkSettings?: Partial<WatermarkSettings>,
//   backgroundRemovalSettings?: BackgroundRemovalSettings
// ): Promise<ProcessingResult> {
//   try {
//     // tf.engine().startScope();

//     // Initialize result
//     let processedImage = imageBuffer;
//     let detectedCars = 0;
//     // Initialize result
//     let processedImage = imageBuffer;
//     let detectedCars = 0;

//     // Load and preprocess the image
//     const image = await sharp(imageBuffer);
//     const metadata = await image.metadata();
//     const originalWidth = metadata.width || 640;
//     const originalHeight = metadata.height || 640;
//     // Load and preprocess the image
//     const image = await sharp(imageBuffer);
//     const metadata = await image.metadata();
//     const originalWidth = metadata.width || 640;
//     const originalHeight = metadata.height || 640;

//     // If logo is provided, preprocess it
//     let processedLogo: Buffer | undefined;
//     if (logoBuffer) {
//       try {
//         processedLogo = await sharp(logoBuffer)
//           .trim()
//           .toBuffer();
//       } catch (error) {
//         console.error('Error preprocessing logo:', error);
//         processedLogo = undefined;
//       }
//     }
//     // If logo is provided, preprocess it
//     let processedLogo: Buffer | undefined;
//     if (logoBuffer) {
//       try {
//         processedLogo = await sharp(logoBuffer)
//           .trim()
//           .toBuffer();
//       } catch (error) {
//         console.error('Error preprocessing logo:', error);
//         processedLogo = undefined;
//       }
//     }

//     // Calculate aspect ratio and padding
//     const aspectRatio = originalWidth / originalHeight;
//     let resizeWidth = 640;
//     let resizeHeight = 640;
//     let paddingX = 0;
//     let paddingY = 0;
//     // Calculate aspect ratio and padding
//     const aspectRatio = originalWidth / originalHeight;
//     let resizeWidth = 640;
//     let resizeHeight = 640;
//     let paddingX = 0;
//     let paddingY = 0;

//     if (aspectRatio > 1) {
//       resizeHeight = Math.round(640 / aspectRatio);
//       paddingY = Math.round((640 - resizeHeight) / 2);
//     } else {
//       resizeWidth = Math.round(640 * aspectRatio);
//       paddingX = Math.round((640 - resizeWidth) / 2);
//     }
//     if (aspectRatio > 1) {
//       resizeHeight = Math.round(640 / aspectRatio);
//       paddingY = Math.round((640 - resizeHeight) / 2);
//     } else {
//       resizeWidth = Math.round(640 * aspectRatio);
//       paddingX = Math.round((640 - resizeWidth) / 2);
//     }

//     // Resize image for model input
//     const resizedImage = await image
//       .resize(640, 640, {
//         fit: 'contain',
//         background: { r: 0, g: 0, b: 0, alpha: 1 }
//       })
//       .raw()
//       .toBuffer();
//     // Resize image for model input
//     const resizedImage = await image
//       .resize(640, 640, {
//         fit: 'contain',
//         background: { r: 0, g: 0, b: 0, alpha: 1 }
//       })
//       .raw()
//       .toBuffer();

//     // Calculate scaling ratios
//     const xRatio = originalWidth / resizeWidth;
//     const yRatio = originalHeight / resizeHeight;
//     // Calculate scaling ratios
//     const xRatio = originalWidth / resizeWidth;
//     const yRatio = originalHeight / resizeHeight;

//     // Convert to tensor and normalize
//     // const tensor = tf.tensor3d(new Uint8Array(resizedImage), [640, 640, 3]);
//     // const normalized = tf.tidy(() => tensor.div(255.0).expandDims(0));
//     // tf.dispose(tensor);
//     // Convert to tensor and normalize
//     // const tensor = tf.tensor3d(new Uint8Array(resizedImage), [640, 640, 3]);
//     // const normalized = tf.tidy(() => tensor.div(255.0).expandDims(0));
//     // tf.dispose(tensor);

//     // Detect license plates
//     let plateDetections: Detection[] = [];
//     try {
//       // plateDetections = await detectPlates(normalized as tf.Tensor4D, paddingX, paddingY, xRatio, yRatio);
//     } catch (error) {
//       console.error('License plate detection error:', error);
//     }
//     // Detect license plates
//     let plateDetections: Detection[] = [];
//     try {
//       // plateDetections = await detectPlates(normalized as tf.Tensor4D, paddingX, paddingY, xRatio, yRatio);
//     } catch (error) {
//       console.error('License plate detection error:', error);
//     }

//     // Detect faces if authenticated
//     let faceDetections: Detection[] = [];
//     try {
//       faceDetections = await detectFaces(normalized as any, paddingX, paddingY, xRatio, yRatio);
//     } catch (error) {
//       console.error('Face detection error:', error);
//     }
//     // Detect faces if authenticated
//     let faceDetections: Detection[] = [];
//     try {
//       faceDetections = await detectFaces(normalized as any, paddingX, paddingY, xRatio, yRatio);
//     } catch (error) {
//       console.error('Face detection error:', error);
//     }

//     // Detect cars if enabled
//     let carDetections: Detection[] = [];
//     console.log('Background removal settings:', backgroundRemovalSettings);
//     if (backgroundRemovalSettings?.enabled) {
//       console.log('Detecting cars with background removal settings:', backgroundRemovalSettings);
//       try {
//         // carDetections = await detectCars(normalized as tf.Tensor4D, paddingX, paddingY, xRatio, yRatio);
//         detectedCars = carDetections.length;
//     // Detect cars if enabled
//     let carDetections: Detection[] = [];
//     console.log('Background removal settings:', backgroundRemovalSettings);
//     if (backgroundRemovalSettings?.enabled) {
//       console.log('Detecting cars with background removal settings:', backgroundRemovalSettings);
//       try {
//         // carDetections = await detectCars(normalized as tf.Tensor4D, paddingX, paddingY, xRatio, yRatio);
//         detectedCars = carDetections.length;

//         // Process each detected car
//         for (const detection of carDetections) {
//           const carRegion = await sharp(processedImage)
//             .extract({
//               left: Math.round(detection.x1),
//               top: Math.round(detection.y1),
//               width: Math.round(detection.x2 - detection.x1),
//               height: Math.round(detection.y2 - detection.y1)
//             })
//             .toBuffer();
//         // Process each detected car
//         for (const detection of carDetections) {
//           const carRegion = await sharp(processedImage)
//             .extract({
//               left: Math.round(detection.x1),
//               top: Math.round(detection.y1),
//               width: Math.round(detection.x2 - detection.x1),
//               height: Math.round(detection.y2 - detection.y1)
//             })
//             .toBuffer();

//           // Remove background from car region
//           const processedCarRegion = await removeBackground(carRegion, {
//             refinementLevel: backgroundRemovalSettings.refinementLevel,
//             keepShadows: backgroundRemovalSettings.keepShadows,
//             backgroundColor: backgroundRemovalSettings.backgroundColor,
//             licensePlateBlurring: backgroundRemovalSettings.licensePlateBlurring,
//             shadowEffect: backgroundRemovalSettings.shadowEffect
//           });
//           // Remove background from car region
//           const processedCarRegion = await removeBackground(carRegion, {
//             refinementLevel: backgroundRemovalSettings.refinementLevel,
//             keepShadows: backgroundRemovalSettings.keepShadows,
//             backgroundColor: backgroundRemovalSettings.backgroundColor,
//             licensePlateBlurring: backgroundRemovalSettings.licensePlateBlurring,
//             shadowEffect: backgroundRemovalSettings.shadowEffect
//           });

//           // Composite the processed car region back onto the image
//           processedImage = await sharp(processedImage)
//             .composite([{
//               input: processedCarRegion,
//               left: Math.round(detection.x1),
//               top: Math.round(detection.y1),
//               blend: 'over' as Blend
//             }])
//             .toBuffer();
//         }
//       } catch (error) {
//         console.error('Car detection/background removal error:', error);
//       }
//     }
//           // Composite the processed car region back onto the image
//           processedImage = await sharp(processedImage)
//             .composite([{
//               input: processedCarRegion,
//               left: Math.round(detection.x1),
//               top: Math.round(detection.y1),
//               blend: 'over' as Blend
//             }])
//             .toBuffer();
//         }
//       } catch (error) {
//         console.error('Car detection/background removal error:', error);
//       }
//     }

//     // tf.dispose(normalized);
//     // tf.dispose(normalized);

//     // Create composite operations for masking plates
//     const plateOperations = await Promise.all(
//       plateDetections.map(async (detection) => {
//         const boxWidth = detection.x2 - detection.x1;
//         const boxHeight = detection.y2 - detection.y1;
//     // Create composite operations for masking plates
//     const plateOperations = await Promise.all(
//       plateDetections.map(async (detection) => {
//         const boxWidth = detection.x2 - detection.x1;
//         const boxHeight = detection.y2 - detection.y1;

//         if (processedLogo) {
//           try {
//             const logoWidth = Math.round(boxWidth * (logoSettings.size || 100) / 100);
//             const logoHeight = Math.round(boxHeight * (logoSettings.size || 100) / 100);
//         if (processedLogo) {
//           try {
//             const logoWidth = Math.round(boxWidth * (logoSettings.size || 100) / 100);
//             const logoHeight = Math.round(boxHeight * (logoSettings.size || 100) / 100);

//             const resizedLogo = await sharp(processedLogo)
//               .resize(logoWidth, logoHeight, {
//                 fit: 'contain',
//                 background: { r: 0, g: 0, b: 0, alpha: 0 }
//               })
//               .toBuffer();
//             const resizedLogo = await sharp(processedLogo)
//               .resize(logoWidth, logoHeight, {
//                 fit: 'contain',
//                 background: { r: 0, g: 0, b: 0, alpha: 0 }
//               })
//               .toBuffer();

//             // Calculate position based on logoSettings
//             let left = detection.x1;
//             let top = detection.y1;
//             // Calculate position based on logoSettings
//             let left = detection.x1;
//             let top = detection.y1;
            
//             switch (logoSettings.position) {
//               case 'top-right':
//                 left = detection.x2 - logoWidth;
//                 break;
//               case 'bottom-left':
//                 top = detection.y2 - logoHeight;
//                 break;
//               case 'bottom-right':
//                 left = detection.x2 - logoWidth;
//                 top = detection.y2 - logoHeight;
//                 break;
//               case 'center':
//               default:
//                 left = detection.x1 + Math.round((boxWidth - logoWidth) / 2);
//                 top = detection.y1 + Math.round((boxHeight - logoHeight) / 2);
//                 break;
//             }
//             switch (logoSettings.position) {
//               case 'top-right':
//                 left = detection.x2 - logoWidth;
//                 break;
//               case 'bottom-left':
//                 top = detection.y2 - logoHeight;
//                 break;
//               case 'bottom-right':
//                 left = detection.x2 - logoWidth;
//                 top = detection.y2 - logoHeight;
//                 break;
//               case 'center':
//               default:
//                 left = detection.x1 + Math.round((boxWidth - logoWidth) / 2);
//                 top = detection.y1 + Math.round((boxHeight - logoHeight) / 2);
//                 break;
//             }

//             // Create a white background with the logo
//             const logoWithBackground = await sharp({
//               create: {
//                 width: logoWidth,
//                 height: logoHeight,
//                 channels: 4,
//                 background: { r: 255, g: 255, b: 255, alpha: 1 }
//               }
//             })
//             .composite([{
//               input: resizedLogo,
//               blend: 'over' as Blend
//             }])
//             .toBuffer();
//             // Create a white background with the logo
//             const logoWithBackground = await sharp({
//               create: {
//                 width: logoWidth,
//                 height: logoHeight,
//                 channels: 4,
//                 background: { r: 255, g: 255, b: 255, alpha: 1 }
//               }
//             })
//             .composite([{
//               input: resizedLogo,
//               blend: 'over' as Blend
//             }])
//             .toBuffer();

//             return [{
//               input: logoWithBackground,
//               top: Math.round(top),
//               left: Math.round(left)
//             }];
//           } catch (error) {
//             console.error('Error applying logo:', error);
//             return await createBlurredRegion(detection.x1, detection.y1, boxWidth, boxHeight, imageBuffer, logoSettings);
//           }
//         }
//             return [{
//               input: logoWithBackground,
//               top: Math.round(top),
//               left: Math.round(left)
//             }];
//           } catch (error) {
//             console.error('Error applying logo:', error);
//             return await createBlurredRegion(detection.x1, detection.y1, boxWidth, boxHeight, imageBuffer, logoSettings);
//           }
//         }

//         return await createBlurredRegion(detection.x1, detection.y1, boxWidth, boxHeight, imageBuffer, logoSettings);
//       })
//     );
//         return await createBlurredRegion(detection.x1, detection.y1, boxWidth, boxHeight, imageBuffer, logoSettings);
//       })
//     );

//     // Create face blur operations
//     const faceOperations = await Promise.all(
//       faceDetections.map(async (detection) => {
//         const boxWidth = detection.x2 - detection.x1;
//         const boxHeight = detection.y2 - detection.y1;
//         return await createBlurredRegion(
//           detection.x1,
//           detection.y1,
//           boxWidth,
//           boxHeight,
//           imageBuffer,
//           { ...logoSettings, maskType: 'blur', blur: { radius: 30, opacity: 1 } },
//           true // Enable rounded mask for faces
//         );
//       })
//     );
//     // Create face blur operations
//     const faceOperations = await Promise.all(
//       faceDetections.map(async (detection) => {
//         const boxWidth = detection.x2 - detection.x1;
//         const boxHeight = detection.y2 - detection.y1;
//         return await createBlurredRegion(
//           detection.x1,
//           detection.y1,
//           boxWidth,
//           boxHeight,
//           imageBuffer,
//           { ...logoSettings, maskType: 'blur', blur: { radius: 30, opacity: 1 } },
//           true // Enable rounded mask for faces
//         );
//       })
//     );

//     // Filter out empty operations and combine plate and face operations
//     const validOperations = [...plateOperations.flat(), ...faceOperations.flat()].filter(op => op);
//     // Filter out empty operations and combine plate and face operations
//     const validOperations = [...plateOperations.flat(), ...faceOperations.flat()].filter(op => op);

//     // Create final image with masks
//     processedImage = await sharp(processedImage)
//       .composite(validOperations)
//       .toBuffer();
//     // Create final image with masks
//     processedImage = await sharp(processedImage)
//       .composite(validOperations)
//       .toBuffer();
      
//     if (watermarkSettings?.text) {
//       console.log('Adding watermark to processed image');
//       processedImage = await addWatermark(processedImage, watermarkSettings);
//     }
//     if (watermarkSettings?.text) {
//       console.log('Adding watermark to processed image');
//       processedImage = await addWatermark(processedImage, watermarkSettings);
//     }

//     // Create thumbnail
//     const thumbnail = await sharp(processedImage)
//       .resize(320, 240, {
//         fit: 'contain',
//         background: { r: 0, g: 0, b: 0, alpha: 0 }
//       })
//       .toBuffer();
//     // Create thumbnail
//     const thumbnail = await sharp(processedImage)
//       .resize(320, 240, {
//         fit: 'contain',
//         background: { r: 0, g: 0, b: 0, alpha: 0 }
//       })
//       .toBuffer();

//     return {
//       processedImage,
//       thumbnail,
//       detectedPlates: plateDetections.length,
//       detectedFaces: faceDetections.length,
//       detectedCars
//     };
//     return {
//       processedImage,
//       thumbnail,
//       detectedPlates: plateDetections.length,
//       detectedFaces: faceDetections.length,
//       detectedCars
//     };

//   } catch (error) {
//     console.error('Processing error:', error);
//     return {
//       processedImage: imageBuffer,
//       thumbnail: imageBuffer,
//       detectedPlates: 0,
//       detectedFaces: 0,
//       detectedCars: 0,
//       error: error as Error
//     };
//   } finally {
//     // tf.engine().endScope();
//   }
// }
//   } catch (error) {
//     console.error('Processing error:', error);
//     return {
//       processedImage: imageBuffer,
//       thumbnail: imageBuffer,
//       detectedPlates: 0,
//       detectedFaces: 0,
//       detectedCars: 0,
//       error: error as Error
//     };
//   } finally {
//     // tf.engine().endScope();
//   }
// }

async function createBlurredRegion(
  x1: number, 
  y1: number, 
  width: number, 
  height: number,
  imageBuffer: Buffer,
  settings: LogoSettings,
  isRounded: boolean = false
) {
  if (width <= 0 || height <= 0) return [];

  try {
    const maskType = settings?.maskType || 'blur';
    const opacity = settings?.blur?.opacity ?? 1;

    if (maskType === 'solid') {
      const solidMask = await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: Math.round(opacity * 255) }
        }
      })
      .composite(isRounded ? [{
        input: await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 255 }
          }
        })
        .composite([{
          input: Buffer.from(`<svg><ellipse cx="${width/2}" cy="${height/2}" rx="${width/2}" ry="${height/2}" /></svg>`),
          blend: 'dest-in' as Blend
        }])
        .toBuffer(),
        blend: 'dest-in' as Blend
      }] : [])
      .toBuffer();

      return [{
        input: solidMask,
        blend: 'over' as Blend,
        top: Math.round(y1),
        left: Math.round(x1)
      }];
    }

    // Default blur mask
    const blurRadius = settings?.blur?.radius ?? 30;
    const extractedRegion = await sharp(imageBuffer)
      .extract({
        left: x1,
        top: y1,
        width: width,
        height: height
      })
      .blur(blurRadius)
      .ensureAlpha(opacity)
      .composite(isRounded ? [{
        input: Buffer.from(`<svg><ellipse cx="${width/2}" cy="${height/2}" rx="${width/2}" ry="${height/2}" /></svg>`),
        blend: 'dest-in' as Blend
      }] : [])
      .toBuffer();

    return [{
      input: extractedRegion,
      blend: 'over' as Blend,
      top: Math.round(y1),
      left: Math.round(x1)
    }];
  } catch (error) {
    console.error('Error creating masked region:', error);
    return [];
  }
}

async function applyLogo(
  imageBuffer: Buffer,
  logoBuffer: Buffer,
  settings: any
): Promise<Buffer> {
  const { width, height } = await sharp(imageBuffer).metadata();
  const logoSize = Math.min(width!, height!) / 4;

  const resizedLogo = await sharp(logoBuffer)
    .resize(Math.round(logoSize), Math.round(logoSize), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  return await sharp(imageBuffer)
    .composite([{
      input: resizedLogo,
      gravity: 'southeast',
      blend: 'over'
    }])
    .toBuffer();
} 