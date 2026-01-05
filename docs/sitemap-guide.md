# MaskingTech Sitemap Guide

This document explains how the sitemap system works for the MaskingTech website.

## Overview

The sitemap system consists of several components:

1. **Static Sitemap File**: `/public/sitemap.xml` - A static XML file that search engines can access directly.
2. **Dynamic Sitemap Generator**: `/app/sitemap.ts` - A Next.js API route that generates the sitemap dynamically during build time.
3. **API Endpoint**: `/app/api/sitemap/route.ts` - A dynamic API endpoint that generates the sitemap on-demand.
4. **Robots.txt**: `/public/robots.txt` - Directs search engines to the sitemap and sets crawling rules.
5. **Search Engine Ping Utility**: `/utils/ping-search-engines.js` - Notifies search engines when the sitemap is updated.

## How It Works

### Static Files

- `/public/sitemap.xml` - This is a static file that is served directly from the public directory. It's generated during the build process.
- `/public/robots.txt` - This file tells search engines which pages to crawl and where to find the sitemap.

### Dynamic Generation

- `/app/sitemap.ts` - This file uses Next.js's built-in sitemap generation feature to create a sitemap during build time. It includes all static routes and blog posts.
- `/app/api/sitemap/route.ts` - This API endpoint generates the sitemap dynamically when requested. It's useful for on-demand sitemap generation.

### Search Engine Notification

- `/utils/ping-search-engines.js` - This utility script notifies search engines (Google, Bing) when the sitemap is updated. It's run automatically after each build.

## Usage

### Adding New Pages

When adding new static pages to the website:

1. Add the route to the `routes` array in `/app/sitemap.ts`
2. Add the route to the `staticRoutes` array in `/app/api/sitemap/route.ts`

### Adding Blog Posts

Blog posts are automatically included in the sitemap from the `blogPosts` array in `/app/blog/page.tsx`.

### Manual Sitemap Update

To manually update the sitemap and notify search engines:

```bash
# Build the site (includes sitemap generation)
npm run build

# Or just ping search engines
npm run ping-search-engines
```

## SEO Best Practices

1. **Keep the sitemap updated**: Ensure all important pages are included in the sitemap.
2. **Set appropriate priorities**: Home page should have the highest priority (1.0), with other pages having lower priorities based on importance.
3. **Set appropriate change frequencies**: Update frequencies should reflect how often content changes.
4. **Include lastmod dates**: Always include the last modified date for each URL.
5. **Exclude non-indexable pages**: Don't include pages that have `noindex` meta tags or are authentication-protected.

## Troubleshooting

If search engines are not indexing your pages:

1. Check that the sitemap is accessible at `https://maskingtech.com/sitemap.xml`
2. Verify that robots.txt is correctly pointing to the sitemap
3. Submit the sitemap manually in Google Search Console and Bing Webmaster Tools
4. Check for any crawl errors in the search engine webmaster tools
