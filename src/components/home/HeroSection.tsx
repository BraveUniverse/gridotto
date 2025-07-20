'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { 
  SparklesIcon, 
  CurrencyDollarIcon,
  UsersIcon,
  TrophyIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export const HeroSection = () => {
  const { isConnected } = useUPProvider();
  const { getCurrentDrawInfo, getMonthlyDrawInfo } = useGridottoContract();
  const [weeklyPool, setWeeklyPool] = useState(0);
  const [monthlyPool, setMonthlyPool] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPools = async () => {
      try {
        setLoading(true);
        const [weekly, monthly] = await Promise.all([
          getCurrentDrawInfo(),
          getMonthlyDrawInfo()
        ]);
        
        if (weekly) setWeeklyPool(parseFloat(weekly.prizePool));
        if (monthly) setMonthlyPool(parseFloat(monthly.prizePool));
      } catch (error) {
        console.error('Error loading pools:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isConnected) {
      loadPools();
      // Refresh every 30 seconds
      const interval = setInterval(loadPools, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isConnected, getCurrentDrawInfo, getMonthlyDrawInfo]);

  const features = [
    { icon: SparklesIcon, text: 'Multi-Asset Support' },
    { icon: UsersIcon, text: 'Social Features' },
    { icon: TrophyIcon, text: 'Fair Distribution' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgb(var(--primary))/10] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[rgb(var(--accent-purple))/10] rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live on LUKSO Testnet</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="block mb-2">The Future of</span>
          <span className="block">
            <span className="text-[#FF2975]">Decentralized</span>{' '}
            <span className="text-white">Lotteries</span>
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Experience next-generation lottery platform with multi-asset support, 
          social features, and transparent prize distribution on LUKSO blockchain.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/draws" className="btn-primary group">
            <span>Explore Draws</span>
            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/create-draw" className="btn-secondary">
            Create Your Own Draw
          </Link>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <div className="glass-card p-6">
            <h3 className="text-sm text-gray-400 mb-2">Weekly Prize Pool</h3>
            {loading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{weeklyPool.toFixed(2)} LYX</p>
            )}
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm text-gray-400 mb-2">Monthly Prize Pool</h3>
            {loading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{monthlyPool.toFixed(2)} LYX</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-gray-400">
              <feature.icon className="w-5 h-5" />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/40 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};