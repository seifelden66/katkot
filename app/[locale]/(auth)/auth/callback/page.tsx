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
          const isRegistrationIntent = localStorage.getItem('registration_intent')
          const selectedRegionId = sessionStorage.getItem('selected_region_id')
          localStorage.setItem('registration_intent', 'true')
          
          if (isRegistrationIntent === 'true') {
            console.log('Handling registration flow for new user')
            
            try {
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  id: data.session.user.id,
                  full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '',
                  subscription_plan: 'free',
                  region_id: selectedRegionId ? parseInt(selectedRegionId) : 1
                }, {
                  onConflict: 'id'
                })

              if (profileError) {
                console.error('Profile creation error:', profileError)
              }
              
              sessionStorage.removeItem('registration_intent')
              sessionStorage.removeItem('selected_region_id')
              
              router.push(`/${locale}/auth/login?message=registration_success`)
              
            } catch (profileErr) {
              console.error('Profile creation exception:', profileErr)
              sessionStorage.removeItem('registration_intent')
              sessionStorage.removeItem('selected_region_id')
              router.push(`/${locale}/auth/login?message=registration_success`)
            }
          } else {
            router.push(`/${locale}/`)
          }
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