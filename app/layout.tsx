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
  title: 'Masking Tech: AI Photography and Editing for Car Dealerships & Marketplaces',
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
  },
  manifest: '/site.webmanifest',
  themeColor: '#020817',
  viewport: 'width=device-width, initial-scale=1.0',
  openGraph: {
    title: 'Masking Tech: AI Photography and Editing for Car Dealerships & Marketplaces',
    description: 'Masking Tech helps car dealerships and marketplaces create stunning studio grade visuals that captures and converts every lead.',
    url: 'https://maskingtech.com',
    siteName: 'Masking Tech', 
    locale: 'en_US',
    type: 'website',
  },
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
        <Script id="website-schema" type="application/ld+json">{
          JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "WebSite",
            "name": "Masking Tech",
            "url": "https://maskingtech.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://maskingtech.com/catalogsearch/result?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }</Script>
        <Script id="organization-schema" type="application/ld+json">{
          JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Organization",
            "name": "Masking Tech",
            "url": "https://maskingtech.com",
            "logo": "https://maskingtech.com/logo.png",
            "image": "https://maskingtech.com/logo.png",
            "description": "Masking Tech: Masking Tech helps car dealerships and marketplaces create stunning studio grade visuals that captures and converts every lead.",
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
            "makesOffer": ["Turn raw car photos into showroom-ready visuals with MaskingTech’s smart AI tools."],
            "founder": "",
            "foundingDate": "June 13, 2025",
            "foundingLocation": "United Arab Emirates",
            "sameAs": ["https://www.linkedin.com/company/maskingtech-com/"]
          })
        }</Script>
      </body>
    </html>
  )
}