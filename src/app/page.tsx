'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ActiveDrawsSection } from '@/components/home/ActiveDrawsSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useUPProvider } from '@/hooks/useUPProvider';

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
        
        {/* Stats Section */}
        <StatsSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Active Draws */}
        <ActiveDrawsSection />
        
        {/* How It Works */}
        <HowItWorksSection />
      </main>
      
      <Footer />
    </div>
  );
}
