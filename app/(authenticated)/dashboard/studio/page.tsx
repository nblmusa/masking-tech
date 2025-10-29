"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Image as ImageIcon, Download, Upload, Loader2, Shield, ShieldX } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { useDropzone } from "react-dropzone"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useDashboard } from "@/hooks/use-dashboard"

interface EditorState {
  detectionTypes: {
    faces: boolean
    licensePlates: boolean
    dentsAndScratches: boolean
  }
  detectionResults: {
    dentCount: number
    scratchCount: number
  }
  maskingStyle: 'blur' | 'solid' | 'logo'
  blurRadius: number
  blurOpacity: number
  solidColor: string
  solidOpacity: number
  logo: {
    enabled: boolean
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
    url: string
  }
  watermark: {
    enabled: boolean
    text: string
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
    size: number
    opacity: number
    color: string
  }

  backgroundReplacement: {
    template: 'office' | 'nature' | 'urban' | 'transparent' | null | 'bg-7' | 'bg-8' | 'bg-9'
    customImage: string | null,
    templateImage: string | null
  }
  preview: {
    showDetectionAreas: boolean
  }
}

export default function StudioPage() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [editorState, setEditorState] = useState<EditorState>({
    detectionTypes: {
      faces: true,
      licensePlates: true,
      dentsAndScratches: true
    },
    detectionResults: {
      dentCount: 0,
      scratchCount: 0
    },
    maskingStyle: 'blur',
    blurRadius: 20,
    blurOpacity: 100,
    solidColor: '#000000',
    solidOpacity: 100,
    logo: {
      enabled: false,
      position: 'center',
      url: ''
    },
    watermark: {
      enabled: false,
      text: '',
      position: 'bottomRight',
      size: 20,
      opacity: 70,
      color: '#ffffff'
    },

    backgroundReplacement: {
      template: null,
      customImage: null,
      templateImage: null
    },
    preview: {
      showDetectionAreas: true
    }
  })
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const { toast } = useToast()
    const {
      stats,
    } = useDashboard()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setImage(result)
        // Reset editor state when new image is loaded
        setEditorState({
          detectionTypes: {
            faces: true,
            licensePlates: true,
            dentsAndScratches: true
          },
          detectionResults: {
            dentCount: 0,
            scratchCount: 0
          },
          maskingStyle: 'blur',
          blurRadius: 20,
          blurOpacity: 100,
          solidColor: '#000000',
          solidOpacity: 100,
          logo: {
            enabled: false,
            position: 'center',
            url: ''
          },
          watermark: {
            enabled: false,
            text: 'MaskingTech.com',
            position: 'bottomRight',
            size: 14,
            opacity: 70,
            color: '#ffffff'
          },

          backgroundReplacement: {
            template: null,
            customImage: null,
            templateImage: null
          },
          preview: {
            showDetectionAreas: true
          }
        })
      }
    }
    reader.readAsDataURL(file)
  }, [toast])


  useEffect(() => {
    if(stats.monthlyQuota && (stats.imagesProcessed >= stats.monthlyQuota)) {
      setQuotaExceeded(true)
    }
  }, [stats])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const handleProcess = async () => {
    if (!image) return

    setIsProcessing(true)
    try {
      // Extract base64 and content type
      const [header, base64Data] = image.split(',')
      const contentType = header.split(';')[0].split(':')[1]

      // Prepare request body with simplified settings
      const requestBody = {
        image: base64Data,
        backgroundImage: editorState.backgroundReplacement.customImage ? editorState.backgroundReplacement.customImage?.split(',')[1] : editorState.backgroundReplacement.templateImage?.split(',')[1],
        contentType,
        detectionSettings: {
          blurFaces: editorState.detectionTypes.faces,
          blurLicensePlates: editorState.detectionTypes.licensePlates,
          blurDentsAndScratches: editorState.detectionTypes.dentsAndScratches
        },
        logoSettings: editorState.maskingStyle === 'logo' ? {
          url: editorState.logo.url,
          position: editorState.logo.position
        } : null,
        watermarkSettings: editorState.watermark.enabled ? {
          text: editorState.watermark.text,
          position: editorState.watermark.position,
          size: editorState.watermark.size,
          opacity: editorState.watermark.opacity / 100,
          color: editorState.watermark.color
        } : null,
        backgroundReplacement: editorState.backgroundReplacement.template !== 'transparent' ? {
          template: editorState.backgroundReplacement.template,
          customImage: editorState.backgroundReplacement.customImage ? editorState.backgroundReplacement.customImage?.split(',')[1] : editorState.backgroundReplacement.templateImage?.split(',')[1]
        } : null
      }

      // Make API request
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process image')
      }

      const data = await response.json()
      
      // Check if we received a base64 string or a base64 string with data URI
      let processedImageData = data.maskedImage
      if (!processedImageData) {
        throw new Error('No masked image returned from API')
      }

      // If the response doesn't include the data URI prefix, add it
      if (!processedImageData.startsWith('data:')) {
        processedImageData = `data:${contentType};base64,${processedImageData}`
      }

      // Update the processed image with the result
      setProcessedImage(processedImageData)
      
      // Call the dent and scratch detection API if enabled
      if (editorState.detectionTypes.dentsAndScratches) {
        try {
          // Create a FormData object for the API call
          const formData = new FormData()
          
          // Convert base64 to a Blob
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: contentType })
          
          // Append the image file to the FormData
          formData.append('image', blob, 'image.jpg')
          formData.append('highlight', 'false')
          
          // Call the API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/detect-damage`, {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Failed to detect dents and scratches')
          }
          
          const result = await response.json()

          console.log('Dent and scratch detection result:', result)
          console.log('Dent Count', result?.dent_count)
          console.log('Scratch Count', result?.scratch_count)
          
          // Update the state with the detection results
          setEditorState(prev => ({
            ...prev,
            detectionResults: {
              dentCount: result?.dent_count,
              scratchCount: result?.scratch_count
            }
          }))
          
          console.log('Dent and scratch detection results:', result)
        } catch (error) {
          console.error('Error detecting dents and scratches:', error)
          // Fallback to default values if the API call fails
          setEditorState(prev => ({
            ...prev,
            detectionResults: {
              dentCount: 0,
              scratchCount: 0
            }
          }))
        }
      }
      
      const processingFeatures = [
        editorState.detectionTypes.faces && 'face detection',
        editorState.detectionTypes.licensePlates && 'license plate detection',
        editorState.detectionTypes.dentsAndScratches && 'dent and scratch detection',
        editorState.backgroundReplacement.template !== 'transparent' && 'background replacement'
      ].filter(Boolean)
      
      // toast({
      //   title: "Processing complete",
      //   description: `Successfully processed image with ${processingFeatures.join(' and ')}.`,
      // })

      // Log for debugging
      console.log('Processed image data:', processedImageData.substring(0, 100) + '...')
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!processedImage) return

    const link = document.createElement('a')
    link.href = processedImage
    link.download = 'processed-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your processed image is being downloaded.",
    })
  }

  const imagePreview = (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <Label className="text-lg font-semibold">
              {processedImage ? "Processed Image" : "Original Image"}
            </Label>
          </div>

        </div>
        <div className="flex items-center gap-2">
          {processedImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="hover:bg-muted/50 font-medium"
              title="Download processed image"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImage(null)
              setProcessedImage(null)
            }}
            className="hover:bg-destructive/10 hover:text-destructive font-medium"
            title="Clear current image"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="relative aspect-video bg-muted/50 rounded-xl overflow-hidden shadow-inner">
        {processedImage ? (
          <Image
            src={processedImage}
            alt="Processed"
            fill
            className="object-contain"
          />
        ) : (
          <>
            <Image
              src={image!}
              alt="Original"
              fill
              className="object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm text-white font-medium animate-pulse">
                    Processing image...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Studio Header */}
      <div className="bg-background/95 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
                <p className="text-sm text-muted-foreground">
                  Advanced image editing and privacy protection with background replacement
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column - Image Preview */}
            <div className="lg:col-span-8 space-y-8">
              {/* Image Upload/Preview Area */}
              <Card className="overflow-hidden border-2 shadow-sm hover:border-primary/50 transition-colors duration-200">
                {image ? imagePreview : (
                  <div
                    {...getRootProps()}
                    className={`aspect-video flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all
                      ${isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-1">Drop your image here</p>
                        <p className="text-sm text-muted-foreground">
                          or click to select a file
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Supports JPG, PNG and WebP
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Background Selection */}
              <Card className="p-6 border-2 shadow-sm">
                  <div className="space-y-6">
                    <div className="space-y-6">
                      {/* Background Selection */}
                      <div className="space-y-4">
                        <Label className="font-medium text-base">Choose Background</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            // { id: 'transparent', name: 'Transparent' },
                            { id: 'bg-7', name: 'Background 1' },
                            { id: 'bg-8', name: 'Background 2' },
                            { id: 'bg-9', name: 'Background 3' }
                          ].map((template) => (
                            <div
                              key={template.id}
                              className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${
                                editorState.backgroundReplacement.template === template.id
                                  ? `border-blue-400 ring-4 ring-blue-200/30 shadow-lg scale-105`
                                  : `border-muted/50 hover:border-blue-300 hover:scale-102 hover:shadow-md`
                              }`}
                              onClick={() => {
                                if (template.id === 'transparent') {
                                  setEditorState(prev => ({
                                    ...prev,
                                    backgroundReplacement: {
                                      ...prev.backgroundReplacement,
                                      template: template.id as 'transparent' | 'office' | 'nature' | 'urban',
                                      customImage: null,
                                      templateImage: null
                                    }
                                  }))
                                } else {
                                  // For non-transparent options, load the image as base64
                                  const loadImageAsBase64 = async () => {
                                    try {
                                      const response = await fetch(`/images/backgrounds/${template.id}.jpeg`)
                                      const blob = await response.blob()
                                      const reader = new FileReader()
                                      reader.onload = (e) => {
                                        const result = e.target?.result
                                        if (typeof result === 'string') {
                                          setEditorState(prev => ({
                                            ...prev,
                                            backgroundReplacement: {
                                              ...prev.backgroundReplacement,
                                              template: template.id as 'transparent' | 'office' | 'nature' | 'urban',
                                              customImage: null,
                                              templateImage: result
                                            }
                                          }))
                                        }
                                      }
                                      reader.readAsDataURL(blob)
                                    } catch (error) {
                                      console.error('Error loading background image:', error)
                                      // Fallback to just setting the template without the base64 image
                                      setEditorState(prev => ({
                                        ...prev,
                                        backgroundReplacement: {
                                          ...prev.backgroundReplacement,
                                          template: template.id as 'transparent' | 'office' | 'nature' | 'urban',
                                          customImage: null
                                        }
                                      }))
                                    }
                                  }
                                  
                                  loadImageAsBase64()
                                }
                              }}
                            >
                              {template.id === 'transparent' ? (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <div className="text-center space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Transparent</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <Image
                                    src={`/images/backgrounds/${template.id}.jpeg`}
                                    alt={`${template.id} background`}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end transition-opacity duration-200 ${
                                    editorState.backgroundReplacement.template === template.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                  }`}>
                                  </div>
                                </>
                              )}
                              {editorState.backgroundReplacement.template === template.id && (
                                <div className={`absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg`}>
                                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Image Upload */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium text-base">Or Upload Custom Background</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = (e) => {
                                    const result = e.target?.result
                                    if (typeof result === 'string') {
                                      setEditorState(prev => ({
                                        ...prev,
                                        backgroundReplacement: {
                                          ...prev.backgroundReplacement,
                                          customImage: result,
                                          template: null
                                        }
                                      }))
                                    }
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }
                              input.click()
                            }}
                            className="hover:shadow-sm transition-all duration-200"
                          >
                            Upload Image
                          </Button>
                        </div>
                        
                        {editorState.backgroundReplacement.customImage && (
                          <div className="relative aspect-video bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl overflow-hidden border border-muted/50">
                            <Image
                              src={editorState.backgroundReplacement.customImage}
                              alt="Custom background"
                              fill
                              className="object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setEditorState(prev => ({
                                ...prev,
                                backgroundReplacement: {
                                  ...prev.backgroundReplacement,
                                  customImage: null
                                }
                              }))}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 shadow-sm p-6">
              <div className="space-y-6">
                      {/* Detection Options */}
                      <div className="space-y-4">
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg border border-muted/200 bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${editorState.detectionTypes.faces ? 'bg-blue-100 text-blue-600' : 'bg-muted/100 text-muted-600'}`}>
                                <Shield className="h-4 w-4" />
                              </div>
                              <div>
                                <Label className="font-medium">Blur Faces</Label>
                                <p className="text-xs text-muted-foreground">Mask faces for privacy</p>
                              </div>
                            </div>
                            <Switch
                              checked={editorState.detectionTypes.faces}
                              onCheckedChange={(checked) => 
                                setEditorState(prev => ({
                                  ...prev,
                                  detectionTypes: { ...prev.detectionTypes, faces: checked }
                                }))
                              }
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg border border-muted/200 bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${editorState.detectionTypes.licensePlates ? 'bg-green-100 text-green-600' : 'bg-muted/100 text-muted-600'}`}>
                                <ImageIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <Label className="font-medium">Mask License Plates</Label>
                                <p className="text-xs text-muted-foreground">Choose blur or logo masking</p>
                              </div>
                            </div>
                            <Switch
                              checked={editorState.detectionTypes.licensePlates}
                              onCheckedChange={(checked) => 
                                setEditorState(prev => ({
                                  ...prev,
                                  detectionTypes: { ...prev.detectionTypes, licensePlates: checked }
                                }))
                              }
                              className="data-[state=checked]:bg-green-600"
                            />
                          </div>

                           
                          <div className="flex items-center justify-between p-3 rounded-lg border border-muted/200 bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${editorState.detectionTypes.dentsAndScratches ? 'bg-red-100 text-red-600' : 'bg-muted/100 text-muted-600'}`}>
                                <ShieldX className="h-4 w-4" />
                              </div>
                              <div>
                                <Label className="font-medium">Detect Dents and Scratches</Label>
                                <p className="text-xs text-muted-foreground">Detect and mask dents and scratches</p>
                              </div>
                            </div>
                            <Switch
                              checked={editorState.detectionTypes.dentsAndScratches}
                              onCheckedChange={(checked) => 
                                setEditorState(prev => ({
                                  ...prev,
                                  detectionTypes: { ...prev.detectionTypes, dentsAndScratches: checked }
                                }))
                              }
                              className="data-[state=checked]:bg-green-600"
                            />
                          </div>
                        </div>
                      </div>


                      <div>
                      {editorState.detectionTypes.dentsAndScratches && (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-muted/200">
                          <div className="flex items-center gap-3 mb-4">
                              <p className="text-sm text-muted-foreground">Detection Results for Dents and Scratches</p>
                          </div>
                          
                          {/* Detection Results */}
                          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg mb-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Dents:</span>
                                <span className="text-sm font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">{editorState.detectionResults.dentCount}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Scratches:</span>
                                <span className="text-sm font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{editorState.detectionResults.scratchCount}</span>
                              </div>
                            </div>
                          </div>
                          
                     

                      </div>
                      )}
                      </div>
                     



                          {/* License Plate Masking Style */}
                      {editorState.detectionTypes.licensePlates && (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-muted/200">
                          <div className="flex items-center gap-3 mb-4">
                              <p className="text-sm text-muted-foreground">Choose how to mask detected license plates</p>
                          </div>
                          
                          {/* Simple Style Selection */}
                          <div className="grid grid-cols-1 gap-3">
                            <button
                              onClick={() => setEditorState(prev => ({ ...prev, maskingStyle: 'blur' }))}
                              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                editorState.maskingStyle === 'blur'
                                  ? 'border-blue-500'
                                  : 'border-muted/200 bg-muted/20 hover:border-blue-300 hover:bg-blue-50/20'
                              }`}
                            >
                              <div className="text-center space-y-3">
                                <div className="space-y-1">
                                  <p className={`font-semibold text-sm transition-colors duration-300 ${
                                    editorState.maskingStyle === 'blur'
                                      ? 'text-blue-700'
                                      : 'text-foreground group-hover:text-blue-600'
                                  }`}>Blur</p>
                                </div>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => setEditorState(prev => ({ ...prev, maskingStyle: 'logo' }))}
                              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                editorState.maskingStyle === 'logo'
                                  ? 'border-blue-500'
                                  : 'border-muted/200 bg-muted/20 hover:border-blue-300 hover:bg-blue-50/20'
                              }`}
                            >
                              <div className="text-center space-y-4">
                                <div className="space-y-1">
                                  <p className={`font-semibold text-base transition-colors duration-300 ${
                                    editorState.maskingStyle === 'logo'
                                      ? 'text-blue-700'
                                      : 'text-foreground group-hover:text-blue-600'
                                  }`}>Custom Logo</p>
                                </div>
                              </div>
                            </button>
                          </div>



                          {/* Logo Options */}
                          {editorState.maskingStyle === 'logo' && (
                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                              <div className="space-y-3">
                                <Label className="font-medium">Upload Logo Image</Label>
                                <p className="text-xs text-muted-foreground">Upload an image to overlay on license plates</p>
                                
                                {!editorState.logo.url ? (
                                  <div className="border-2 border-dashed border-muted/300 rounded-lg p-6 text-center hover:border-muted/400 transition-colors">
                                    <div className="space-y-3">
                                      <div className="w-12 h-12 mx-auto bg-muted/100 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const input = document.createElement('input')
                                          input.type = 'file'
                                          input.accept = 'image/*'
                                          input.onchange = async (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0]
                                            if (file) {
                                              const reader = new FileReader()
                                              reader.onload = (e) => {
                                                const result = e.target?.result
                                                if (typeof result === 'string') {
                                                  setEditorState(prev => ({
                                                    ...prev,
                                                    logo: { ...prev.logo, url: result }
                                                  }))
                                                }
                                              }
                                              reader.readAsDataURL(file)
                                            }
                                          }
                                          input.click()
                                        }}
                                      >
                                        Choose File
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden border">
                                      <Image
                                        src={editorState.logo.url}
                                        alt="Logo preview"
                                        fill
                                        className="object-contain"
                                        onError={() => {
                                          toast({
                                            title: "Error loading logo",
                                            description: "Please upload a different image.",
                                            variant: "destructive",
                                          })
                                        }}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditorState(prev => ({
                                          ...prev,
                                          logo: { ...prev.logo, url: '' }
                                        }))}
                                      >
                                        Remove
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const input = document.createElement('input')
                                          input.type = 'file'
                                          input.accept = 'image/*'
                                          input.onchange = async (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0]
                                            if (file) {
                                              const reader = new FileReader()
                                              reader.onload = (e) => {
                                                const result = e.target?.result
                                                if (typeof result === 'string') {
                                                  setEditorState(prev => ({
                                                    ...prev,
                                                    logo: { ...prev.logo, url: result }
                                                  }))
                                                }
                                              }
                                              reader.readAsDataURL(file)
                                            }
                                          }
                                          input.click()
                                        }}
                                      >
                                        Change
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Simplified Watermark Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-muted/200 bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${editorState.watermark.enabled ? 'bg-purple-100 text-purple-600' : 'bg-muted/100 text-muted-600'}`}>
                              <ImageIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <Label className="font-medium">Add Watermark</Label>
                              <p className="text-xs text-muted-foreground">Add text watermark to your image</p>
                            </div>
                          </div>
                          <Switch
                            checked={editorState.watermark.enabled}
                            onCheckedChange={(checked) => setEditorState(prev => ({
                              ...prev,
                              watermark: { ...prev.watermark, enabled: checked }
                            }))}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>

                        {editorState.watermark.enabled && (
                          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-muted/200">
                            <div className="space-y-3">
                              <Label className="font-medium">Watermark Text</Label>
                              <Input
                                value={editorState.watermark.text}
                                onChange={(e) => setEditorState(prev => ({
                                  ...prev,
                                  watermark: { ...prev.watermark, text: e.target.value }
                                }))}
                                placeholder="Enter watermark text"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label className="font-medium">Position</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'].map((position) => (
                                  <Button
                                    key={position}
                                    variant={editorState.watermark.position === position ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setEditorState(prev => ({
                                      ...prev,
                                      watermark: { ...prev.watermark, position: position as any }
                                    }))}
                                  >
                                    {position === 'topLeft' ? 'Top L' :
                                     position === 'topRight' ? 'Top R' :
                                     position === 'center' ? 'Center' :
                                     position === 'bottomLeft' ? 'Bottom L' :
                                     'Bottom R'}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                           </div>
                  </Card>

                  {/* Process Buttons */}
                  <Card className="border-2 shadow-sm p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Process Image</h3>
                          <p className="text-sm text-muted-foreground">Apply your settings and process the image</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <Button
                          size="lg"
                          onClick={handleProcess}
                          disabled={!image || isProcessing || !editorState.backgroundReplacement.template || quotaExceeded}
                          className="bg-primary hover:bg-primary/90 font-medium"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Process Image
                            </>
                          )}
                        </Button>
                        
                        {quotaExceeded && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center">
                            <ShieldX className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>Monthly quota exceeded. Please upgrade your plan to process more images.</span>
                          </div>
                        )}
                        
                        {processedImage && (
                          <Button
                            size="lg"
                            onClick={handleDownload}
                            disabled={!processedImage}
                            className="bg-green-600 hover:bg-green-700 font-medium"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Result
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

  )
}