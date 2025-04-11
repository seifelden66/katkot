import { useSession } from '@supabase/auth-helpers-react'

export function useAuth() {
  const session = useSession()
  
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false
    const tokenData = localStorage.getItem('sb-access-token')
    return !!tokenData && !!JSON.parse(tokenData).access_token
  }

  return {
    user: session?.user,
    isAuthenticated: isAuthenticated(),
    requireAuth: () => {
      if (!isAuthenticated()) {
        throw new Error('Authentication required')
      }
    }
  }
}