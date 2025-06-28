'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSupabase } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft,
  Copy,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  Download,
  ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface SrefCode {
  id: string
  code_value: string
  sv_version: number
  title: string
  copy_count: number
  upvotes: number
  downvotes: number
  save_count: number
  user_id: string
  created_at: string
  updated_at: string
  code_images: {
    id: string
    image_url: string
    position: number
  }[]
  code_tags: {
    id: string
    tag: string
  }[]
  users: {
    username: string
  }
}

export default function SrefCodeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [code, setCode] = useState<SrefCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const codeId = params.id as string

  useEffect(() => {
    if (codeId) {
      fetchCodeDetails()
    }
  }, [codeId])

  const fetchCodeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('sref_codes')
        .select(`
          *,
          code_images (id, image_url, position),
          code_tags (id, tag),
          users (username)
        `)
        .eq('id', codeId)
        .single()

      if (error) throw error

      setCode(data)
      setIsOwner(user?.id === data.user_id)

      // Check if user has saved this code
      if (user) {
        const { data: savedData } = await supabase
          .from('saved_codes')
          .select('id')
          .eq('user_id', user.id)
          .eq('code_id', codeId)
          .single()

        setIsSaved(!!savedData)
      }

    } catch (error) {
      console.error('Error fetching code details:', error)
      toast.error('Failed to load code details')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!code) return

    const formattedCode = `--sref ${code.code_value} --sv ${code.sv_version}`
    
    try {
      await navigator.clipboard.writeText(formattedCode)
      setCopied(true)
      toast.success('SREF code copied to clipboard!')

      // Update copy count
      await supabase
        .from('sref_codes')
        .update({ copy_count: (code.copy_count || 0) + 1 })
        .eq('id', code.id)

      setCode(prev => prev ? { ...prev, copy_count: prev.copy_count + 1 } : null)

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user || !code) {
      toast.error('Please sign in to vote')
      return
    }

    if (user.id === code.user_id) {
      toast.error("You can't vote on your own codes")
      return
    }

    try {
      const newUpvotes = voteType === 'up' ? code.upvotes + 1 : code.upvotes
      const newDownvotes = voteType === 'down' ? code.downvotes + 1 : code.downvotes

      await supabase
        .from('sref_codes')
        .update({ 
          upvotes: newUpvotes,
          downvotes: newDownvotes
        })
        .eq('id', code.id)

      setCode(prev => prev ? {
        ...prev,
        upvotes: newUpvotes,
        downvotes: newDownvotes
      } : null)

      setUserVote(voteType)
      toast.success(`Code ${voteType}voted!`)
    } catch (error) {
      toast.error('Failed to vote')
    }
  }

  const handleSave = async () => {
    if (!user || !code) {
      toast.error('Please sign in to save codes')
      return
    }

    try {
      if (isSaved) {
        await supabase
          .from('saved_codes')
          .delete()
          .eq('user_id', user.id)
          .eq('code_id', code.id)

        setIsSaved(false)
        toast.success('Code removed from saved')
      } else {
        await supabase
          .from('saved_codes')
          .insert({
            user_id: user.id,
            code_id: code.id
          })

        // Update save count
        await supabase
          .from('sref_codes')
          .update({ save_count: (code.save_count || 0) + 1 })
          .eq('id', code.id)

        setCode(prev => prev ? { ...prev, save_count: prev.save_count + 1 } : null)
        setIsSaved(true)
        toast.success('Code saved to your library')
      }
    } catch (error) {
      toast.error('Failed to save code')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!code) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Code not found</h1>
        <Button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge variant={code.sv_version === 6 ? "default" : "secondary"}>
            SV{code.sv_version}
          </Badge>
          {isOwner && (
            <Badge variant="outline">Your Code</Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview Images</CardTitle>
            </CardHeader>
            <CardContent>
              {code.code_images && code.code_images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {code.code_images
                    .sort((a, b) => a.position - b.position)
                    .map((image, index) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden group">
                        <Image
                          src={image.image_url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <Image width={32} height={32} src="/placeholder.svg" alt="No images" />
                  </div>
                  <p>No preview images available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Code Details */}
        <div className="space-y-6">
          {/* Code Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{code.title}</span>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SREF Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">SREF Code</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                    --sref {code.code_value} --sv {code.sv_version}
                  </code>
                  <Button 
                    size="sm" 
                    onClick={handleCopy}
                    className={copied ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>by {code.users?.username || 'Unknown'}</span>
              </div>

              {/* Created Date */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(code.created_at).toLocaleDateString()}</span>
              </div>

              {/* Tags */}
              {code.code_tags && code.code_tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {code.code_tags.map(tag => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                  onClick={handleCopy}
                  className="btn-primary-mining w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy SREF Code
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className={isSaved ? "bg-blue-50 border-blue-200" : ""}
                  >
                    <Bookmark className={`w-4 h-4 mr-1 ${isSaved ? 'fill-current text-blue-600' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>

                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>

                {!isOwner && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote('up')}
                      className={userVote === 'up' ? "bg-green-50 border-green-200" : ""}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {code.upvotes}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote('down')}
                      className={userVote === 'down' ? "bg-red-50 border-red-200" : ""}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {code.downvotes}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Times Copied</span>
                <span className="font-medium">{code.copy_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Times Saved</span>
                <span className="font-medium">{code.save_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Upvotes</span>
                <span className="font-medium text-green-600">{code.upvotes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Downvotes</span>
                <span className="font-medium text-red-600">{code.downvotes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}