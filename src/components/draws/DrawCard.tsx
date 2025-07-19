'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ClockIcon, 
  TicketIcon, 
  UserGroupIcon,
  PhotoIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface DrawProps {
  draw: {
    id: number;
    type: 'PLATFORM' | 'USER';
    title: string;
    creator: string;
    prizePool: number;
    ticketPrice: number;
    ticketsSold: number;
    maxTickets: number;
    endTime: number;
    drawType: 'LYX' | 'TOKEN' | 'NFT';
    isMultiWinner?: boolean;
    winnerCount?: number;
    tokenSymbol?: string;
    nftImage?: string;
  };
}

export const DrawCard = ({ draw }: DrawProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = draw.endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [draw.endTime]);

  const progress = (draw.ticketsSold / draw.maxTickets) * 100;

  return (
    <Link href={`/draw/${draw.id}`}>
      <div className="glass-card h-full group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1 line-clamp-1">
                {draw.title}
              </h3>
              <p className="text-sm text-gray-400">by {draw.creator}</p>
            </div>
            {/* Type Badge */}
            <div className={`badge ${
              draw.drawType === 'TOKEN' ? 'badge-token' : 
              draw.drawType === 'NFT' ? 'badge-nft' : 
              'bg-[rgb(var(--primary))/15] text-[rgb(var(--primary))] border-[rgb(var(--primary))/30]'
            }`}>
              {draw.drawType}
            </div>
          </div>

          {/* Prize Display */}
          <div className="mb-4">
            {draw.drawType === 'NFT' && draw.nftImage ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
                <Image 
                  src={draw.nftImage} 
                  alt="NFT Prize" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 mb-1">Prize Pool</p>
                <p className="text-3xl font-bold gradient-text">
                  {draw.drawType === 'TOKEN' ? (
                    `${draw.prizePool.toLocaleString()} ${draw.tokenSymbol}`
                  ) : (
                    `${draw.prizePool.toFixed(2)} LYX`
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-400 mb-1">
                <TicketIcon className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-white">{draw.ticketPrice} LYX</p>
              <p className="text-xs text-gray-400">Per ticket</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-400 mb-1">
                <UserGroupIcon className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-white">{draw.ticketsSold}</p>
              <p className="text-xs text-gray-400">Sold</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-400 mb-1">
                <ClockIcon className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-white">{timeLeft}</p>
              <p className="text-xs text-gray-400">Left</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{draw.ticketsSold} / {draw.maxTickets}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-light))] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Multi-Winner Badge */}
          {draw.isMultiWinner && (
            <div className="flex items-center justify-center space-x-2 text-green-400 text-sm">
              <UserGroupIcon className="w-4 h-4" />
              <span>{draw.winnerCount} Winners</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white/5 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {draw.type === 'PLATFORM' ? 'Official Draw' : 'Community Draw'}
            </span>
            <span className="text-sm text-[rgb(var(--primary))] group-hover:translate-x-1 transition-transform inline-flex items-center">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};