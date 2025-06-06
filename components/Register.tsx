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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName: fullName
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          subscription_plan: 'free',
          region_id: selectedRegionId || 1
        })

      if (profileError) {
        setMessage('Confirm your email and try again.')
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
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

        <p className="text-center text-sm text-gray-600">
          {t('alreadyHaveAccount')}{' '}
          <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:underline">
            {t('signIn')}
          </Link>
        </p>

        {message && <p className="text-center text-sm mt-2 text-blue-500">{message}</p>}
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
    </div>
  )
}