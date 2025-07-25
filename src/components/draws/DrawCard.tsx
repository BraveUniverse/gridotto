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
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { useProfile } from '@/hooks/useProfile';

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
  const { profile } = useProfile(draw.creator);

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

          {/* Prize Pool */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Prize Pool</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              {prizeInLYX} LYX
            </p>
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
                  {profile?.name || `${draw.creator.slice(0, 6)}...${draw.creator.slice(-4)}`}
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