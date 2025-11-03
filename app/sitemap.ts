import { MetadataRoute } from 'next'
import { blogPosts } from './blog/page'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://maskingtech.com'
  
  // Define public routes
  const routes = [
    { path: '', changeFreq: 'weekly', priority: 1.0 },
    { path: '/about', changeFreq: 'monthly', priority: 0.8 },
    { path: '/pricing', changeFreq: 'monthly', priority: 0.9 },
    { path: '/blog', changeFreq: 'weekly', priority: 0.8 },
    { path: '/contact', changeFreq: 'monthly', priority: 0.7 },
    { path: '/docs', changeFreq: 'monthly', priority: 0.7 },
    { path: '/login', changeFreq: 'monthly', priority: 0.6 },
    { path: '/signup', changeFreq: 'monthly', priority: 0.6 },
    { path: '/terms', changeFreq: 'yearly', priority: 0.5 },
    { path: '/privacy', changeFreq: 'yearly', priority: 0.5 },
  ]
  
  // Create sitemap entries for static routes
  const staticRoutes = routes.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq as 'weekly' | 'monthly' | 'yearly',
    priority: route.priority,
  }))
  
  // Create sitemap entries for blog posts
  const blogRoutes = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as 'monthly',
    priority: post.featured ? 0.7 : 0.6,
  }))
  
  return [...staticRoutes, ...blogRoutes]
}
