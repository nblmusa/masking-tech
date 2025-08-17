import { RAPIDAPI_CONFIG, RapidAPISettings, RapidAPIResponse, validateImageFormat, validateImageSize, getAPIKey } from './rapidapi-config';

interface RapidAPIOptions extends RapidAPISettings {}

export class RapidAPIService {
  private apiKey: string;
  private baseUrl: string;
  private apiHost: string;

  constructor() {
    this.apiKey = getAPIKey() || '3d5f07249cmsh2cd87820fab0000p1faa51jsn6ae4921da2ba';
    this.baseUrl = RAPIDAPI_CONFIG.BASE_URL;
    this.apiHost = RAPIDAPI_CONFIG.API_HOST;
  }

  async removeCarBackground(
    imageBuffer: Buffer,
    options: RapidAPIOptions
  ): Promise<Buffer> {
    try {
      if (!this.apiKey) {
        throw new Error('RapidAPI key not configured');
      }

      // Validate main image
      if (!validateImageSize(imageBuffer.length)) {
        throw new Error(`Image size exceeds maximum limit of ${RAPIDAPI_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
      }

      // Convert main image to base64
      // const base64Image = imageBuffer.toString('base64');
      // console.log('Base64 image:', base64Image);

      // Create URL-encoded form data
      const params = new URLSearchParams();
      params.append('image', imageBuffer.toString('base64'));

      // // Handle background image if provided
      // if (options.backgroundImage) {
      //   let backgroundImageData: string;
        
      //   if (typeof options.backgroundImage === 'string') {
      //     // If it's a URL, use it directly
      //     backgroundImageData = options.backgroundImage;
      //   } else {
      //     // If it's a Buffer, validate and convert to base64
      //     if (!validateImageSize(options.backgroundImage.length)) {
      //       throw new Error(`Background image size exceeds maximum limit of ${RAPIDAPI_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
      //     }
      //     backgroundImageData = options.backgroundImage.toString('base64');
      //   }
        
      //   params.append('image-bg', backgroundImageData);
      // }

      const response = await fetch(`${this.baseUrl}?mode=fg-image-shadow`, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as RapidAPIResponse;
      console.log('RapidAPI response:', result?.results?.[0]['status']);

      if (!result.success || !result.result?.image) {
        throw new Error(result.message || 'No results returned from RapidAPI');
      }

      const processedImageBase64 = result.result.image;
      const processedImageBuffer = Buffer.from(processedImageBase64, 'base64');

      return processedImageBuffer;

    } catch (error) {
      console.error('RapidAPI background removal error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  getServiceInfo() {
    return {
      available: this.isAvailable(),
      configured: !!this.apiKey,
      baseUrl: this.baseUrl,
      apiHost: this.apiHost
    };
  }
}

export const rapidApiService = new RapidAPIService();