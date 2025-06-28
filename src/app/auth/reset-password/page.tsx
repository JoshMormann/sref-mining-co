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
import { 
  Pickaxe,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Database } from '@/lib/types/database'

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient<Database>()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema) as any,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Check if we have the necessary tokens for password reset
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      toast.success('Password updated successfully!')
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/auth/login?message=Password updated successfully. Please sign in with your new password.')
      }, 3000)

    } catch (error: any) {
      console.error('Password reset error:', error)
      setError(error.message || 'An error occurred while updating your password')
      toast.error('Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
              <p className="text-muted-foreground mb-4">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  Redirecting you to the login page...
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">
                Continue to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/auth/login" className="inline-flex items-center space-x-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">Back to login</span>
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

        {/* Reset Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter a new password for your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password" 
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

                {/* Confirm New Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password" 
                            className="pl-10 pr-10"
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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
                  disabled={isLoading || !!error}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Your password is encrypted and secure. We recommend using a strong, unique password.
          </p>
        </div>
      </div>
    </div>
  )
}