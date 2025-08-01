'use client'

import { useRegister } from '../context'
import { useTranslations } from 'next-intl'
import Input from '@/components/atoms/Input'

export default function AccountDetails() {
  const { formData, updateFormData } = useRegister()
  const t = useTranslations('auth')

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
}