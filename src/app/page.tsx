'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useUPProvider } from '@/hooks/useUPProvider';

// Lazy load components that use hooks
const StatsSection = lazy(() => import('@/components/home/StatsSection').then(mod => ({ default: mod.StatsSection })));
const ActiveDrawsSection = lazy(() => import('@/components/home/ActiveDrawsSection').then(mod => ({ default: mod.ActiveDrawsSection })));

export default function Home() {
  const [isLoading, setIsLoading] = useState(false); // Changed to false
  const { isConnected, account } = useUPProvider();
  const router = useRouter();

  // Removed the unnecessary 2-second loading timer

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--background-secondary))]">
      <main className="relative">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Stats Section with Suspense */}
        <Suspense fallback={
          <div className="py-16 px-4">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 animate-pulse">
                    <div className="h-12 bg-white/10 rounded mb-4" />
                    <div className="h-8 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }>
          <StatsSection />
        </Suspense>
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Active Draws with Suspense */}
        <Suspense fallback={
          <div className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center text-pink-400">
                Active Community Draws
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-white/10 rounded mb-4" />
                    <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-white/10 rounded mb-4 w-1/2" />
                    <div className="h-10 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }>
          <ActiveDrawsSection />
        </Suspense>
        
        {/* How It Works */}
        <HowItWorksSection />
      </main>
      
      <Footer />
    </div>
  );
}
