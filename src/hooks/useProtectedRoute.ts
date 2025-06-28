import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'

export function useProtectedRoute() {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  return { user, loading }
}