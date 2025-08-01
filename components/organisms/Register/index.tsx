'use client'

import { useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { RegisterProvider, useRegister } from './context'
import ProgressBar from './ProgressBar'
import StepNavigation from './ProgressBar'
import PersonalInfo from './Steps/PersonalInfo'
import AccountDetails from './Steps/AccountDetails'
import ProfileSetup from './Steps/ProfileSetup'
import Interests from './Steps/Interests'

function RegisterContent() {
  const { 
    currentStep, 
    error, 
    message,
  } = useRegister()
  
  const locale = useLocale()
  const t = useTranslations('auth')
  const isRTL = locale === 'ar'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PersonalInfo />
      case 2: return <AccountDetails />
      case 3: return <ProfileSetup fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>} />
      case 4: return <Interests />
      default: return null
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-md mx-auto">
      <ProgressBar />

      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      <StepNavigation />

      <p className="text-center text-sm text-gray-600 mt-6">
        {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
        <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:underline">
          {t('signIn') || 'Sign In'}
        </Link>
      </p>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mt-4">
          <p className="text-sm text-center">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
          <p className="text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  )
}

export default function Register() {
  return (
    <RegisterProvider>
      <RegisterContent />
    </RegisterProvider>
  )
}