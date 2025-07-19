'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DrawCard } from '@/components/draws/DrawCard';
import { DrawFilters } from '@/components/draws/DrawFilters';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

// Mock data - will be replaced with API calls
const mockDraws = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? 'PLATFORM' : 'USER',
  title: [
    'Weekly Mega Draw',
    'Rare NFT Collection',
    'Community Token Pool',
    'VIP Exclusive Draw',
    'Artist NFT Drop',
    'DeFi Token Lottery'
  ][i % 6],
  creator: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
  prizePool: Math.floor(Math.random() * 10000) + 100,
  ticketPrice: [0.01, 0.05, 0.1, 0.5, 1][Math.floor(Math.random() * 5)],
  ticketsSold: Math.floor(Math.random() * 5000),
  maxTickets: Math.floor(Math.random() * 5000) + 5000,
  endTime: Date.now() + Math.floor(Math.random() * 604800000), // Random time within a week
  drawType: ['LYX', 'TOKEN', 'NFT'][i % 3],
  isMultiWinner: i % 4 === 0,
  winnerCount: i % 4 === 0 ? Math.floor(Math.random() * 10) + 1 : 1,
  tokenSymbol: i % 3 === 1 ? ['USDT', 'USDC', 'DAI', 'LINK'][i % 4] : undefined,
  nftImage: i % 3 === 2 ? '/api/placeholder/400/400' : undefined
}));

type SortOption = 'endTime' | 'prizePool' | 'ticketPrice' | 'popularity';

export default function DrawsPage() {
  const [draws, setDraws] = useState(mockDraws);
  const [filteredDraws, setFilteredDraws] = useState(mockDraws);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('endTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'active',
    prizeRange: [0, 10000],
    vipRequired: false,
    followRequired: false
  });

  // Apply filters and search
  useEffect(() => {
    let filtered = [...draws];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(draw => 
        draw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draw.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(draw => {
        if (filters.type === 'platform') return draw.type === 'PLATFORM';
        if (filters.type === 'lyx') return draw.drawType === 'LYX';
        if (filters.type === 'token') return draw.drawType === 'TOKEN';
        if (filters.type === 'nft') return draw.drawType === 'NFT';
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'endTime':
          comparison = a.endTime - b.endTime;
          break;
        case 'prizePool':
          comparison = a.prizePool - b.prizePool;
          break;
        case 'ticketPrice':
          comparison = a.ticketPrice - b.ticketPrice;
          break;
        case 'popularity':
          comparison = a.ticketsSold - b.ticketsSold;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredDraws(filtered);
  }, [draws, searchQuery, filters, sortBy, sortOrder]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--background-secondary))]">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              All <span className="gradient-text">Draws</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Explore and participate in active lottery draws
            </p>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search draws..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass pl-10 w-full"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2 lg:hidden"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filters</span>
              </button>

              {['endTime', 'prizePool', 'ticketPrice', 'popularity'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSort(option as SortOption)}
                  className={`hidden md:flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option
                      ? 'bg-[rgb(var(--primary))] text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span>
                    {option === 'endTime' && 'Time Left'}
                    {option === 'prizePool' && 'Prize'}
                    {option === 'ticketPrice' && 'Price'}
                    {option === 'popularity' && 'Popular'}
                  </span>
                  {sortBy === option && (
                    sortOrder === 'asc' ? 
                      <ArrowUpIcon className="w-4 h-4" /> : 
                      <ArrowDownIcon className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <DrawFilters filters={filters} onFiltersChange={setFilters} />
            </aside>

            {/* Draws Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <p className="text-gray-400 mb-6">
                Showing {filteredDraws.length} draws
              </p>

              {/* Grid */}
              {filteredDraws.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDraws.map((draw) => (
                    <DrawCard key={draw.id} draw={draw} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-4">No draws found</p>
                  <p className="text-gray-500">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-[rgb(var(--background))] p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <DrawFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
      )}
    </div>
  );
}