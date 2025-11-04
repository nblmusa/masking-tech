import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MaskingTech - AI License Plate Masking & Background Replacement for Car Dealerships',
  description: 'MaskingTech helps car dealerships and marketplaces create stunning studio-grade visuals with AI-powered license plate masking, face blurring, and background replacement.',
  alternates: {
    canonical: 'https://maskingtech.com',
  },
  openGraph: {
    title: 'MaskingTech - AI License Plate Masking & Background Replacement',
    description: 'Transform your vehicle photos with AI-powered license plate masking, face blurring, and background replacement. Perfect for car dealerships and marketplaces.',
    url: 'https://maskingtech.com',
    siteName: 'MaskingTech',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MaskingTech - AI License Plate Masking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaskingTech - AI License Plate Masking & Background Replacement',
    description: 'Transform your vehicle photos with AI-powered license plate masking, face blurring, and background replacement.',
    images: ['/images/og-image.jpg'],
  },
  keywords: [
    'license plate masking',
    'car dealership photography',
    'AI image processing',
    'vehicle photo privacy',
    'background replacement',
    'face blurring',
    'automotive photography',
    'car marketplace tools',
    'GDPR compliant car photos',
    'privacy protection',
    'Car background removal',
    'Car background replacement',
    'Car plate masking',
    'Number plate masking',
    'face blur',
  ]
}
