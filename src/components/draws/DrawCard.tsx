'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserDraw } from '@/types/gridotto';
import Web3 from 'web3';
import { 
  ClockIcon, 
  TicketIcon, 
  UsersIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  SparklesIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import { useNFTMetadata } from '@/hooks/useNFTMetadata';

interface DrawCardProps {
  draw: UserDraw;
}

const drawTypeConfig: Record<number, { icon: any; label: string; color: string }> = {
  0: { // LYX
    icon: CurrencyDollarIcon,
    label: 'LYX Prize',
    color: 'from-blue-500 to-cyan-500'
  },
  1: { // LSP7 Token
    icon: SparklesIcon,
    label: 'Token Prize',
    color: 'from-purple-500 to-pink-500'
  },
  2: { // LSP8 NFT
    icon: PhotoIcon,
    label: 'NFT Prize',
    color: 'from-pink-500 to-rose-500'
  }
};

export const DrawCard = ({ draw }: DrawCardProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);
  const { profileData } = useLSP3Profile(draw.creator);
  
  // Fetch NFT metadata for NFT draws
  const isNFTDraw = draw.prizeType === 'LSP8' || (typeof draw.prizeType === 'number' && draw.prizeType === 2);
  const nftMetadata = useNFTMetadata(
    isNFTDraw ? (draw.prizeAddress || '') : '', 
    isNFTDraw ? (draw.tokenIds || []) : []
  );

  const config = drawTypeConfig[draw.prizeType === 'LYX' ? 0 : draw.prizeType === 'LSP7' ? 1 : 2] || drawTypeConfig[0];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = typeof draw.endTime === 'string' ? parseInt(draw.endTime) : Number(draw.endTime);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(interval);
  }, [draw.endTime]);

  useEffect(() => {
    const ticketsSold = draw.totalTicketsSold;
    const maxTickets = draw.maxTickets;
    
    if (maxTickets > 0) {
      setProgress((ticketsSold / maxTickets) * 100);
    }
  }, [draw.totalTicketsSold, draw.maxTickets]);

  const prizeAmount = draw.prizeAmount || '0';
  const prizeInLYX = Web3.utils.fromWei(prizeAmount, 'ether');
  const ticketPriceInLYX = Web3.utils.fromWei(draw.ticketPrice, 'ether');
  const prizePoolInLYX = Web3.utils.fromWei(draw.prizeAmount, 'ether');

  return (
    <Link href={`/draws/${draw.drawId}`}>
      <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full border border-white/10 hover:border-white/20">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
        
        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                <config.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Draw #{draw.drawId}</h3>
                <p className="text-xs text-gray-400">{config.label}</p>
              </div>
            </div>
            {draw.isActive ? (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Active
              </div>
            ) : (
              <div className="text-xs text-gray-500">Ended</div>
            )}
          </div>

          {/* NFT Image for NFT draws */}
          {isNFTDraw && nftMetadata.image && !nftMetadata.loading && (
            <div className="mb-4">
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={nftMetadata.image}
                  alt={nftMetadata.name || 'NFT Prize'}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <p className="text-white text-sm font-medium truncate max-w-[200px]">
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
          {isNFTDraw && nftMetadata.loading && (
            <div className="mb-4">
              <div className="w-full h-32 rounded-lg bg-gray-800 animate-pulse flex items-center justify-center">
                <PhotoIcon className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          )}

          {/* Prize Pool */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5 text-primary" />
              <span className="text-sm text-gray-400">Prize Pool</span>
              <div className="group relative">
                <InformationCircleIcon className="w-4 h-4 text-gray-500 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Prize pool shows amount after platform fees
                </div>
              </div>
            </div>
            <span className="text-lg font-bold text-primary">
              {prizePoolInLYX} LYX
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TicketIcon className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-400">Ticket Price</p>
              </div>
              <p className="text-sm font-medium text-white">{ticketPriceInLYX} LYX</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <UsersIcon className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-400">Participants</p>
              </div>
              <p className="text-sm font-medium text-white">{draw.participants?.length || 0}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Tickets Sold</span>
              <span>{draw.totalTicketsSold} / {draw.maxTickets}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Creator & Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProfileDisplay address={draw.creator} size="sm" />
              <div>
                <p className="text-xs text-gray-400">Created by</p>
                <p className="text-xs font-medium text-white">
                  {profileData?.name || `${draw.creator.slice(0, 6)}...${draw.creator.slice(-4)}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Hover effect arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightIcon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Link>
  );
};