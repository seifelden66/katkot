'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Input from '../atoms/Input';
import Button from '../atoms/Button';

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const locale = useLocale()
    const t = useTranslations('auth');
    const isRTL = locale === 'ar';

    useEffect(() => {
        const urlError = searchParams.get('error')

    
        if (urlError) {
            setError(getErrorText(urlError))
        }
    }, [searchParams])

  

    const getErrorText = (errorType: string) => {
        switch (errorType) {
            case 'no_code_found':
                return 'Authentication failed: No code found'
            case 'no_session_data':
                return 'Authentication failed: No session data'
            case 'callback_error':
                return 'Authentication callback error'
            default:
                return decodeURIComponent(errorType)
        }
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            })

            if (error) {
                console.error('Login error:', error)
                setError(error.message)
                return
            }

            if (data?.user) {
                console.log('Login successful:', data.user)
                router.push(`/${locale}/`)
                router.refresh()
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            setError('')
            setMessage('')
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
                console.error('Google login error:', error)
                setError(error.message)
            } else if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Google login error:', err)
            setError('Failed to login with Google')
        }
    }

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        <p className="text-sm text-center">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <p className="text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-4">
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
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? t('loading') : t('signIn')}
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
                        onClick={handleGoogleLogin}
                        type="button"
                        className="flex cursor-pointer items-center justify-center space-x-2 p-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.30-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        <span className={isRTL ? 'mr-2' : ''}>{t('google')}</span>
                    </button>
                </div>
            </div>

            <p className="text-center text-sm text-gray-600 mt-4">
                {t('dontHaveAccount')}{' '}
                <Link href={`/${locale}/auth/register`} className="text-blue-600 hover:underline">
                    {t('signUp')}
                </Link>
            </p>
        </div>
    )
}