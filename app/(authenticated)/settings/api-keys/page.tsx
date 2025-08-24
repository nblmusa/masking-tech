"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2, Plus, AlertTriangle, BookOpen, Code, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CustomAlertDialog } from "@/components/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApiKey {
  id: string
  name: string
  key: string
  is_active: boolean
  created_at: string
  expires_at?: string
  last_used?: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/api-key')
      const data = await response.json()
      
      if (response.ok && data.apiKeys) {
        setApiKeys(data.apiKeys)
        // Initialize showKeys state for each key
        const initialShowKeys: { [key: string]: boolean } = {}
        data.apiKeys.forEach((key: ApiKey) => {
          initialShowKeys[key.id] = false
        })
        setShowKeys(initialShowKeys)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateNewApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)
      const response = await fetch('/api/dashboard/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName.trim() })
      })
      
      const data = await response.json()
      if (response.ok && data.apiKey) {
        toast({
          title: "Success",
          description: "New API key generated successfully. Make sure to copy it now - you won't be able to see it again."
        })
        setNewKeyName("")
        setShowCreateForm(false)
        fetchApiKeys() // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to generate API key')
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      toast({
        title: "Error",
        description: "Failed to generate new API key",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      setIsRevoking(keyId)
      const response = await fetch(`/api/dashboard/api-key`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "API key has been revoked successfully"
        })
        fetchApiKeys() // Refresh the list
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to revoke API key')
      }
    } catch (error) {
      console.error('Error revoking API key:', error)
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive"
      })
    } finally {
      setIsRevoking(null)
    }
  }

  const copyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      toast({
        title: "Success",
        description: "API key copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy API key",
        variant: "destructive"
      })
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your active API keys for programmatic access to the license plate masking service
          </p>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your active API keys for programmatic access to the license plate masking service
        </p>
      </div>

      {/* Quick Reference Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Quick Reference</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-muted-foreground">Authentication</div>
              <div className="font-mono bg-muted/50 p-2 rounded text-xs">
                Authorization: Bearer YOUR_API_KEY
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-muted-foreground">Base URL</div>
              <div className="font-mono bg-muted/50 p-2 rounded text-xs">
                https://api.maskingtech.com
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-muted-foreground">Rate Limit</div>
              <div className="font-mono bg-muted/50 p-2 rounded text-xs">
                100 requests/hour
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-muted-foreground">Response Format</div>
              <div className="font-mono bg-muted/50 p-2 rounded text-xs">
                JSON
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Create New API Key Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Create New API Key</h2>
              <p className="text-sm text-muted-foreground">
                Generate a new API key for your applications
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : <Plus className="h-4 w-4 mr-2" />}
              {showCreateForm ? "Cancel" : "New API Key"}
            </Button>
          </div>

          {showCreateForm && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">API Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production App, Development"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={generateNewApiKey}
                disabled={isGenerating || !newKeyName.trim()}
                className="w-full md:w-auto"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Generate API Key
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Active API Keys Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Active API Keys</h2>
          </div>
          
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No active API keys</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first API key to get started with programmatic access
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                        {apiKey.expires_at && ` • Expires ${new Date(apiKey.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">API Key</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-sm bg-muted/50 p-2 rounded">
                        {showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyApiKey(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {apiKey.last_used ? (
                          `Last used: ${new Date(apiKey.last_used).toLocaleDateString()}`
                        ) : (
                          'Never used'
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isRevoking === apiKey.id}
                        onClick={() => setShowRevokeDialog(apiKey.id)}
                      >
                        {isRevoking === apiKey.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {isRevoking === apiKey.id ? 'Revoking...' : 'Revoke'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* API Usage Examples Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">API Usage Examples</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Use your API key to authenticate requests to our license plate masking service:
            </p>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
              <div className="text-muted-foreground mb-2"># Process an image with license plate masking</div>
              <div className="space-y-1">
                <div>curl -X POST https://api.maskingtech.com/process-image \</div>
                <div className="ml-4">-H "Authorization: Bearer YOUR_API_KEY" \</div>
                <div className="ml-4">-F "image=@photo.jpg" \</div>
                <div className="ml-4">-F "detection_types=license_plates"</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/docs" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Full API Documentation
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/docs#authentication" target="_blank" rel="noopener noreferrer">
                  Authentication Guide
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Notice Section */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Keep your API keys secure and never share them publicly. 
          If you suspect a key has been compromised, revoke it immediately and generate a new one.
        </AlertDescription>
      </Alert>

      {/* Revoke Confirmation Dialog */}
      {showRevokeDialog && (
        <CustomAlertDialog
          isOpen={!!showRevokeDialog}
          onClose={() => setShowRevokeDialog(null)}
          onConfirm={() => {
            if (showRevokeDialog) {
              revokeApiKey(showRevokeDialog)
              setShowRevokeDialog(null)
            }
          }}
          title="Revoke API Key"
          description="This will permanently revoke your API key. Any applications or scripts using this key will stop working immediately. Are you sure you want to continue?"
          confirmText="Revoke Key"
          variant="danger"
        />
      )}
    </div>
  )
}
