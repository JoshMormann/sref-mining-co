'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { toast } from 'react-hot-toast'

export default function WaitlistSignup() {
  const { supabase, user } = useSupabase()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Check if already on waitlist
      const { data: existingEntry } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', email)
        .single()
      
      if (existingEntry) {
        toast.success('You are already on the waitlist!')
        setSubmitted(true)
        return
      }
      
      // Add to waitlist
      const { error } = await supabase
        .from('waitlist')
        .insert({
          email,
          user_id: user?.id || null,
          status: 'pending'
        })
      
      if (error) throw error
      
      toast.success('You have been added to the waitlist!')
      setSubmitted(true)
      
      // If user is logged in, update their waitlist status
      if (user) {
        await supabase
          .from('users')
          .update({ waitlist_status: 'pending' })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Error joining waitlist:', error)
      toast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {submitted ? (
        <div className="bg-secondary-800 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Thank you for joining!</h3>
          <p className="text-gray-300">
            We'll notify you when Collector Tier access becomes available.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-secondary-800 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="input flex-1"
              required
            />
            <button
              type="submit"
              className="btn btn-primary whitespace-nowrap"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                'Join Waitlist'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
