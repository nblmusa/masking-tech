import React from 'react';

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function LegalSection({ title, children, icon }: LegalSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary mb-4">
        {icon && icon}
        <h2 className="text-xl font-semibold m-0">{title}</h2>
      </div>
      {children}
    </div>
  );
}

interface LegalContentProps {
  title: string;
  lastUpdated?: Date;
  children: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export default function LegalContent({ 
  title, 
  lastUpdated = new Date(), 
  children,
  backLink = {
    href: "/",
    label: "Back to Home"
  }
}: LegalContentProps) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          {backLink && (
            <div className="w-fit -ml-4 mb-2">
              <a 
                href={backLink.href}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground/70 hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                {backLink.label}
              </a>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {lastUpdated && (
              <p className="text-muted-foreground mt-2">
                Last updated: {lastUpdated.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="prose prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
