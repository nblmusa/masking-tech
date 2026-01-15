"use client"

import { usePathname } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Define which routes should show header and footer (public pages)
  const publicRoutes = [
    '/',
    '/about',
    '/pricing',
    '/contact',
    '/blog',
    '/docs',
    '/privacy',
    '/terms',
    '/login',
    '/signup',
    '/billing',
    '/guest/studio'
  ]
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/blog/') || pathname.startsWith('/docs/')
  )
  
  // For authenticated routes (dashboard, settings, upload), don't show header/footer
  if (!isPublicRoute) {
    return (
      <main className="flex-1 bg-gray-900">
        {children}
      </main>
    )
  }
  
  // For public routes, show header and footer
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-900">
        {children}
      </main>
      <Footer />
    </div>
  )
}
