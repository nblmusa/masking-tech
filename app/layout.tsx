import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SettingsProvider } from "@/contexts/settings-context"
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { PageViewTracker } from '@/components/PageViewTracker'
import ConditionalLayout from '@/components/conditional-layout'
import  Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MaskingTech - AI Photography for Car Dealerships & Marketplaces',
  description: 'Masking Tech helps car dealerships and marketplaces create stunning studio grade visuals that captures and converts every lead.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#020817',
  viewport: 'width=device-width, initial-scale=1.0',
  metadataBase: new URL('https://maskingtech.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MaskingTech - AI Photography for Car Dealerships',
    description: 'Masking Tech helps car dealerships and marketplaces create stunning studio grade visuals that captures and converts every lead.',
    url: 'https://maskingtech.com',
    siteName: 'MaskingTech', 
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'MaskingTech Logo',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
  ],
  // verification: {
  //   google: 'google-site-verification-code', // Replace with your actual Google verification code
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                    localStorage.setItem('theme', 'dark');
                  }
                  document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
         <Script id="crisp-script" strategy="afterInteractive">
            {`
           window.$crisp=[];
              window.CRISP_WEBSITE_ID="8765563c-2e6d-4f6f-be6d-45d6f6947f2f";
              (function() {
                d=document;
                s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
        `}
          </Script>
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <PageViewTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SettingsProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
        <Script id="website-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "WebSite",
            "name": "MaskingTech",
            "url": "https://maskingtech.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://maskingtech.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>
        <Script id="organization-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Organization",
            "name": "MaskingTech",
            "url": "https://maskingtech.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://maskingtech.com/images/logo.png",
              "width": 512,
              "height": 512
            },
            "image": "https://maskingtech.com/images/logo.png",
            "description": "MaskingTech helps car dealerships and marketplaces create stunning studio grade visuals that captures and converts every lead.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Ras Al Khaimah",
              "addressCountry": "UAE",
              "postalCode": "00000",
              "streetAddress": "Compass Building, Al Hamra Industrial Zone-FZ"
            },
            "email": "info@maskingtech.com",
            "telephone": "00971558464853",
            "areaServed": "United Arab Emirates",
            "makesOffer": ["Turn raw car photos into showroom-ready visuals with MaskingTech's smart AI tools."],
            "founder": "Maged Mostafa",
            "foundingDate": "June 13, 2025",
            "foundingLocation": "United Arab Emirates",
            "sameAs": ["https://www.linkedin.com/company/maskingtech-com/"]
          })}
        </Script>
      </body>
    </html>
  )
}