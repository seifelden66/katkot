'use client'
import { useEffect } from 'react'
import {  useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Cookies from 'js-cookie'

export default function AuthCallback() {
  const router = useRouter()
  // const params = useSearchParams()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (session) {
        Cookies.set('sb-access-token', session.access_token, {
          expires: session.expires_in / 86400,
          secure: true,
          sameSite: 'Lax'
        })
        router.push('/dashboard')
      }
      
      if (error) router.push('/auth/login?error=OAuth failed')
    }

    handleOAuthCallback()
  }, [router])

  return <div>Loading authentication...</div>
}