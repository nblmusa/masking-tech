import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Metadata } from 'next';

// In Next.js App Router, we can export metadata for the not-found page
export const metadata: Metadata = {
  title: 'Page Not Found - MaskingTech',
  description: 'The page you are looking for does not exist.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e1525] -mt-16">
      <div className="container max-w-md px-4 py-8 text-center">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tighter">404</h1>
            <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
            </p>
          </div>
          
          <div className="bg-[#111827] rounded-lg border border-gray-800 shadow-sm p-6">
            <div className="space-y-4">
              <p className="text-foreground text-sm">
                Here are some helpful links to get you back on track:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-white text-black hover:bg-gray-200 rounded-md">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <Button asChild className="bg-transparent border border-gray-700 hover:bg-gray-800 rounded-md text-white">
                  <Link href="/contact">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
