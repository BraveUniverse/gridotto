'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DrawCard } from '@/components/draws/DrawCard';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Mock data - gerçek veriler API'den gelecek
const mockDraws = [
  {
    id: 1,
    type: 'PLATFORM',
    title: 'Weekly Mega Draw',
    creator: '0x1234...5678',
    prizePool: 1250.5,
    ticketPrice: 0.1,
    ticketsSold: 8500,
    maxTickets: 10000,
    endTime: Date.now() + 86400000, // 1 day
    drawType: 'LYX',
    isMultiWinner: false
  },
  {
    id: 2,
    type: 'USER',
    title: 'Rare NFT Giveaway',
    creator: '0xabcd...efgh',
    prizePool: 0,
    ticketPrice: 0.05,
    ticketsSold: 150,
    maxTickets: 500,
    endTime: Date.now() + 172800000, // 2 days
    drawType: 'NFT',
    isMultiWinner: false,
    nftImage: '/api/placeholder/400/400'
  },
  {
    id: 3,
    type: 'USER',
    title: 'Community Token Draw',
    creator: '0x9876...5432',
    prizePool: 50000,
    ticketPrice: 0.01,
    ticketsSold: 3200,
    maxTickets: 5000,
    endTime: Date.now() + 259200000, // 3 days
    drawType: 'TOKEN',
    isMultiWinner: true,
    winnerCount: 10,
    tokenSymbol: 'COMM'
  }
];

export const ActiveDrawsSection = () => {
  const [draws, setDraws] = useState(mockDraws);
  const [filter, setFilter] = useState('all');

  const filteredDraws = draws.filter(draw => {
    if (filter === 'all') return true;
    if (filter === 'platform') return draw.type === 'PLATFORM';
    if (filter === 'nft') return draw.drawType === 'NFT';
    if (filter === 'token') return draw.drawType === 'TOKEN';
    return true;
  });

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Active <span className="gradient-text">Draws</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredDraws.map((draw) => (
            <DrawCard key={draw.id} draw={draw} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            href="/draws" 
            className="inline-flex items-center space-x-2 btn-primary group"
          >
            <span>View All Draws</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};