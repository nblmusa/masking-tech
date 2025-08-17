import { rapidApiService } from './rapidapi-service';

interface RemovalOptions {
  refinementLevel: 'fast' | 'balanced' | 'detailed';
  keepShadows: boolean;
  backgroundColor: string | null;
  licensePlateBlurring?: boolean;
  shadowEffect?: boolean;
}

export async function removeBackground(
  imageBuffer: Buffer,
  options: RemovalOptions
): Promise<Buffer> {
  
    try {
      return await rapidApiService.removeCarBackground(imageBuffer, {
        refinementLevel: options.refinementLevel,
        keepShadows: options.keepShadows,
        backgroundColor: options.backgroundColor,
        licensePlateBlurring: options.licensePlateBlurring || false,
        shadowEffect: options.shadowEffect || true,
      });
    } catch (error) {
      console.error('Background removal failed, falling back to local method:', error);
      return imageBuffer;
      // Fall back to local method
    }
}

function getRefinementLevel(level: RemovalOptions['refinementLevel']): string {
  switch (level) {
    case 'fast':
      return '1';
    case 'balanced':
      return '2';
    case 'detailed':
      return '3';
    default:
      return '2';
  }
} 