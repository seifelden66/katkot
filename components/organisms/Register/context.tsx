'use client'

import { createContext, useContext, ReactNode, useState } from 'react'

interface RegisterFormData {
  email: string
  password: string
  fullName: string
  bio: string
  profileImage: File | null
  interests: number[]
}

interface RegisterContextType {
  currentStep: number
  formData: RegisterFormData
  loading: boolean
  error: string
  message: string
  imagePreview: string
  setCurrentStep: (step: number) => void
  updateFormData: (field: keyof RegisterFormData, value: RegisterFormData[keyof RegisterFormData]) => void
  nextStep: () => void
  prevStep: () => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: () => void
  toggleInterest: (interestId: number) => void
  handleRegister: () => Promise<void>
  isStepValid: () => boolean
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined)

export const useRegister = () => {
  const context = useContext(RegisterContext)
  if (!context) {
    throw new Error('useRegister must be used within a RegisterProvider')
  }
  return context
}

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')  
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    fullName: '',
    bio: '',
    profileImage: null,
    interests: []
  })

  // Move all the functions from Register.tsx here
  // ...

  return (
    <RegisterContext.Provider value={{
      currentStep,
      formData,
      loading,
      error,
      message,
      imagePreview,
      setCurrentStep,
      updateFormData: (field: keyof RegisterFormData, value: RegisterFormData[keyof RegisterFormData]) => {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }))
      },
      nextStep: () => {
        setCurrentStep(prev => Math.min(4, prev + 1))
      },
      prevStep: () => {
        setCurrentStep(prev => Math.max(1, prev - 1))
      },
      handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setImagePreview(reader.result as string)
          }
          reader.readAsDataURL(file)
          setFormData(prev => ({
            ...prev,
            profileImage: file
          }))
        }
      },
      removeImage: () => {
        setImagePreview('')
        setFormData(prev => ({
          ...prev,
          profileImage: null
        }))
      },
      toggleInterest: (interestId: number) => {
        setFormData(prev => ({
          ...prev,
          interests: prev.interests.includes(interestId)
            ? prev.interests.filter(id => id !== interestId)
            : [...prev.interests, interestId]
        }))
      },
      handleRegister: async () => {
        try {
          setLoading(true)
          setError('')
          setMessage('')
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          setMessage('Registration successful!')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Registration failed')
        } finally {
          setLoading(false)
        }
      },
      isStepValid: () => {
        switch (currentStep) {
          case 1:
            return formData.email !== '' && formData.password !== '';
          case 2:
            return formData.fullName !== '';
          case 3:
            return formData.bio !== '';
          case 4:
            return formData.interests.length > 0;
          default:
            return false;
        }
      }
    }}>
      {children}
    </RegisterContext.Provider>
  )
}