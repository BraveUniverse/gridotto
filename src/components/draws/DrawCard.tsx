'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserDraw } from '@/types/gridotto';
import Web3 from 'web3';
import { 
  ClockIcon, 
  TicketIcon, 
  UsersIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';

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

  const config = drawTypeConfig[draw.prizeType === 'LYX' ? 0 : draw.prizeType === 'LSP7' ? 1 : 2] || drawTypeConfig[0];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = parseInt(draw.endTime);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [draw.endTime]);

  useEffect(() => {
    const ticketsSold = draw.totalTicketsSold;
    const maxTickets = draw.maxTickets;
    
    if (maxTickets > 0) {
      setProgress((ticketsSold / maxTickets) * 100);
    }
  }, [draw.totalTicketsSold, draw.maxTickets]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const Icon = config.icon;

  return (
    <Link href={`/draws/${draw.drawId}`}>
      <div className="glass-card glass-card-hover h-full p-6 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} bg-opacity-20`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs text-gray-400">Draw #{draw.drawId}</span>
              <h3 className="font-semibold text-white">{config.label}</h3>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className={timeLeft === 'Ended' ? 'text-red-400' : 'text-gray-300'}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Prize Pool */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Prize Pool</p>
          <p className="text-3xl font-bold text-[#FF2975]">
            {Web3.utils.fromWei(draw.prizeAmount, 'ether')} LYX
          </p>
        </div>

        {/* Creator */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Created by</p>
          <ProfileDisplay 
            address={draw.creator} 
            size="sm"
            showName={true}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <TicketIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Ticket Price</p>
              <p className="font-semibold text-white">{draw.ticketPrice} LYX</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <UsersIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Participants</p>
              <p className="font-semibold text-white">{draw.totalTicketsSold}</p>
            </div>
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
              className="h-full bg-gradient-to-r from-[#FF2975] to-[#FF2975]/50 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Multi-winner indicator */}
        {false && (
          <div className="flex items-center space-x-2 text-sm">
            <TrophyIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">Multiple Winners</span>
          </div>
        )}

        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF2975]/0 to-[#FF2975]/0 group-hover:from-[#FF2975]/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
      </div>
    </Link>
  );
};