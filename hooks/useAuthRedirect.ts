'use client'
import { useSession } from '@/contexts/SessionContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook to redirect authenticated users away from auth pages
 * @param redirectTo Path to redirect to if user is authenticated
 */
export function useAuthRedirect(redirectTo: string = '/') {
  const { session, isLoading } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    // Only redirect after we've checked the session
    if (!isLoading && session) {
      router.push(redirectTo)
    }
  }, [session, isLoading, router, redirectTo])
  
  return { isLoading, isAuthenticated: !!session }
}