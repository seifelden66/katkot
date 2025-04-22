'use client'
import Login from '@/components/Login'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import {  useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
  // Redirect to home if already logged in
  const locale = useLocale();
  const { isLoading } = useAuthRedirect('/'+locale)
  const t = useTranslations('auth');
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('signIn')}</h1>
      <Login />
    </div>
  )
}