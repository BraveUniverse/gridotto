'use client';

import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="relative">
              {/* Step Circle */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all
                ${currentStep > step.id 
                  ? 'bg-[rgb(var(--primary))] text-white' 
                  : currentStep === step.id
                  ? 'bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-light))] text-white shadow-lg shadow-[rgb(var(--primary))/30]'
                  : 'bg-white/10 text-gray-400'
                }
              `}>
                {currentStep > step.id ? (
                  <CheckIcon className="w-6 h-6" />
                ) : (
                  step.id
                )}
              </div>
              
              {/* Step Name - Desktop */}
              <div className="hidden md:block absolute top-14 left-1/2 transform -translate-x-1/2 w-32 text-center">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.name}
                </p>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-full h-0.5 mx-4 lg:mx-8">
                <div className="h-full bg-white/10 relative">
                  <div 
                    className={`absolute h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-light))] transition-all duration-500`}
                    style={{ width: currentStep > step.id ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile Step Name */}
      <div className="md:hidden mt-6 text-center">
        <p className="text-white font-medium">
          Step {currentStep}: {steps[currentStep - 1]?.name}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
};