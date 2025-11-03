import { NextResponse } from 'next/server'
import { blogPosts } from '../../blog/page'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    
    // Define static routes
    const staticRoutes = [
      { path: '', changefreq: 'weekly', priority: '1.0' },
      { path: '/about', changefreq: 'monthly', priority: '0.8' },
      { path: '/pricing', changefreq: 'monthly', priority: '0.9' },
      { path: '/blog', changefreq: 'weekly', priority: '0.8' },
      { path: '/contact', changefreq: 'monthly', priority: '0.7' },
      { path: '/docs', changefreq: 'monthly', priority: '0.7' },
      { path: '/login', changefreq: 'monthly', priority: '0.6' },
      { path: '/signup', changefreq: 'monthly', priority: '0.6' },
      { path: '/terms', changefreq: 'yearly', priority: '0.5' },
      { path: '/privacy', changefreq: 'yearly', priority: '0.5' },
    ]
    
    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    // Add static routes
    staticRoutes.forEach(route => {
      xml += '  <url>\n'
      xml += `    <loc>https://maskingtech.com${route.path}</loc>\n`
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`
      xml += `    <priority>${route.priority}</priority>\n`
      xml += '  </url>\n'
    })
    
    // Add blog posts
    if (blogPosts) {
      blogPosts.forEach(post => {
        xml += '  <url>\n'
        xml += `    <loc>https://maskingtech.com/blog/${post.slug}</loc>\n`
        xml += `    <lastmod>${new Date(post.date).toISOString()}</lastmod>\n`
        xml += '    <changefreq>monthly</changefreq>\n'
        xml += `    <priority>${post.featured ? '0.7' : '0.6'}</priority>\n`
        xml += '  </url>\n'
      })
    }
    
    xml += '</urlset>'
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
