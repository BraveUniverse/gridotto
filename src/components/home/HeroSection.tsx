'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SparklesIcon, TicketIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import Web3 from 'web3';

export const HeroSection = () => {
  const { isConnected } = useUPProvider();
  const { getContractInfo, getActiveUserDraws, getUserDrawStats } = useGridottoContract();
  const [totalPrizePool, setTotalPrizePool] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrizePool = async () => {
      try {
        // Get contract balance
        const contractInfo = await getContractInfo();
        
        // Get active draws and sum their prize pools
        const activeDraws = await getActiveUserDraws();
        let userDrawPrizePool = BigInt(0);
        
        for (const draw of activeDraws) {
          const stats = await getUserDrawStats(draw.drawId);
          if (stats) {
            userDrawPrizePool += BigInt(stats.prizePool);
          }
        }
        
        // Total prize pool is contract balance + user draw prize pools
        const contractBalance = contractInfo ? BigInt(contractInfo.totalPrizePool) : BigInt(0);
        const total = contractBalance + userDrawPrizePool;
        
        setTotalPrizePool(Web3.utils.fromWei(total.toString(), 'ether'));
      } catch (error) {
        console.error('Error fetching prize pool:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrizePool();
    
    // Refresh every minute
    const interval = setInterval(fetchPrizePool, 60000);
    return () => clearInterval(interval);
  }, [getContractInfo, getActiveUserDraws, getUserDrawStats]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Future of
            <span className="block text-pink-400 mt-2">
              Decentralized Lottery
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Play fair, win big, and be part of the revolution on LUKSO blockchain
          </p>

          {/* Prize Pool Display */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-12 max-w-md mx-auto border border-white/10">
            <p className="text-gray-400 mb-2">Total Prize Pool</p>
            <p className="text-4xl md:text-5xl font-bold text-pink-400">
              {loading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `${totalPrizePool} LYX`
              )}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isConnected ? (
              <>
                <Link
                  href="/draws"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <TicketIcon className="w-6 h-6" />
                  Buy Tickets
                </Link>
                <Link
                  href="/create-draw"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
                >
                  <SparklesIcon className="w-6 h-6" />
                  Create Draw
                </Link>
              </>
            ) : (
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Connect Wallet to Start
              </button>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <SparklesIcon className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fair & Transparent</h3>
              <p className="text-gray-400 text-sm">
                Powered by smart contracts with verifiable randomness
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TicketIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Draws</h3>
              <p className="text-gray-400 text-sm">
                Official and community-created draws with various prizes
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TrophyIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Payouts</h3>
              <p className="text-gray-400 text-sm">
                Winners receive prizes automatically to their profiles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};