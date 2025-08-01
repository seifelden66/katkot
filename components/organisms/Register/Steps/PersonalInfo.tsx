'use client'

import { useRegister } from '../context'
import Input from '@/components/atoms/Input'

export default function PersonalInfo() {
  const { formData, updateFormData } = useRegister()

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          className="w-full px-4 py-3 border-none rounded-full bg-[hsl(var(--muted))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all text-[hsl(var(--foreground))]"
          onChange={(e) => updateFormData('fullName', e.target.value)}
          required
        />
      </div>
    </div>
  )
}