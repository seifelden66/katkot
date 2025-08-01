'use client'

import { useRegister } from '../context'
import Image from 'next/image'

interface ProfileSetupProps {
  fileInputRef: React.RefObject<HTMLInputElement>
}

export default function ProfileSetup({ fileInputRef }: ProfileSetupProps) {
  const { formData, updateFormData, imagePreview, handleImageUpload, removeImage } = useRegister()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4">
          {imagePreview ? (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="Profile preview"
                width={96}
                height={96}
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
}