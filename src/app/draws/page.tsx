'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DrawCard } from '@/components/draws/DrawCard';
import { DrawFilters } from '@/components/draws/DrawFilters';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import { UserDraw } from '@/types/gridotto';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

type SortOption = 'endTime' | 'prizePool' | 'ticketPrice' | 'popularity';

export default function DrawsPage() {
  const { isConnected } = useUPProvider();
  const { getActiveUserDraws, getCurrentDrawInfo, getMonthlyDrawInfo, getContractInfo } = useGridottoContract();
  const [draws, setDraws] = useState<UserDraw[]>([]);
  const [filteredDraws, setFilteredDraws] = useState<UserDraw[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('endTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'active',
    prizeRange: [0, 10000],
    drawType: 'all'
  });

  // Load draws from blockchain
  useEffect(() => {
    const loadDraws = async () => {
      if (!isConnected) return;

      try {
        setLoading(true);
        
        // Get only real user draws from blockchain
        const userDraws = await getActiveUserDraws();
        setDraws(userDraws);
      } catch (error) {
        console.error('Error loading draws:', error);
        setDraws([]);
      } finally {
        setLoading(false);
      }
    };

    loadDraws();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDraws, 30000);
    return () => clearInterval(interval);
  }, [isConnected, getActiveUserDraws]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...draws];

    // Search filter - search by creator address or draw ID
    if (searchQuery) {
      filtered = filtered.filter(draw => 
        draw.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draw.id.toString().includes(searchQuery)
      );
    }

    // Draw type filter
    if (filters.drawType !== 'all') {
      const typeMap = { 'LYX': 0, 'TOKEN': 1, 'NFT': 2 };
      filtered = filtered.filter(draw => draw.drawType === typeMap[filters.drawType as keyof typeof typeMap]);
    }

    // Status filter
    if (filters.status === 'active') {
      filtered = filtered.filter(draw => !draw.isCompleted);
    } else if (filters.status === 'completed') {
      filtered = filtered.filter(draw => draw.isCompleted);
    }

    // Prize range filter
    filtered = filtered.filter(draw => {
      const prize = parseFloat(draw.currentPrizePool);
      return prize >= filters.prizeRange[0] && prize <= filters.prizeRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'endTime':
          comparison = parseInt(a.endTime) - parseInt(b.endTime);
          break;
        case 'prizePool':
          comparison = parseFloat(a.currentPrizePool) - parseFloat(b.currentPrizePool);
          break;
        case 'ticketPrice':
          comparison = parseFloat(a.ticketPrice) - parseFloat(b.ticketPrice);
          break;
        case 'popularity':
          comparison = parseInt(a.ticketsSold) - parseInt(b.ticketsSold);
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
              {isConnected 
                ? 'Explore and participate in active lottery draws'
                : 'Connect your wallet to view and participate in draws'
              }
            </p>
          </div>

          {!isConnected ? (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-400 text-lg">Please connect your Universal Profile to view draws</p>
            </div>
          ) : (
            <>
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
                    {loading ? 'Loading draws...' : `Showing ${filteredDraws.length} draws`}
                  </p>

                  {/* Grid */}
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-card h-96 animate-pulse">
                          <div className="p-6">
                            <div className="h-6 bg-white/10 rounded mb-4"></div>
                            <div className="h-4 bg-white/10 rounded w-2/3 mb-8"></div>
                            <div className="h-20 bg-white/10 rounded mb-6"></div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="h-16 bg-white/10 rounded"></div>
                              <div className="h-16 bg-white/10 rounded"></div>
                              <div className="h-16 bg-white/10 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredDraws.length > 0 ? (
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
            </>
          )}
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