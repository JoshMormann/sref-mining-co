'use client'

import { useState } from 'react'
import { FaCopy, FaThumbsUp, FaThumbsDown, FaEllipsisH } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useVoting } from '@/lib/hooks/useVoting'
import { copyCodeSchema } from '@/lib/validation/votes'

type SrefCodeCardProps = {
  code: {
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
    code_images: {
      id: string
      image_url: string
      position: number
    }[]
    code_tags: {
      id: string
      tag: string
    }[]
  }
  showActions?: boolean
}

export default function SrefCodeCard({ code, showActions = true }: SrefCodeCardProps) {
  const { supabase, user } = useSupabase()
  const [copyCount, setCopyCount] = useState(code.copy_count || 0)
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Use the secure voting hook
  const { upvotes, downvotes, userVote, isVoting, handleVote } = useVoting(
    code.id,
    code.upvotes || 0,
    code.downvotes || 0,
    code.user_id
  )
  
  // Get the first image for the card preview
  const previewImage = code.code_images && code.code_images.length > 0
    ? code.code_images.sort((a, b) => a.position - b.position)[0].image_url
    : '/images/placeholder.jpg'
  
  const handleCopy = async () => {
    // Validate the copy request
    const validation = copyCodeSchema.safeParse({ code_id: code.id })
    if (!validation.success) {
      toast.error('Invalid code')
      return
    }

    // Format the code with SV version
    const formattedCode = `--sref ${code.code_value} --sv ${code.sv_version}`
    
    try {
      await navigator.clipboard.writeText(formattedCode)
      setCopied(true)
      setCopyCount(prev => prev + 1)
      toast.success('SREF code copied to clipboard!')
      
      // Update copy count in database with proper error handling
      const { error } = await supabase
        .from('sref_codes')
        .update({ copy_count: copyCount + 1 })
        .eq('id', code.id)
      
      if (error) {
        console.error('Failed to update copy count:', error)
        // Don't revert the copy since it was successful
      }
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy SREF code')
    }
  }
  
  // Voting is now handled by the useVoting hook
  
  const handleSaveToLibrary = async () => {
    if (!user) {
      toast.error('Please sign in to save codes')
      return
    }
    
    try {
      await supabase
        .from('saved_codes')
        .insert({
          user_id: user.id,
          code_id: code.id
        })
      
      // Increment save count
      await supabase
        .from('sref_codes')
        .update({ save_count: (code.save_count || 0) + 1 })
        .eq('id', code.id)
      
      setMenuOpen(false)
      toast.success('Code saved to your library!')
    } catch (err: any) {
      console.error('Failed to save to library:', err)
      if (err?.code === '23505') {
        toast.error('Code already saved to your library')
      } else {
        toast.error('Failed to save code to library')
      }
    }
  }

  return (
    <div className="bg-secondary-800 rounded-lg overflow-hidden border border-secondary-700 hover:border-primary-500 transition-colors">
      {/* Image preview */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={previewImage}
          alt={code.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-secondary-900 bg-opacity-75 rounded px-2 py-1 text-xs font-medium">
          SV{code.sv_version}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1 truncate">
          {code.title}
        </h3>
        
        <div className="flex items-center mb-3">
          <div className="bg-secondary-700 rounded px-2 py-1 font-mono text-sm">
            {code.code_value}
          </div>
        </div>
        
        {/* Tags */}
        {code.code_tags && code.code_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {code.code_tags.slice(0, 3).map(tag => (
              <span 
                key={tag.id} 
                className="bg-secondary-700 text-xs rounded px-2 py-1 text-gray-300"
              >
                {tag.tag}
              </span>
            ))}
            {code.code_tags.length > 3 && (
              <span className="bg-secondary-700 text-xs rounded px-2 py-1 text-gray-300">
                +{code.code_tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center space-x-1 text-sm rounded-md px-2 py-1",
                  copied ? "text-green-400" : "text-gray-400 hover:text-white"
                )}
              >
                <FaCopy />
                <span>{copyCount}</span>
              </button>
              
              <button
                onClick={() => handleVote(true)}
                disabled={isVoting || Boolean(user && user.id === code.user_id)}
                className={cn(
                  "flex items-center space-x-1 text-sm rounded-md px-2 py-1 transition-colors",
                  userVote === 'upvote' ? "text-green-400" : "text-gray-400 hover:text-white",
                  (isVoting || (user && user.id === code.user_id)) && "opacity-50 cursor-not-allowed"
                )}
                title={user && user.id === code.user_id ? "You can't vote on your own codes" : "Upvote this code"}
              >
                <FaThumbsUp />
                <span>{upvotes}</span>
              </button>
              
              <button
                onClick={() => handleVote(false)}
                disabled={isVoting || Boolean(user && user.id === code.user_id)}
                className={cn(
                  "flex items-center space-x-1 text-sm rounded-md px-2 py-1 transition-colors",
                  userVote === 'downvote' ? "text-red-400" : "text-gray-400 hover:text-white",
                  (isVoting || (user && user.id === code.user_id)) && "opacity-50 cursor-not-allowed"
                )}
                title={user && user.id === code.user_id ? "You can't vote on your own codes" : "Downvote this code"}
              >
                <FaThumbsDown />
                <span>{downvotes}</span>
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-400 hover:text-white p-1"
              >
                <FaEllipsisH />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 bottom-8 bg-secondary-700 rounded-md shadow-lg z-10 w-48">
                  <div className="py-1">
                    <button
                      onClick={handleSaveToLibrary}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-secondary-600"
                    >
                      Save to Library
                    </button>
                    <Link
                      href={`/dashboard/code/${code.id}`}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-secondary-600"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
