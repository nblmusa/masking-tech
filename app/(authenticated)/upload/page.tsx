"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Upload Complete",
        description: "Your image has been uploaded successfully!",
      })
    }, 2000)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 from-blue-400 via-blue-300 to-blue-200">
            License Plate Masking
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your images and automatically detect and mask license plates for privacy protection
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
                        </div>
                        
                        <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Upload Image</h2>
                <p className="text-muted-foreground">
                  Drag and drop your image here, or click to browse
                      </p>
                    </div>

                    <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload">
                          <Button 
                    size="lg" 
                    className="w-full"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <>
                          <ImageIcon className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                          </>
                        ) : (
                          <>
                          <Upload className="h-5 w-5 mr-2" />
                          Choose Image
                          </>
                        )}
                          </span>
                        </Button>
                </label>
                
                      <p className="text-sm text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP • Max size: 10MB
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}