'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DrawCard } from '@/components/draws/DrawCard';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import { UserDraw } from '@/types/gridotto';

export const ActiveDrawsSection = () => {
  const { isConnected } = useUPProvider();
  const { getActiveUserDraws } = useGridottoContract();
  const [draws, setDraws] = useState<UserDraw[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDraws = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get only real user draws from blockchain
        const userDraws = await getActiveUserDraws();
        setDraws(userDraws);
      } catch (error) {
        console.error('Error loading draws:', error);
        setDraws([]);
      } finally {
        setLoading(false);
      }
    };

    loadDraws();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDraws, 30000);
    return () => clearInterval(interval);
  }, [isConnected, getActiveUserDraws]);

  // Filter draws
  const filteredDraws = draws.filter(draw => {
    if (filter === 'all') return true;
    if (filter === 'platform') return draw.creator === '0x0000000000000000000000000000000000000000';
    if (filter === 'nft') return draw.drawType === 2;
    if (filter === 'token') return draw.drawType === 1;
    return true;
  });

  if (!isConnected) {
    return (
      <section className="py-24 px-4 relative">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Active <span className="gradient-text">Draws</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Connect your wallet to see active draws
          </p>
          <div className="glass-card p-12">
            <p className="text-gray-400">Please connect your Universal Profile to view and participate in draws</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Active <span className="text-[#FF2975]">Draws</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Participate in live draws and win amazing prizes
            </p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2 mt-6 md:mt-0">
            {['all', 'platform', 'nft', 'token'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === filterType
                    ? 'bg-[rgb(var(--primary))] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Draws Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-96 animate-pulse">
                <div className="p-6">
                  <div className="h-6 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3 mb-8"></div>
                  <div className="h-20 bg-white/10 rounded mb-6"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-white/10 rounded"></div>
                    <div className="h-16 bg-white/10 rounded"></div>
                    <div className="h-16 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDraws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredDraws.slice(0, 6).map((draw) => (
              <DrawCard key={draw.id} draw={draw} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card">
            <p className="text-gray-400 text-lg">No active draws at the moment</p>
          </div>
        )}

        {/* View All Button */}
        {filteredDraws.length > 6 && (
          <div className="text-center">
            <Link 
              href="/draws" 
              className="inline-flex items-center space-x-2 btn-primary group"
            >
              <span>View All Draws</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};