'use client'
import Register from '@/components/Register'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

export default function RegisterPage() {
  const { isLoading } = useAuthRedirect('/')
  
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <Register />
    </div>
  )
}