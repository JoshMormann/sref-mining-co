'use client'

import { useSupabase } from '@/app/providers'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  user_metadata: any
}

interface ProfileUser {
  id: string
  username: string
  email: string
  tier: string
  waitlist_status: string
  created_at: string
  updated_at: string
}

interface AuthEvent {
  timestamp: string
  event: string
  user_id: string
  email: string
  details: any
}

export default function UserAuditPage() {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([])
  const [profileUsers, setProfileUsers] = useState<ProfileUser[]>([])
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([])
  const [orphanedAuth, setOrphanedAuth] = useState<AuthUser[]>([])
  const [orphanedProfiles, setOrphanedProfiles] = useState<ProfileUser[]>([])
  const [rlsTestResult, setRlsTestResult] = useState<any>(null)
  const [rlsTestLoading, setRlsTestLoading] = useState(false)
  const [manualCreateForm, setManualCreateForm] = useState({
    id: '',
    username: '',
    email: '',
    tier: 'miner',
    waitlist_status: 'none'
  })
  const [manualCreateLoading, setManualCreateLoading] = useState(false)
  const [manualCreateError, setManualCreateError] = useState<string | null>(null)
  const [manualCreateSuccess, setManualCreateSuccess] = useState<boolean>(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [serviceRoleAvailable, setServiceRoleAvailable] = useState(false)

  // Fetch users and audit data
  const fetchAuditData = async () => {
    setLoading(true)
    try {
      console.log('Fetching audit data...')
      
      // Attempt to use admin API (requires service role key)
      try {
        const { data: adminAuthUsers, error: adminError } = await supabase.auth.admin.listUsers()
        if (!adminError && adminAuthUsers) {
          console.log('Service role key available - admin API accessible')
          setServiceRoleAvailable(true)
          setAuthUsers(adminAuthUsers.users.map(u => ({
            id: u.id,
            email: u.email || '',
            created_at: u.created_at || '',
            email_confirmed_at: u.email_confirmed_at || null,
            user_metadata: u.user_metadata
          })))
        } else {
          console.log('Service role key not available or admin API error:', adminError)
          setServiceRoleAvailable(false)
          // Fallback to just showing current user
          if (user) {
            setAuthUsers([{
              id: user.id,
              email: user.email || '',
              created_at: user.created_at || '',
              email_confirmed_at: user.email_confirmed_at || null,
              user_metadata: user.user_metadata
            }])
          }
        }
      } catch (err) {
        console.error('Admin API error:', err)
        setServiceRoleAvailable(false)
        // Fallback to just showing current user
        if (user) {
          setAuthUsers([{
            id: user.id,
            email: user.email || '',
            created_at: user.created_at || '',
            email_confirmed_at: user.email_confirmed_at || null,
            user_metadata: user.user_metadata
          }])
        }
      }
      
      // Get profile users
      const { data: profiles, error: profilesError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        toast.error(`Failed to fetch profiles: ${profilesError.message}`)
      } else {
        setProfileUsers(profiles || [])
      }
      
      // Get auth events from logs table (if it exists)
      try {
        const { data: events, error: eventsError } = await supabase
          .from('auth_log')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50)
        
        if (!eventsError && events) {
          setAuthEvents(events)
        } else {
          // Auth log table might not exist
          console.log('Auth log table not found or empty')
        }
      } catch (err) {
        console.log('Auth log table might not exist:', err)
      }
      
      // Calculate orphaned users (auth users without profiles)
      if (profiles) {
        const profileIds = new Set(profiles.map(p => p.id))
        const orphanedAuthUsers = authUsers.filter(au => !profileIds.has(au.id))
        setOrphanedAuth(orphanedAuthUsers)
        
        // Calculate orphaned profiles (profiles without auth users)
        const authIds = new Set(authUsers.map(au => au.id))
        const orphanedProfileUsers = profiles.filter(p => !authIds.has(p.id))
        setOrphanedProfiles(orphanedProfileUsers)
      }
      
    } catch (error) {
      console.error('Error fetching audit data:', error)
      toast.error('Failed to fetch audit data')
    } finally {
      setLoading(false)
    }
  }
  
  // Test RLS policies
  const testRlsPolicies = async () => {
    setRlsTestLoading(true)
    try {
      const results = {
        select: null as any,
        insert: null as any,
        update: null as any,
        delete: null as any,
        details: [] as string[]
      }
      
      // Test SELECT policy
      const { data: selectData, error: selectError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      results.select = {
        success: !selectError,
        error: selectError?.message || null
      }
      
      if (selectError) {
        results.details.push(`SELECT error: ${selectError.message}`)
      }
      
      // Test INSERT policy (only if we have a user)
      if (user) {
        const testUsername = `test_${Date.now()}`
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id, // Will conflict if user already exists
            username: testUsername,
            email: user.email || 'test@example.com',
            tier: 'miner',
            waitlist_status: 'none'
          })
          .select()
        
        results.insert = {
          success: !insertError || insertError.code === '23505', // Success or unique violation (already exists)
          error: insertError?.message || null,
          isConflict: insertError?.code === '23505'
        }
        
        if (insertError && insertError.code !== '23505') {
          results.details.push(`INSERT error: ${insertError.message}`)
        }
      }
      
      // Test UPDATE policy (only if we have a user and profiles)
      if (user && profileUsers.length > 0) {
        const userProfile = profileUsers.find(p => p.id === user.id)
        
        if (userProfile) {
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select()
          
          results.update = {
            success: !updateError,
            error: updateError?.message || null
          }
          
          if (updateError) {
            results.details.push(`UPDATE error: ${updateError.message}`)
          }
        } else {
          results.update = {
            success: false,
            error: 'No profile found for current user'
          }
          results.details.push('UPDATE test skipped: No profile found for current user')
        }
      }
      
      // We skip DELETE test to avoid actually deleting data
      results.delete = {
        success: null,
        error: 'Test skipped to avoid data deletion'
      }
      
      setRlsTestResult(results)
    } catch (error: any) {
      console.error('Error testing RLS policies:', error)
      setRlsTestResult({
        error: error.message || 'Unknown error testing RLS policies'
      })
    } finally {
      setRlsTestLoading(false)
    }
  }
  
  // Handle manual profile creation
  const handleManualCreate = async () => {
    setManualCreateLoading(true)
    setManualCreateError(null)
    setManualCreateSuccess(false)
    
    try {
      if (!manualCreateForm.id || !manualCreateForm.username || !manualCreateForm.email) {
        throw new Error('ID, username and email are required')
      }
      
      // Check if auth user exists first
      let authUserExists = false
      
      if (serviceRoleAvailable) {
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
            manualCreateForm.id
          )
          
          authUserExists = !!authUser && !authError
          
          if (!authUserExists) {
            throw new Error(`Auth user with ID ${manualCreateForm.id} not found. User must exist in Auth before creating profile.`)
          }
        } catch (err) {
          console.error('Error checking auth user:', err)
          throw new Error('Failed to verify auth user exists')
        }
      }
      
      // Create user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: manualCreateForm.id,
          username: manualCreateForm.username,
          email: manualCreateForm.email,
          tier: manualCreateForm.tier,
          waitlist_status: manualCreateForm.waitlist_status
        })
        .select()
      
      if (error) {
        throw new Error(`Profile creation failed: ${error.message}`)
      }
      
      setManualCreateSuccess(true)
      toast.success('User profile created successfully')
      
      // Refresh data
      fetchAuditData()
      
    } catch (error: any) {
      console.error('Manual profile creation error:', error)
      setManualCreateError(error.message || 'Unknown error creating profile')
      toast.error(error.message || 'Failed to create user profile')
    } finally {
      setManualCreateLoading(false)
    }
  }
  
  // Set form data from an existing auth user
  const prefillFromAuthUser = (authUser: AuthUser) => {
    setManualCreateForm({
      id: authUser.id,
      username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      tier: 'miner',
      waitlist_status: 'none'
    })
    setShowAdvanced(true)
    
    // Scroll to form
    document.getElementById('manual-create-form')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // Initialize
  useEffect(() => {
    fetchAuditData()
  }, [supabase, user])
  
  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Audit Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Debug user accounts, auth state, and RLS policies
        </p>
        
        <div className="flex gap-2 mb-6">
          <button 
            onClick={fetchAuditData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Data
          </button>
          
          <button
            onClick={testRlsPolicies}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90"
            disabled={rlsTestLoading}
          >
            {rlsTestLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            Test RLS Policies
          </button>
        </div>
        
        {!serviceRoleAvailable && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Service Role Key Not Available</h3>
                <p className="text-amber-700 text-sm">
                  Some admin features are limited because the service role key is not configured.
                  Add <code className="bg-amber-100 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code> file for full functionality.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-md shadow border">
          <h2 className="text-lg font-semibold mb-2">Auth Users</h2>
          <p className="text-3xl font-bold">{authUsers.length}</p>
          <p className="text-sm text-muted-foreground">Users in Supabase Auth</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border">
          <h2 className="text-lg font-semibold mb-2">Profile Users</h2>
          <p className="text-3xl font-bold">{profileUsers.length}</p>
          <p className="text-sm text-muted-foreground">Users in 'users' table</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border">
          <h2 className="text-lg font-semibold mb-2">Orphaned Users</h2>
          <p className="text-3xl font-bold">{orphanedAuth.length}</p>
          <p className="text-sm text-muted-foreground">Auth users without profiles</p>
        </div>
      </div>
      
      {/* RLS Test Results */}
      {rlsTestResult && (
        <div className="mb-8 bg-white p-4 rounded-md shadow border">
          <h2 className="text-xl font-semibold mb-4">RLS Policy Test Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">SELECT</span>
                {rlsTestResult.select?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {rlsTestResult.select?.success ? 'Policy allows reading data' : rlsTestResult.select?.error || 'Policy blocks reading data'}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">INSERT</span>
                {rlsTestResult.insert?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {rlsTestResult.insert?.isConflict ? 'User already exists (expected)' : 
                  rlsTestResult.insert?.success ? 'Policy allows creating profiles' : 
                  rlsTestResult.insert?.error || 'Policy blocks creating profiles'}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">UPDATE</span>
                {rlsTestResult.update?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {rlsTestResult.update?.success ? 'Policy allows updating profiles' : 
                  rlsTestResult.update?.error || 'Policy blocks updating profiles'}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">DELETE</span>
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                Test skipped to avoid data deletion
              </p>
            </div>
          </div>
          
          {rlsTestResult.details && rlsTestResult.details.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Detailed Results</h3>
              <ul className="text-sm space-y-1">
                {rlsTestResult.details.map((detail: string, i: number) => (
                  <li key={i} className="text-red-600">{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Orphaned Auth Users */}
      {orphanedAuth.length > 0 && (
        <div className="mb-8 bg-white p-4 rounded-md shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Orphaned Auth Users
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            These users exist in Supabase Auth but don't have corresponding profiles in the 'users' table.
            This could be causing your login issues.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Email Confirmed</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orphanedAuth.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-xs">{user.id}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{new Date(user.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {user.email_confirmed_at ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => prefillFromAuthUser(user)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Create Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Manual Profile Creation */}
      <div id="manual-create-form" className="mb-8 bg-white p-4 rounded-md shadow border">
        <h2 className="text-xl font-semibold mb-4">Manual Profile Creation</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Create a user profile manually to fix orphaned auth users.
          The user must already exist in Supabase Auth.
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID (from Auth)</label>
              <input
                type="text"
                value={manualCreateForm.id}
                onChange={(e) => setManualCreateForm({...manualCreateForm, id: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="UUID from Auth"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={manualCreateForm.email}
                onChange={(e) => setManualCreateForm({...manualCreateForm, email: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={manualCreateForm.username}
                onChange={(e) => setManualCreateForm({...manualCreateForm, username: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="username"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:underline mb-2"
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced Options'}
              </button>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="block text-sm font-medium mb-1">Tier</label>
                <select
                  value={manualCreateForm.tier}
                  onChange={(e) => setManualCreateForm({...manualCreateForm, tier: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="miner">miner</option>
                  <option value="prospector">prospector</option>
                  <option value="excavator">excavator</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Waitlist Status</label>
                <select
                  value={manualCreateForm.waitlist_status}
                  onChange={(e) => setManualCreateForm({...manualCreateForm, waitlist_status: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="none">none</option>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
            </div>
          )}
          
          {manualCreateError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {manualCreateError}
            </div>
          )}
          
          {manualCreateSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              Profile created successfully!
            </div>
          )}
          
          <div>
            <button
              onClick={handleManualCreate}
              disabled={manualCreateLoading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
            >
              {manualCreateLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Profile'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Auth Users Table */}
      <div className="mb-8 bg-white p-4 rounded-md shadow border">
        <h2 className="text-xl font-semibold mb-4">Auth Users ({authUsers.length})</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Email Confirmed</th>
                <th className="px-4 py-2 text-left">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {authUsers.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{user.id}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{new Date(user.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {user.email_confirmed_at ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {JSON.stringify(user.user_metadata)}
                  </td>
                </tr>
              ))}
              {authUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-muted-foreground">
                    No auth users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Profile Users Table */}
      <div className="mb-8 bg-white p-4 rounded-md shadow border">
        <h2 className="text-xl font-semibold mb-4">Profile Users ({profileUsers.length})</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Tier</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {profileUsers.map(profile => (
                <tr key={profile.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{profile.id}</td>
                  <td className="px-4 py-2">{profile.username}</td>
                  <td className="px-4 py-2">{profile.email}</td>
                  <td className="px-4 py-2">{profile.tier}</td>
                  <td className="px-4 py-2">{new Date(profile.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(profile.updated_at).toLocaleString()}</td>
                </tr>
              ))}
              {profileUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-muted-foreground">
                    No profile users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Auth Events */}
      {authEvents.length > 0 && (
        <div className="mb-8 bg-white p-4 rounded-md shadow border">
          <h2 className="text-xl font-semibold mb-4">Auth Events ({authEvents.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">Event</th>
                  <th className="px-4 py-2 text-left">User ID</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {authEvents.map((event, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">{event.event}</td>
                    <td className="px-4 py-2 font-mono text-xs">{event.user_id}</td>
                    <td className="px-4 py-2">{event.email}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {JSON.stringify(event.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">Recommendations</h2>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>
            If you see orphaned auth users, use the "Create Profile" button to manually create profiles for them.
          </li>
          <li>
            Check your RLS policies if users are being created but then disappearing. The DELETE policy might be too permissive.
          </li>
          <li>
            Consider adding a database trigger to automatically create profiles for new auth users:
            <pre className="bg-blue-100 p-2 rounded mt-2 text-xs overflow-x-auto">
{`CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, tier, waitlist_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'miner',
    'none'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`}
            </pre>
          </li>
        </ul>
      </div>
    </div>
  )
}
