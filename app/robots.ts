import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/settings/',
        '/upload/',
        '/404', // Explicitly disallow 404 page
      ],
    },
    sitemap: 'https://maskingtech.com/sitemap.xml',
  }
}
