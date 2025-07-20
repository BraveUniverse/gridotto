'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { DrawTypeSelector } from '@/components/create-draw/DrawTypeSelector';
import { PrizeConfiguration } from '@/components/create-draw/PrizeConfiguration';
import { DrawSettings } from '@/components/create-draw/DrawSettings';
import { Requirements } from '@/components/create-draw/Requirements';
import { ReviewAndCreate } from '@/components/create-draw/ReviewAndCreate';
import { StepIndicator } from '@/components/create-draw/StepIndicator';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { DrawData } from '@/types';

const steps = [
  { id: 1, name: 'Draw Type', description: 'Select the type of draw' },
  { id: 2, name: 'Prize Setup', description: 'Configure your prizes' },
  { id: 3, name: 'Settings', description: 'Set draw parameters' },
  { id: 4, name: 'Requirements', description: 'Add participation rules' },
  { id: 5, name: 'Review', description: 'Review and create' }
];

export default function CreateDrawPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [drawData, setDrawData] = useState<DrawData>({
    drawType: 'LYX',
    ticketPrice: 1,
    duration: 7,
    maxTickets: 100,
    requirementType: 0,
    tokenIds: [],
    winnerCount: 1
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    // TODO: Implement contract call
    console.log('Creating draw:', drawData);
    // After successful creation, redirect to draw details
    router.push('/draws');
  };

  const updateDrawData = (updates: Partial<DrawData>) => {
    setDrawData({ ...drawData, ...updates });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DrawTypeSelector drawData={drawData} updateDrawData={updateDrawData} />;
      case 2:
        return <PrizeConfiguration drawData={drawData} updateDrawData={updateDrawData} />;
      case 3:
        return <DrawSettings drawData={drawData} updateDrawData={updateDrawData} />;
      case 4:
        return <Requirements drawData={drawData} updateDrawData={updateDrawData} />;
      case 5:
        return <ReviewAndCreate drawData={drawData} onCreate={handleCreate} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return drawData.drawType !== null;
      case 2:
        if (drawData.drawType === 'LYX') return (drawData.prizeAmount || 0) > 0;
        if (drawData.drawType === 'TOKEN') return drawData.tokenAddress && (drawData.prizeAmount || 0) > 0;
        if (drawData.drawType === 'NFT') return drawData.nftContract && drawData.tokenIds && drawData.tokenIds.length > 0;
        return false;
      case 3:
        return drawData.ticketPrice > 0 && drawData.duration > 0 && drawData.maxTickets > 0;
      case 4:
        return true; // Requirements are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--background-secondary))]">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Create a <span className="gradient-text">Draw</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Set up your own lottery draw in just a few steps
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          <div className="glass-card p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {steps[currentStep - 1].name}
              </h2>
              <p className="text-gray-400">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  canProceed()
                    ? 'btn-primary'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  canProceed()
                    ? 'btn-primary'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Draw
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}