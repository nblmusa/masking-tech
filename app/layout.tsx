import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SettingsProvider } from "@/contexts/settings-context"
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { PageViewTracker } from '@/components/PageViewTracker'
import ConditionalLayout from '@/components/conditional-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MaskingTech - License Plate Masking Service',
  description: 'Professional license plate detection and masking service',
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
      </body>
    </html>
  )
}