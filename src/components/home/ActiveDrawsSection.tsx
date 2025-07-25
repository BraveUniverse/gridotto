'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUPProvider } from '@/hooks/useUPProvider';
import { diamondAbi } from '@/abi';
import Web3 from 'web3';

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

interface ActiveDraw {
  drawId: number;
  creator: string;
  drawType: number;
  drawTypeName: string;
  ticketPrice: string;
  ticketPrice_LYX: number;
  prizePool: string;
  prizePool_LYX: number;
  ticketsSold: number;
  participantCount: number;
  endTime: number;
  timeRemaining: number;
  isActive: boolean;
  maxTickets: number;
}

export function ActiveDrawsSection() {
  const { web3, isConnected } = useUPProvider();
  const [activeDraws, setActiveDraws] = useState<ActiveDraw[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadActiveDraws = async () => {
    if (!web3 || loading) return;

    try {
      setLoading(true);
      console.log('[ActiveDrawsSection] Loading real draws...');
      
      const contract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
      
      // Get next draw ID
      const nextDrawId = await contract.methods.getNextDrawId().call();
      console.log('[ActiveDrawsSection] Next draw ID:', nextDrawId);
      
      const draws: ActiveDraw[] = [];
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check draws 1 to nextDrawId-1
      for (let i = 1; i < Number(nextDrawId) && i <= 10; i++) {
        try {
          const drawDetails = await contract.methods.getDrawDetails(i).call();
          
          // Type guard - ensure drawDetails has the expected structure
          if (!drawDetails || typeof drawDetails !== 'object') {
            console.log(`[ActiveDrawsSection] Invalid draw details for draw #${i}`);
            continue;
          }
          
          // Check if draw is active with safe property access
          const isCompleted = (drawDetails as any).isCompleted;
          const isCancelled = (drawDetails as any).isCancelled;
          const endTime = (drawDetails as any).endTime;
          const creator = (drawDetails as any).creator;
          
          const isActive = !isCompleted && !isCancelled && Number(endTime) > currentTime;
          
          if (isActive && creator) {
            const drawTypeNames = ["LYX", "LSP7", "LSP8", "WEEKLY", "MONTHLY"];
            const endTimeBigInt = (drawDetails as any).endTime;
            const endTime = typeof endTimeBigInt === 'bigint' ? Number(endTimeBigInt) : Number(endTimeBigInt);
            const timeRemaining = Math.max(0, endTime - currentTime);
            
            // Safely convert BigInt values
            const ticketPriceBigInt = (drawDetails as any).ticketPrice;
            const ticketPriceStr = typeof ticketPriceBigInt === 'bigint' ? ticketPriceBigInt.toString() : String(ticketPriceBigInt);
            
            const prizePoolBigInt = (drawDetails as any).prizePool;
            const prizePoolStr = typeof prizePoolBigInt === 'bigint' ? prizePoolBigInt.toString() : String(prizePoolBigInt);
            
            const draw: ActiveDraw = {
              drawId: i,
              creator: creator.toString(),
              drawType: Number((drawDetails as any).drawType),
              drawTypeName: drawTypeNames[Number((drawDetails as any).drawType)] || 'UNKNOWN',
              ticketPrice: ticketPriceStr,
              ticketPrice_LYX: Number(Web3.utils.fromWei(ticketPriceStr, 'ether')),
              prizePool: prizePoolStr,
              prizePool_LYX: Number(Web3.utils.fromWei(prizePoolStr, 'ether')),
              ticketsSold: Number((drawDetails as any).ticketsSold),
              participantCount: Number((drawDetails as any).participantCount),
              endTime: endTime,
              timeRemaining: timeRemaining,
              isActive: true,
              maxTickets: Number((drawDetails as any).maxTickets)
            };
            
            draws.push(draw);
            console.log(`[ActiveDrawsSection] Active Draw #${i}:`, draw);
          }
        } catch (error) {
          console.error(`[ActiveDrawsSection] Error fetching draw #${i}:`, error);
        }
      }
      
      setActiveDraws(draws);
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('[ActiveDrawsSection] Total active draws found:', draws.length);
      
    } catch (error) {
      console.error('[ActiveDrawsSection] Error loading active draws:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load draws only once when component mounts and web3 is available
  useEffect(() => {
    if (web3 && isConnected) {
      loadActiveDraws();
    }
  }, [web3, isConnected]); // Only depend on web3 and isConnected
  
  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Ended';
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    return `${hours}h ${minutes}m left`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-pink-400 mb-4">
            Active Community Draws
          </h2>
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-gray-400">
              {lastUpdate ? `Last updated: ${lastUpdate}` : 'Loading...'}
            </p>
            <button
              onClick={loadActiveDraws}
              disabled={loading || !web3}
              className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 disabled:opacity-50 text-sm"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {loading && activeDraws.length === 0 ? (
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
        ) : activeDraws.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No active draws at the moment</p>
            <Link
              href="/create-draw"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Create a Draw
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDraws.map((draw) => (
                <div
                  key={draw.drawId}
                  className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-pink-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {draw.drawTypeName} Draw #{draw.drawId}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatTimeRemaining(draw.timeRemaining)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-400">
                        {parseFloat(draw.prizePool_LYX.toFixed(4))} LYX
                      </p>
                      <p className="text-xs text-gray-400">Prize Pool</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Created by</p>
                    <p className="text-white font-mono text-sm">
                      {formatAddress(draw.creator)}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>{draw.ticketsSold} tickets sold</span>
                    <span>{parseFloat(draw.ticketPrice_LYX.toFixed(4))} LYX per ticket</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>Participants: {draw.participantCount}</span>
                    <span>Max: {draw.maxTickets > 1000000 ? '∞' : draw.maxTickets}</span>
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

            <div className="text-center mt-8">
              <Link
                href="/draws"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                View All Draws ({activeDraws.length} active)
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}