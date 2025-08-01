'use client'

import { useRegister } from './context'
import Button from '@/components/atoms/Button'

export default function StepNavigation() {
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    isStepValid, 
    handleRegister, 
    loading 
  } = useRegister()
  
  const totalSteps = 4

  return (
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
  )
}