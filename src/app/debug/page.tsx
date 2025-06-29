'use client'

import { useSupabase } from '@/app/providers'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DebugPage() {
  const { supabase, user, loading } = useSupabase()
  const [authUsers, setAuthUsers] = useState<any[]>([])
  const [profileUsers, setProfileUsers] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession()
        setSession(sessionData.session)

        // Get auth users (requires service role)
        // This won't work with anon key, but will show in console
        console.log('Current session:', sessionData.session)
        console.log('Current user:', user)

        // Get profile users
        const { data: profiles, error } = await supabase
          .from('users')
          .select('*')
        
        if (error) {
          console.error('Error fetching profiles:', error)
        } else {
          setProfileUsers(profiles || [])
        }
      } catch (error) {
        console.error('Debug fetch error:', error)
      }
    }

    fetchDebugInfo()
  }, [supabase, user])

  const testRegistration = async () => {
    try {
      // Generate a simple, standards-compliant email (without “+” aliasing) to
      // avoid provider-specific validation issues during testing.
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'testpassword123'
      const testUsername = `testuser${Date.now()}`

      console.log('Testing registration with:', { testEmail, testUsername })
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase client initialized:', !!supabase)

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            username: testUsername,
            full_name: 'Test User'
          }
        }
      })

      console.log('Full registration result:', { data, error })
      console.log('Data.user:', data?.user)
      console.log('Data.session:', data?.session)

      if (error) {
        console.error('Registration error details:', error)
        alert(`Registration error: ${error.message}`)
      } else {
        console.log('Registration response analysis:')
        console.log('- User exists:', !!data?.user)
        console.log('- User ID:', data?.user?.id)
        console.log('- User email:', data?.user?.email)
        console.log('- Email confirmed:', data?.user?.email_confirmed_at)
        console.log('- Session exists:', !!data?.session)
        alert('Registration test completed! Check console for full details.')
      }
    } catch (error) {
      console.error('Test registration error:', error)
      alert('Test registration failed')
    }
  }

  const clearAuth = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const triggerLogin = async () => {
    try {
      const password = prompt('Enter your password for josh.mormann@gmail.com:')
      if (!password) return
      
      console.log('Attempting to sign in with existing user...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'josh.mormann@gmail.com',
        password: password
      })
      
      console.log('Login result:', { data, error })
      
      if (error) {
        alert(`Login error: ${error.message}`)
      } else {
        alert('Login successful! This should trigger profile creation.')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed')
    }
  }

  const manuallyCreateProfile = async () => {
    try {
      console.log('Manually creating profile for known user...')
      
      // Try to insert the profile using the known user ID from the auth API
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: '28240cac-cf7c-4723-b24a-bf4cbd13f226', // Known user ID from auth API
          username: 'JayJax',
          email: 'josh.mormann@gmail.com',
          tier: 'miner',
          waitlist_status: 'none'
        })
        .select()
      
      console.log('Profile creation result:', { data, error })
      
      if (error) {
        alert(`Profile creation error: ${error.message}`)
      } else {
        alert('Profile created successfully! Try going to /dashboard')
      }
    } catch (error) {
      console.error('Manual profile creation error:', error)
      alert('Manual profile creation failed')
    }
  }

  const checkSupabaseConnection = async () => {
    try {
      console.log('Checking Supabase connection...')
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Try to get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      console.log('Current session:', sessionData, sessionError)
      
      // Try a simple query to test database connection
      const { data, error } = await supabase.from('users').select('count').limit(1)
      console.log('Database test query result:', { data, error })
      
      // Check auth users via admin API simulation
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      console.log('Auth users (if service role works):', authUsers, authError)
      
      alert('Check console for detailed connection info')
    } catch (error) {
      console.error('Connection check error:', error)
      alert('Connection check failed - see console')
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      {/* Quick link to User Audit tool */}
      <div className="mb-6">
        <Link
          href="/debug/user-audit"
          className="inline-block bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
        >
          Go to User Audit Tool
        </Link>
      </div>
      
      <div className="space-y-6">
        {/* Current State */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Current State</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'None'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>Email Confirmed:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
            <p><strong>User Metadata:</strong> {JSON.stringify(user?.user_metadata || {})}</p>
          </div>
        </div>

        {/* Environment Check */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing'}</p>
            <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Missing'}</p>
            <p><strong>Client Initialized:</strong> {supabase ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Session Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Session Info</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* Profile Users */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Profile Users ({profileUsers.length})</h2>
          {profileUsers.length > 0 ? (
            <div className="space-y-2">
              {profileUsers.map((profile) => (
                <div key={profile.id} className="text-sm border-b pb-2">
                  <p><strong>ID:</strong> {profile.id}</p>
                  <p><strong>Username:</strong> {profile.username}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No profile users found</p>
          )}
        </div>

        {/* Actions */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <button 
              onClick={testRegistration}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Registration
            </button>
            <button 
              onClick={clearAuth}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Auth
            </button>
            <button 
              onClick={triggerLogin}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Try Login (Trigger Profile Creation)
            </button>
            <button 
              onClick={manuallyCreateProfile}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Manually Create Profile
            </button>
            <button 
              onClick={checkSupabaseConnection}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Check Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}