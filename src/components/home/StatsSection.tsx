'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';

interface StatProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedStat = ({ label, value, suffix = '', prefix = '' }: StatProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current && value > 0) {
      hasAnimated.current = true;
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="glass-card p-8 text-center group hover:scale-105 transition-transform">
      <h3 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </h3>
      <p className="text-gray-400">{label}</p>
    </div>
  );
};

export const StatsSection = () => {
  const { isConnected } = useUPProvider();
  const { getCurrentDrawInfo, getMonthlyDrawInfo, getActiveUserDraws } = useGridottoContract();
  const [stats, setStats] = useState([
    { label: 'Total Prize Pool', value: 0, prefix: '', suffix: ' LYX' },
    { label: 'Active Draws', value: 0, prefix: '', suffix: '' },
    { label: 'Total Participants', value: 0, prefix: '', suffix: '+' },
    { label: 'Tickets Sold', value: 0, prefix: '', suffix: '+' },
  ]);

  useEffect(() => {
    const loadStats = async () => {
      if (!isConnected) return;

      try {
        const [weeklyInfo, monthlyInfo, userDraws] = await Promise.all([
          getCurrentDrawInfo(),
          getMonthlyDrawInfo(),
          getActiveUserDraws()
        ]);

        let totalPrizePool = 0;
        let totalTickets = 0;
        let activeDrawCount = 2; // Platform draws

        // Add platform draws data
        if (weeklyInfo) {
          totalPrizePool += parseFloat(weeklyInfo.prizePool);
          totalTickets += parseInt(weeklyInfo.ticketCount);
        }

        if (monthlyInfo) {
          totalPrizePool += parseFloat(monthlyInfo.prizePool);
          totalTickets += parseInt(monthlyInfo.ticketCount);
        }

        // Add user draws data
        userDraws.forEach(draw => {
          if (!draw.isCompleted) {
            activeDrawCount++;
            totalPrizePool += parseFloat(draw.currentPrizePool);
            totalTickets += parseInt(draw.ticketsSold);
          }
        });

        // Estimate unique participants (roughly 1 participant per 3 tickets)
        const estimatedParticipants = Math.floor(totalTickets / 3);

        setStats([
          { label: 'Total Prize Pool', value: Math.floor(totalPrizePool), prefix: '', suffix: ' LYX' },
          { label: 'Active Draws', value: activeDrawCount, prefix: '', suffix: '' },
          { label: 'Total Participants', value: estimatedParticipants, prefix: '', suffix: '+' },
          { label: 'Tickets Sold', value: totalTickets, prefix: '', suffix: '+' },
        ]);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
    
    // Refresh every minute
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, [isConnected, getCurrentDrawInfo, getMonthlyDrawInfo, getActiveUserDraws]);

  return (
    <section className="py-24 px-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
        }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Platform <span className="gradient-text">Statistics</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {isConnected 
              ? 'Real-time statistics from the LUKSO blockchain'
              : 'Connect your wallet to see live statistics'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};