'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'

interface Region {
  id: number;
  name: string;
}

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
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(1) 
  
  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching regions:', error)
        throw error
      }
      return data || []
    }
  })
  
  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   setError('')
  //   setMessage('')

  //   try {
  //     // First check if email exists
  //     const { data: existingUsers } = await supabase
  //       .from('auth.users')
  //       .select('email')
  //       .eq('email', email)
  //       .limit(1)
      
  //     if (existingUsers && existingUsers.length > 0) {
  //       setError('This email is already registered')
  //       setLoading(false)
  //       return
  //     }

  //     // If email doesn't exist, proceed with signup
  //     const { data, error: signUpError } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         data: {
  //           fullName,
  //           regionId: selectedRegionId
  //         }
  //       }
  //     })

  //     if (signUpError) {
  //       setError(signUpError.message)
  //     } else if (data.user) {
  //       if (data.session) {
  //         // Successfully signed in, redirect to dashboard
  //         router.push('/dashboard')
  //       } else {
  //         // Email confirmation required
  //         setMessage('Please check your email to confirm your account')
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Registration error:', err)
  //     setError('An unexpected error occurred')
  //   } finally {
  //     setLoading(false)
  //   }
  // }
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
            <input
              type="text"
              placeholder={t('fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
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
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? t('loading') : t('createAccount')}
          </button>
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