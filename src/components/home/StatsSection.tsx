'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

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
    if (isInView && !hasAnimated.current) {
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
  const stats = [
    { label: 'Total Prize Pool', value: 50000, prefix: '', suffix: ' LYX' },
    { label: 'Active Users', value: 12500, prefix: '', suffix: '+' },
    { label: 'Draws Created', value: 3200, prefix: '', suffix: '' },
    { label: 'Winners Paid', value: 8900, prefix: '', suffix: '+' },
  ];

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
            Join thousands of users already experiencing the future of decentralized lotteries
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