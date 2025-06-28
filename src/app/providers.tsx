'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

type SupabaseContext = {
  supabase: any
  user: any | null
  loading: boolean
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user ?? null)
        
        // Handle email confirmation - create profile if it doesn't exist
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking/creating profile for:', session.user.email)
          try {
            // Check if user profile exists
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single()
            
            console.log('Profile check result:', { existingUser, fetchError })
            
            if (!existingUser) {
              console.log('Creating new user profile with metadata:', session.user.user_metadata)
              
              // Get username from metadata, with fallback
              let username = session.user.user_metadata?.username || session.user.email?.split('@')[0]
              
              // Create user profile if it doesn't exist
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  username: username,
                  email: session.user.email,
                  tier: 'miner',
                  waitlist_status: 'none'
                })
              
              if (profileError) {
                console.error('Profile creation error:', profileError)
                
                // Handle username conflict by generating a unique username
                if (profileError.code === '23505' && profileError.message?.includes('username')) {
                  console.log('Username conflict, generating unique username')
                  const uniqueUsername = `${username}_${Date.now().toString().slice(-4)}`
                  
                  const { error: retryError } = await supabase
                    .from('users')
                    .insert({
                      id: session.user.id,
                      username: uniqueUsername,
                      email: session.user.email,
                      tier: 'miner',
                      waitlist_status: 'none'
                    })
                  
                  if (retryError) {
                    console.error('Retry profile creation error:', retryError)
                    toast.error(`Failed to create user profile: ${retryError.message}`)
                  } else {
                    console.log('User profile created with unique username:', uniqueUsername)
                    toast.success(`Welcome! Your username is ${uniqueUsername}`)
                  }
                } else {
                  toast.error(`Failed to create user profile: ${profileError.message}`)
                }
              } else {
                console.log('User profile created successfully')
                toast.success('Welcome! Your account has been set up.')
              }
            } else {
              console.log('User profile already exists')
            }
          } catch (error) {
            console.error('Error checking/creating user profile:', error)
          }
        }
        
        router.refresh()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    try {
      setLoading(true)
      
      console.log('SignUp function called with:', { email, username, fullName })
      
      // Create the user with metadata
      // Username uniqueness will be enforced by database constraint during profile creation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || username
          }
        }
      })
      
      if (error) {
        console.error('Supabase signUp error:', error)
        throw error
      }
      
      console.log('SignUp successful:', data)
      console.log('User details:', data.user)
      console.log('Session details:', data.session)
      console.log('User ID:', data.user?.id)
      console.log('User email:', data.user?.email)
      console.log('Email confirmed:', data.user?.email_confirmed_at)
      
      // Profile creation will be handled by the auth state change handler
      if (data.user?.email_confirmed_at) {
        toast.success('Account created successfully!')
      } else {
        toast.success('Account created! Please check your email to verify your account.')
      }
    } catch (error: any) {
      console.error('SignUp function error:', error)
      
      // Handle common errors more gracefully
      if (error.message?.includes('User already registered')) {
        toast.error('An account with this email already exists')
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Please enter a valid email address')
      } else {
        toast.error(error.message || 'An error occurred during sign up')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Signed in successfully')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      router.push('/')
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign out')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Check your email for the password reset link')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during password reset')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    supabase,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
