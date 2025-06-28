// FILE PATH: src/app/auth/login/page.tsx
// This is the LOGIN page for user authentication

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Pickaxe,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Github,
  Chrome
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/app/providers'
import type { Database } from '@/lib/types/database'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSupabase()
  const supabase = createClientComponentClient<Database>()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/dashboard')
      return
    }

    // Check for messages from URL params
    const urlMessage = searchParams.get('message')
    const urlError = searchParams.get('error')
    
    if (urlMessage) {
      setMessage(urlMessage)
    }
    
    if (urlError) {
      setError(urlError)
    }
  }, [user, router, searchParams])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        toast.success('Welcome back to SREF Mining Co!')
        router.push('/dashboard')
      }

    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.')
      } else {
        setError(error.message || 'An error occurred during sign in')
      }
      
      toast.error('Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      setError('Failed to sign in with Google. Please try again.')
      toast.error('Google sign in failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('GitHub sign in error:', error)
      setError('Failed to sign in with GitHub. Please try again.')
      toast.error('GitHub sign in failed')
    } finally {
      setIsGithubLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = form.getValues('email')
    
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      toast.success('Password reset email sent! Check your inbox.')
      setMessage('Password reset email sent. Please check your inbox and follow the instructions.')
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error('Failed to send password reset email')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">Back to home</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-mining rounded-lg">
              <Pickaxe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SREF Mining Co</h1>
              <p className="text-sm text-muted-foreground">Professional Mining Operations</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back, Miner</CardTitle>
            <CardDescription>
              Sign in to your account to continue your mining operations
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Messages */}
            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGithubSignIn}
                disabled={isGithubLoading || isLoading}
              >
                {isGithubLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 font-normal text-sm"
                          onClick={handleForgotPassword}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password" 
                            className="pl-10 pr-10"
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full btn-primary-mining"
                  disabled={isLoading || isGoogleLoading || isGithubLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Pickaxe className="mr-2 h-4 w-4" />
                      Resume Mining Operations
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Start mining today
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Protected by enterprise-grade security. Your mining operations are safe with us.
          </p>
        </div>
      </div>
    </div>
  )
}

