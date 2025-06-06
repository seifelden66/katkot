'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import Input from './atoms/Input';
import Button from './atoms/Button';

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations('auth');
    const isRTL = locale === 'ar';

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            Cookies.set('sb-access-token', data.session.access_token, {
                expires: data.session.expires_in / 86400, 
                secure: true,
                sameSite: 'Lax'
            })
            router.push('/'+locale+'/')
        }
    }

    const handleGoogleLogin = async () => {
        const redirectTo = 
          `${window.location.origin}/${locale}/auth/callback`
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo }
        })
        if (error) {
          console.error(error)
        } else if (data.url) {
          router.push(data.url)
        }
    }

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
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

                <div className="grid ">
                    <button
                        onClick={handleGoogleLogin}
                        className="flex cursor-pointer items-center justify-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        <span className={isRTL ? 'mr-2' : ''}>{t('google')}</span>
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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