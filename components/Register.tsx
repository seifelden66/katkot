'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
// import { useRegions } from '@/app/hooks/queries/usePostQueries'
import Input from './atoms/Input'
import Button from './atoms/Button'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')
  const isRTL = locale === 'ar'
  const selectedRegionId = 1
  
  // const { data: regions = [] } = useRegions()
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            fullName: fullName.trim()
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Check if user needs email confirmation
        if (!data.session) {
          setMessage(t('checkEmailConfirmation') || 'Please check your email to confirm your account.')
          // For email confirmation flow, also redirect to login after showing message
          setTimeout(() => {
            router.push(`/${locale}/auth/login?message=check_email`)
          }, 3000)
          return
        }

        // Create or update profile for confirmed user using UPSERT
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            subscription_plan: 'free',
            region_id: selectedRegionId || 1
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Even if profile creation fails, redirect to login since account was created
          setMessage('Account created successfully! Please sign in.')
          setTimeout(() => {
            router.push(`/${locale}/auth/login`)
          }, 1500)
        } else {
          setMessage('Account created successfully! Please sign in.')
          setTimeout(() => {
            router.push(`/${locale}/auth/login`)
          }, 1500)
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    setError('')
    setMessage('')

    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        : window.location.origin;
        
      const redirectTo = `${baseUrl}/${locale}/auth/callback`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('Google registration error:', error)
        setError(error.message)
      } else if (data.url) {
        sessionStorage.setItem('registration_intent', 'true')
        sessionStorage.setItem('selected_region_id', selectedRegionId.toString())
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Google registration error:', err)
      setError('Failed to register with Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-4">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder={t('fullName')}
              value={fullName}
              className="w-full pl-10 pr-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder={t('email')}
              value={email}
              className="w-full pl-10 pr-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder={t('password')}
              value={password}
              className="w-full pl-10 pr-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* <div>
            <label className="block text-sm font-medium mb-2">{t('region')}</label>
            <select
              value={selectedRegionId || 1}
              onChange={(e) => setSelectedRegionId(Number(e.target.value))}
              className="w-full p-2 border rounded"
              required
            >
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div> */}
          
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? t('loading') : t('createAccount')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
          </div>
        </div>

        <div className="grid">
          <button
            onClick={handleGoogleRegister}
            disabled={googleLoading}
            type="button"
            className="flex cursor-pointer items-center justify-center space-x-2 p-2 border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span className={isRTL ? 'mr-2' : ''}>
              {googleLoading ? t('loading') : t('google')}
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          {t('alreadyHaveAccount')}{' '}
          <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:underline">
            {t('signIn')}
          </Link>
        </p>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="text-sm text-center">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}