'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pickaxe, Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/app/providers'

export default function RegisterPage() {
  const router = useRouter()
  const { supabase, signUp } = useSupabase()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }
    
    setLoading(true)
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('Registration timeout after 30 seconds')
      setLoading(false)
      toast.error('Registration timed out. Please try again.')
    }, 30000)
    
    try {
      console.log('Starting registration...')
      
      // Use the signUp function from context which handles everything
      await signUp(formData.email, formData.password, formData.username, formData.fullName)
      
      console.log('Registration completed successfully')
      
      // The signUp function handles toast messages and redirects
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'An error occurred during registration')
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="mj-main-layout min-h-screen mj-flex-center" style={{ padding: '2rem' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="mj-flex-center mb-4">
            <Pickaxe className="w-8 h-8 text-accent" />
          </div>
          
          <h1 className="mj-heading-2 mb-2">SREF Mining Co</h1>
          <p className="mj-text-muted">Professional Mining Operations</p>
        </div>

        {/* Registration Form */}
        <div className="mj-card">
          <div className="mb-8">
            <h2 className="mj-heading-3 mb-3">Start Your Mining Operation</h2>
            <p className="mj-text mj-text-muted">Create your account to begin discovering and organizing premium SREF codes</p>
          </div>

          <form onSubmit={handleSubmit} className="mj-form">
            {/* Full Name */}
            <div className="mj-form-group">
              <label className="mj-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="mj-input pl-10"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && <span className="text-destructive text-sm">{errors.fullName}</span>}
            </div>

            {/* Username */}
            <div className="mj-form-group">
              <label className="mj-label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="mj-input pl-10"
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && <span className="text-destructive text-sm">{errors.username}</span>}
            </div>

            {/* Email */}
            <div className="mj-form-group">
              <label className="mj-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mj-input pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <span className="text-destructive text-sm">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="mj-form-group">
              <label className="mj-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="mj-input pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-destructive text-sm">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="mj-form-group">
              <label className="mj-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="mj-input pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-destructive text-sm">{errors.confirmPassword}</span>}
            </div>

            {/* Terms Agreement */}
            <div className="mj-form-group">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary border-input rounded focus:ring-primary focus:ring-2"
                />
                <span className="mj-text text-sm">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">terms and conditions</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">privacy policy</Link>
                </span>
              </label>
              {errors.terms && <span className="text-destructive text-sm">{errors.terms}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mj-btn mj-btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Pickaxe className="w-4 h-4 mr-2" />
                  Start Mining Operation
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="mj-text mj-text-muted">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="mj-text mj-text-muted text-sm">
                Your data is protected with enterprise-grade security. We never share your information with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}