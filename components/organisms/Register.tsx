'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import Image from 'next/image'

const AVAILABLE_INTERESTS = [
  { id: 1, name: 'Technology', icon: '💻' },
  { id: 2, name: 'Fashion', icon: '👗' },
  { id: 3, name: 'Food', icon: '🍕' },
  { id: 4, name: 'Travel', icon: '✈️' },
  { id: 5, name: 'Sports', icon: '⚽' },
  { id: 6, name: 'Music', icon: '🎵' },
  { id: 7, name: 'Art', icon: '🎨' },
  { id: 8, name: 'Books', icon: '📚' },
  { id: 9, name: 'Gaming', icon: '🎮' },
  { id: 10, name: 'Health', icon: '💪' },
  { id: 11, name: 'Photography', icon: '📸' },
  { id: 12, name: 'Movies', icon: '🎬' }
]

interface RegisterFormData {
  email: string
  password: string
  fullName: string
  bio: string
  profileImage: File | null
  interests: number[]
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    fullName: '',
    bio: '',
    profileImage: null,
    interests: []
  })

  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth')
  const isRTL = locale === 'ar'
  const selectedRegionId = 1

  const totalSteps = 4

  const updateFormData = (field: keyof RegisterFormData, value: RegisterFormData[keyof RegisterFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setError('Image size should be less than 5MB')
        return
      }
      
      updateFormData('profileImage', file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const removeImage = () => {
    updateFormData('profileImage', null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleInterest = (interestId: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const uploadProfileImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            fullName: formData.fullName.trim()
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        let avatarUrl = null

        if (formData.profileImage) {
          avatarUrl = await uploadProfileImage(formData.profileImage, data.user.id)
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: formData.fullName.trim(),
            bio: formData.bio.trim(),
            avatar_url: avatarUrl,
            subscription_plan: 'free',
            region_id: selectedRegionId || 1
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        if (formData.interests.length > 0) {
          const interestInserts = formData.interests.map(categoryId => ({
            user_id: data.user?.id,
            category_id: categoryId
          }))

          const { error: interestsError } = await supabase
            .from('user_interests')
            .insert(interestInserts)

          if (interestsError) {
            console.error('Interests creation error:', interestsError)
          }
        }

        if (!data.session) {
          setMessage(t('checkEmailConfirmation') || 'Please check your email to confirm your account.')
          setTimeout(() => {
            router.push(`/${locale}/auth/login?message=check_email`)
          }, 3000)
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      setError('')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim().length >= 2
      case 2:
        return formData.email.trim() && formData.password.length >= 6
      case 3:
        return true 
      case 4:
        return true 
      default:
        return false
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return '👤'
      case 2: return '🔐'
      case 3: return '🖼️'
      case 4: return '❤️'
      default: return '●'
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Personal Info'
      case 2: return 'Account Details'
      case 3: return 'Profile Setup'
      case 4: return 'Your Interests'
      default: return ''
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder={t('fullName') || 'Full Name'}
                value={formData.fullName}
                className="w-full px-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
                onChange={(e) => updateFormData('fullName', e.target.value)}
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder={t('email') || 'Email'}
                value={formData.email}
                className="w-full px-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder={t('password') || 'Password'}
                value={formData.password}
                className="w-full px-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
                onChange={(e) => updateFormData('password', e.target.value)}
                required
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-2xl">
                    📷
                  </div>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <span className="mr-2">📤</span>
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              
              <p className="text-sm text-gray-500 mt-2">Optional - Add a profile picture</p>
            </div>

            {/* Bio */}
            <div>
              <textarea
                placeholder="Tell us about yourself (optional)"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                className="w-full p-4 border-none rounded-2xl bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))] resize-none"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">What are you interested in?</h3>
              <p className="text-gray-600 text-sm">Select topics you&apos;d like to see content about</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    formData.interests.includes(interest.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{interest.icon}</span>
                    <span className="font-medium text-sm">{interest.name}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Selected: {formData.interests.length} interests
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all text-lg ${
                  step <= currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step < currentStep ? '✓' : getStepIcon(step)}
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">
            {getStepTitle(currentStep)}
          </h2>
          <p className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
          className={`flex items-center ${currentStep === 1 ? 'invisible' : ''}`}
        >
          <span className="mr-1">←</span>
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={!isStepValid()}
            variant="primary"
            className="flex items-center"
          >
            Next
            <span className="ml-1">→</span>
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleRegister}
            disabled={loading || !isStepValid()}
            variant="primary"
            className="flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        )}
      </div>

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