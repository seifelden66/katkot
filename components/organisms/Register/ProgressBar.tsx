'use client'

import { useRegister } from './context'

export default function ProgressBar() {
  const { currentStep } = useRegister()
  
  const totalSteps = 4

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

  return (
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
  )
}