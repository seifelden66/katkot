'use client'

import { useRegister } from '../context'

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

export default function Interests() {
  const { formData, toggleInterest } = useRegister()

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
}