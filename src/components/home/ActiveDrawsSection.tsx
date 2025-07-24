'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { UserDraw } from '@/types/gridotto';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import Web3 from 'web3';

export function ActiveDrawsSection() {
  const [activeDraws, setActiveDraws] = useState<UserDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const { getActiveUserDraws, getUserDrawStats } = useGridottoContract();

  useEffect(() => {
    const fetchActiveDraws = async () => {
      try {
        setLoading(true);
        const draws = await getActiveUserDraws();
        
        // Fetch detailed stats for each draw
        const detailedDraws = await Promise.all(
          draws.map(async (draw) => {
            const stats = await getUserDrawStats(draw.drawId);
            if (stats) {
              return {
                ...draw,
                prizeAmount: stats.prizePool,
                totalTicketsSold: Number(stats.totalTicketsSold),
                ticketPrice: '1000000000000000000' // 1 LYX default
              };
            }
            return draw;
          })
        );
        
        setActiveDraws(detailedDraws);
      } catch (error) {
        console.error('Error fetching active draws:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveDraws();
  }, []); // Empty dependency array - run once on mount

  const formatTimeRemaining = (endTime: string) => {
    const now = Math.floor(Date.now() / 1000);
    const end = Number(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    return `${hours}h ${minutes}m left`;
  };

  const formatPrizePool = (amount: string) => {
    try {
      return `${Web3.utils.fromWei(amount, 'ether')} LYX`;
    } catch {
      return '0 LYX';
    }
  };

  if (loading) {
    return (
      <section className="py-16">
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
      </section>
    );
  }

  if (activeDraws.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-pink-400">
            Active Community Draws
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No active draws at the moment</p>
            <Link
              href="/create-draw"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Create a Draw
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-pink-400">
          Active Community Draws
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDraws.slice(0, 6).map((draw) => (
            <div
              key={draw.drawId}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-pink-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Draw #{draw.drawId}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {formatTimeRemaining(draw.endTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-pink-400">
                    {formatPrizePool(draw.prizeAmount)}
                  </p>
                  <p className="text-xs text-gray-400">Prize Pool</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Created by</p>
                <ProfileDisplay 
                  address={draw.creator} 
                  size="sm"
                  showName={true}
                />
              </div>

              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>{draw.totalTicketsSold} tickets sold</span>
                <span>{formatPrizePool(draw.ticketPrice)} per ticket</span>
              </div>

              <Link
                href={`/draws/${draw.drawId}`}
                className="block w-full text-center py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        {activeDraws.length > 6 && (
          <div className="text-center mt-8">
            <Link
              href="/draws"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              View All Draws ({activeDraws.length})
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}