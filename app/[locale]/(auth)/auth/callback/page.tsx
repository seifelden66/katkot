'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useLocale } from 'next-intl'
import Cookies from 'js-cookie'

export default function AuthCallback() {
  const router = useRouter()
  const locale = useLocale()
  const callbackHandled = useRef(false)
  
  useEffect(() => {
    if (callbackHandled.current) return
    callbackHandled.current = true
    
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        
        if (!code) {
          console.error('No code found in URL')
          router.push(`/${locale}/auth/login?error=no_code_found`)
          return
        }
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Error during OAuth callback:', error)
          router.push(`/${locale}/auth/login?error=${encodeURIComponent(error.message)}`)
          return
        }
        
        if (data?.session) {
          Cookies.set('sb-access-token', data.session.access_token, {
            expires: data.session.expires_in / 86400,
            secure: true,
            sameSite: 'Lax'
          })
          
          router.push(`/${locale}/`)
        } else {
          console.error('No session data returned from OAuth callback')
          router.push(`/${locale}/auth/login?error=no_session_data`)
        }
      } catch (err) {
        console.error('Exception during OAuth callback:', err)
        router.push(`/${locale}/auth/login?error=callback_error`)
      }
    }

    handleCallback()
  }, [router, locale])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
