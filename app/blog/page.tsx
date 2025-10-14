import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, Tag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  slug: string
  featured?: boolean
  image?: string
}


export const blogPosts: BlogPost[] = [
  {
    id: "why-masking-license-plates-matters-automotive-image-privacy-ai-tools",
    title: "Why Masking License Plates Matters | Automotive Image Privacy & AI Tools",
    excerpt: "Learn why blurring or masking license plates in car photos is essential for privacy, compliance, and customer trust — and how AI tools like MaskingTech automate it instantly.",
    date: "2025-10-12",
    readTime: "5 min read",
    category: "Privacy",
    slug: "why-masking-license-plates-matters-automotive-image-privacy-ai-tools",
    featured: true,
    image: "/images/blog/why-masking-license-plates-matters-automotive-image-privacy-ai-tools.jpeg"
  },
  {
    id: "how-to-replace-car-backgrounds-for-professional-results-ai-automotive-editing",
    title: "How to Replace Car Backgrounds for Professional Results | AI Automotive Editing",
    excerpt: "Learn how AI background removal transforms car photos into studio-quality shots in seconds. No Photoshop needed — just MaskingTech and a click.",
    date: "2025-10-12",
    readTime: "5 min read",
    category: "Privacy",
    slug: "how-to-replace-car-backgrounds-for-professional-results-ai-automotive-editing",
    featured: true,
    image: "/images/blog/how-to-replace-car-backgrounds-for-professional-results-ai-automotive-editing.jpeg"
  },
  {
    id: "before-after-how-ai-transforms-car-photos-automotive-image-enhancement",
    title: "Before & After: How AI Transforms Car Photos | Automotive Image Enhancement",
    excerpt: "Discover how AI can turn dull vehicle photos into studio-quality visuals with realistic lighting, shadows, and reflections — instantly with MaskingTech.",
    date: "2025-10-12",
    readTime: "5 min read",
    category: "Privacy",
    slug: "before-after-how-ai-transforms-car-photos-automotive-image-enhancement",
    featured: false,
    image: "/images/blog/before-after-how-ai-transforms-car-photos-automotive-image-enhancement.jpeg"
  },
  {
    id: "best-backgrounds-for-automotive-photography-ai-car-photo-backdrops",
    title: "Best Backgrounds for Automotive Photography | AI Car Photo Backdrops",
    excerpt: "Discover the best types of backgrounds for car photos and learn how to apply them automatically using AI tools like MaskingTech.",
    date: "2025-10-12",
    readTime: "5 min read",
    category: "Privacy",
    slug: "best-backgrounds-for-automotive-photography-ai-car-photo-backdrops",
    featured: false,
    image: "/images/blog/best-backgrounds-for-automotive-photography-ai-car-photo-backdrops.jpeg"
  },
];



export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const recentPosts = blogPosts.filter(post => !post.featured)

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 from-blue-400 via-blue-300 to-blue-200">
            MaskingTech Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights and updates on privacy technology, industry trends, and best practices
          </p>
        </div>

        {/* Featured Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative bg-white">
                <Image
                  src={post.image || ""}
                  alt={post.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-contain rounded-t-lg"
                  priority={true}
                  quality={90}
                  style={{
                    maxHeight: "450px",
                    maxWidth: "800px",
                  }}
                />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>{post.category}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  <div className="pt-2">
                    <Button variant="link" className="px-0" asChild>
                      <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                        Read More <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Recent Articles</h2>
          <div className="grid gap-6">
            {recentPosts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(post.date)}</span>
                    <span>•</span>
                    <Tag className="h-4 w-4" />
                    <span>{post.category}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  <div className="pt-2">
                    <Button variant="link" className="px-0" asChild>
                      <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                        Read More <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 