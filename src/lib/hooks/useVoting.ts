'use client'

import { useState, useCallback } from 'react'
import { useSupabase } from '@/app/providers'
import { toast } from 'react-hot-toast'
import { voteSchema } from '@/lib/validation/votes'

export function useVoting(codeId: string, initialUpvotes: number, initialDownvotes: number, codeOwnerId?: string) {
  const { supabase, user } = useSupabase()
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = useCallback(async (isUpvote: boolean) => {
    if (!user) {
      toast.error('Please sign in to vote')
      return
    }

    if (codeOwnerId && user.id === codeOwnerId) {
      toast.error("You can't vote on your own codes")
      return
    }

    // Validate input
    const validation = voteSchema.safeParse({
      code_id: codeId,
      is_upvote: isUpvote,
    })

    if (!validation.success) {
      toast.error('Invalid vote data')
      console.error('Vote validation failed:', validation.error)
      return
    }

    if (isVoting) {
      return // Prevent multiple rapid clicks
    }

    let existingVote: any = null

    try {
      setIsVoting(true)

      // Check if user has already voted
      const { data: voteData, error: voteCheckError } = await supabase
        .from('code_votes')
        .select('is_upvote')
        .eq('code_id', codeId)
        .eq('user_id', user.id)
        .single()

      if (voteCheckError && voteCheckError.code !== 'PGRST116') {
        throw voteCheckError
      }

      existingVote = voteData

      // If user is changing their vote or voting for the first time
      const previousVote = existingVote?.is_upvote

      if (existingVote) {
        if (previousVote === isUpvote) {
          toast.error('You have already voted on this code')
          return
        }

        // Update existing vote
        const { error: updateError } = await supabase
          .from('code_votes')
          .update({ is_upvote: isUpvote, updated_at: new Date().toISOString() })
          .eq('code_id', codeId)
          .eq('user_id', user.id)

        if (updateError) throw updateError

        // Update local state for vote change
        if (previousVote === true) {
          // Changed from upvote to downvote
          setUpvotes(prev => prev - 1)
          setDownvotes(prev => prev + 1)
        } else {
          // Changed from downvote to upvote
          setDownvotes(prev => prev - 1)
          setUpvotes(prev => prev + 1)
        }
        
        setUserVote(isUpvote ? 'upvote' : 'downvote')
        toast.success('Vote updated!')
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('code_votes')
          .insert({
            code_id: codeId,
            user_id: user.id,
            is_upvote: isUpvote,
          })

        if (insertError) throw insertError

        // Update local state for new vote
        if (isUpvote) {
          setUpvotes(prev => prev + 1)
        } else {
          setDownvotes(prev => prev + 1)
        }
        
        setUserVote(isUpvote ? 'upvote' : 'downvote')
        toast.success(isUpvote ? 'Code upvoted!' : 'Code downvoted!')
      }

      // Update the sref_codes table with new counts
      await supabase.rpc('update_code_vote_counts', { code_id: codeId })

    } catch (error: any) {
      console.error('Failed to vote:', error)
      toast.error('Failed to vote on code')
      
      // Revert optimistic updates on error
      if (existingVote) {
        // Revert vote change
        const previousVote = existingVote.is_upvote
        if (previousVote === true) {
          setUpvotes(prev => prev + 1)
          setDownvotes(prev => prev - 1)
        } else {
          setDownvotes(prev => prev + 1)
          setUpvotes(prev => prev - 1)
        }
        setUserVote(previousVote ? 'upvote' : 'downvote')
      } else {
        // Revert new vote
        if (isUpvote) {
          setUpvotes(prev => prev - 1)
        } else {
          setDownvotes(prev => prev - 1)
        }
        setUserVote(null)
      }
    } finally {
      setIsVoting(false)
    }
  }, [codeId, user, supabase, isVoting, userVote, codeOwnerId])

  return {
    upvotes,
    downvotes,
    userVote,
    isVoting,
    handleVote,
  }
}