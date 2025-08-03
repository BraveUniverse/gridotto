'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoCoreV2 } from '@/hooks/useGridottoCoreV2';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { useNFTMetadata } from '@/hooks/useNFTMetadata';
import { CONTRACTS } from '@/config/contracts';
import Web3 from 'web3';

const PLATFORM_ADDRESSES = [
  CONTRACTS.LUKSO_TESTNET.DIAMOND.toLowerCase(),
  CONTRACTS.LUKSO_TESTNET.GRIDOTTO_CORE_V2_FACET.toLowerCase(),
  CONTRACTS.LUKSO_TESTNET.GRIDOTTO_PLATFORM_DRAWS_FACET.toLowerCase()
];

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
  executorFee_LYX?: number;
  isPlatformDraw?: boolean;
  nftContract?: string;
  tokenIds?: string[];
}

export function ActiveDrawsSection() {
  const { web3, isConnected } = useUPProvider();
  const { getActiveDraws } = useGridottoCoreV2();
  const [activeDraws, setActiveDraws] = useState<ActiveDraw[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadActiveDraws = async () => {
    if (!web3 || loading) return;

    try {
      setLoading(true);
      console.log('[ActiveDrawsSection] Loading active draws using hook...');
      
      // Use the hook's getActiveDraws function
      const hookDraws = await getActiveDraws();
      console.log('[ActiveDrawsSection] Hook returned draws:', hookDraws);
      
      const draws: ActiveDraw[] = [];
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Process draws from hook
      hookDraws.forEach((drawDetails: any) => {
        if (!drawDetails) return;
        
        const endTime = Number(drawDetails.endTime);
        const isActive = !drawDetails.isCompleted && !drawDetails.isCancelled && endTime > currentTime;
        
        if (isActive && drawDetails.creator) {
          const drawTypeNames = ["LYX", "LSP7", "LSP8", "WEEKLY", "MONTHLY"];
          const drawType = Number(drawDetails.drawType);
          const timeRemaining = Math.max(0, endTime - currentTime);
          
          const draw: ActiveDraw = {
            drawId: drawDetails.drawId,
            creator: drawDetails.creator.toString(),
            drawType: drawType,
            drawTypeName: drawDetails.drawTypeName || drawTypeNames[drawType] || 'UNKNOWN',
            ticketPrice: drawDetails.ticketPrice,
            ticketPrice_LYX: drawDetails.ticketPrice_LYX || 0, // Use hook's conversion
            prizePool: drawDetails.prizePool,
            prizePool_LYX: drawDetails.prizePool_LYX || 0, // Use hook's conversion
            ticketsSold: Number(drawDetails.ticketsSold),
            participantCount: Number(drawDetails.participantCount),
            endTime: endTime,
            timeRemaining: timeRemaining,
            isActive: true,
            maxTickets: Number(drawDetails.maxTickets),
            executorFee_LYX: drawDetails.executorFee_LYX || 0, // Use hook's conversion
            isPlatformDraw: drawType === 3 || drawType === 4, // WEEKLY or MONTHLY
            nftContract: drawDetails.nftContract,
            tokenIds: drawDetails.tokenIds
          };
          
          draws.push(draw);
          console.log(`[ActiveDrawsSection] Processed Draw #${drawDetails.drawId}:`, draw);
        }
      });
      
      // Sort draws: Platform draws first, then by ending time
      draws.sort((a, b) => {
        if (a.isPlatformDraw && !b.isPlatformDraw) return -1;
        if (!a.isPlatformDraw && b.isPlatformDraw) return 1;
        return a.timeRemaining - b.timeRemaining; // Ending soonest first
      });
      
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

  // NFTDrawCard component for NFT draws
  const NFTDrawCard = ({ draw }: { draw: ActiveDraw }) => {
    const nftMetadata = useNFTMetadata(
      draw.nftContract || '', 
      draw.tokenIds || []
    );

    return (
      <div
        className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all ${
          draw.isPlatformDraw 
            ? 'border-yellow-500/50 hover:border-yellow-500/70 ring-2 ring-yellow-500/20' 
            : 'border-white/10 hover:border-pink-500/50'
        }`}
      >
        {draw.isPlatformDraw && (
          <div className="mb-4 text-center">
            <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
              🏆 PLATFORM DRAW
            </span>
          </div>
        )}
        
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

        {/* NFT Image */}
        {nftMetadata.image && !nftMetadata.loading && (
          <div className="mb-4">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-800">
              <Image
                src={nftMetadata.image}
                alt={nftMetadata.name || 'NFT Prize'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-2">
                <p className="text-white text-sm font-medium truncate max-w-[180px]">
                  {nftMetadata.name || 'NFT Prize'}
                </p>
                {draw.tokenIds && draw.tokenIds.length > 1 && (
                  <p className="text-gray-300 text-xs">
                    +{draw.tokenIds.length - 1} more
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NFT Loading State */}
        {nftMetadata.loading && (
          <div className="mb-4">
            <div className="w-full h-32 rounded-lg bg-gray-800 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 rounded bg-gray-700"></div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Created by</p>
          {draw.isPlatformDraw || PLATFORM_ADDRESSES.includes(draw.creator.toLowerCase()) ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              <span className="text-white font-medium">Gridotto</span>
            </div>
          ) : (
            <ProfileDisplay address={draw.creator} size="sm" showName={true} />
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <span>{draw.ticketsSold} tickets sold</span>
          <span>{parseFloat(draw.ticketPrice_LYX.toFixed(4))} LYX per ticket</span>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>Participants: {draw.participantCount}</span>
          <span>Max: {draw.maxTickets > 1000000 ? '∞' : draw.maxTickets}</span>
        </div>

        {draw.executorFee_LYX && draw.executorFee_LYX > 0 && (
          <div className="text-center mb-4 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-400">
              🎯 Executor Reward: {draw.executorFee_LYX.toFixed(4)} LYX
            </p>
          </div>
        )}

        <Link href={`/draws/${draw.drawId}`}>
          <button className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105">
            View Draw
          </button>
        </Link>
      </div>
    );
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-pink-400 mb-4">
            Active Draws
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
                <NFTDrawCard key={draw.drawId} draw={draw} />
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