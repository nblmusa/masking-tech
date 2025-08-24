"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Eye, Download, Trash2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from 'date-fns'
import Image from "next/image"
import { useDashboard } from "@/hooks/use-dashboard"

interface ProcessedImage {
  id: string
  filename: string
  processed_at: string
  license_plates_detected: number
  thumbnail_url: string
  processed_url: string
  original_url?: string
}

export default function HistoryPage() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()
  const { recentActivity } = useDashboard()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const response = await fetch(`/api/dashboard/history?page=${pageNum}&limit=20`)
      const data = await response.json()
      
      if (response.ok && data.images) {
        if (append) {
          setImages(prev => [...prev, ...data.images])
        } else {
          setImages(data.images)
        }
        setHasMore(data.pagination?.hasMore || false)
        setTotalCount(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      toast({
        title: "Error",
        description: "Failed to load image history",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleImageClick = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      toast({
        title: "Download Started",
        description: "Your image is being downloaded",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download image",
        variant: "destructive"
      })
    }
  }

  const loadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchHistory(nextPage, true)
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Image History</h1>
              <p className="text-muted-foreground">View all your processed images</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <div className="aspect-square bg-muted rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Image History</h1>
            <p className="text-muted-foreground">
              {totalCount > 0 ? `Viewing ${images.length} of ${totalCount} processed images` : 'View all your processed images'}
            </p>
          </div>
          <Button onClick={() => fetchHistory()} variant="outline">
            Refresh
          </Button>
        </div>

        {images.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              Start processing images to see them here
            </p>
            <Button asChild>
              <a href="/upload">Upload Image</a>
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square relative bg-muted">
                    {image.thumbnail_url ? (
                      <Image
                        src={image.processed_url}
                        alt={image.filename}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleImageClick(image.processed_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(image.processed_url, image.filename)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium truncate mb-1">{image.filename}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(image.processed_at), { addSuffix: true })}</span>
                      <span>{image.license_plates_detected} plates</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={loadMore} 
                  disabled={isLoadingMore}
                  variant="outline"
                  className="px-8"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Images'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}