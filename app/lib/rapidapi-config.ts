// RapidAPI Car Background Removal Configuration
export const RAPIDAPI_CONFIG = {
  // API Configuration
  BASE_URL: 'https://cars-image-background-removal.p.rapidapi.com/v1/results',
  API_KEY_ENV: '3d5f07249cmsh2cd87820fab0000p1faa51jsn6ae4921da2ba',
  API_HOST: 'cars-image-background-removal.p.rapidapi.com',

  // Default settings
  DEFAULT_OPTIONS: {
    mode: 'fg-image-shadow', // Extract foreground image with shadow
    refinementLevel: 'balanced',
    keepShadows: true,
    backgroundColor: null,
    licensePlateBlurring: true,
    shadowEffect: true,
  },

  // Processing options
  MODES: ['fg-image', 'fg-image-shadow'] as const,
  REFINEMENT_LEVELS: ['fast', 'balanced', 'detailed'] as const,

  // Image constraints
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png'],

  // Error codes
  ERROR_CODES: {
    API_KEY_MISSING: 'RAPIDAPI_KEY_MISSING',
    INVALID_IMAGE: 'INVALID_IMAGE',
    INVALID_FORMAT: 'INVALID_FORMAT',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    NETWORK_ERROR: 'NETWORK_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    PROCESSING_ERROR: 'PROCESSING_ERROR',
  },

  // Status codes
  STATUS_CODES: {
    SUCCESS: 200,
    ERROR: 400,
    UNAUTHORIZED: 401,
    RATE_LIMIT_EXCEEDED: 429,
  },
} as const;

// Helper functions
export function validateImageFormat(mimeType: string): boolean {
  return RAPIDAPI_CONFIG.SUPPORTED_FORMATS.includes(mimeType);
}

export function validateImageSize(size: number): boolean {
  return size <= RAPIDAPI_CONFIG.MAX_IMAGE_SIZE;
}

export function getAPIKey(): string | null {
  return process.env[RAPIDAPI_CONFIG.API_KEY_ENV] || null;
}

export function isConfigured(): boolean {
  return !!getAPIKey();
}

// Type definitions
export type Mode = typeof RAPIDAPI_CONFIG.MODES[number];
export type RefinementLevel = typeof RAPIDAPI_CONFIG.REFINEMENT_LEVELS[number];

export interface RapidAPISettings {
  mode?: Mode;
  refinementLevel: RefinementLevel;
  keepShadows: boolean;
  backgroundColor: string | null;
  licensePlateBlurring: boolean;
  shadowEffect: boolean;
  backgroundImage?: Buffer | string; // Can be either a Buffer or a URL string
}

export interface RapidAPIResponse {
  success: boolean;
  message?: string;
  result?: {
    image: string;
  };
  error?: {
    code: number;
    message: string;
  };
}