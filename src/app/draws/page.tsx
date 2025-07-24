'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DrawCard } from '@/components/draws/DrawCard';
import { DrawFilters } from '@/components/draws/DrawFilters';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { UserDraw } from '@/types/gridotto';
import Link from 'next/link';
import { 
  SparklesIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function DrawsPage() {
  const { isConnected } = useUPProvider();
  const { getActiveUserDraws, getUserDrawStats, getOfficialDrawInfo } = useGridottoContract();
  const [draws, setDraws] = useState<UserDraw[]>([]);
  const [filteredDraws, setFilteredDraws] = useState<UserDraw[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'active' | 'completed',
    type: 'all' as 'all' | 'lyx' | 'token' | 'nft',
    sortBy: 'endTime' as 'endTime' | 'prizePool' | 'participants',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [loading, setLoading] = useState(true);
  const [officialDrawInfo, setOfficialDrawInfo] = useState<any>(null);

  useEffect(() => {
    const loadDraws = async () => {
      try {
        setLoading(true);
        
        // Get active draws
        const activeDraws = await getActiveUserDraws();
        
        // Fetch detailed stats for each draw
        const detailedDraws = await Promise.all(
          activeDraws.map(async (draw) => {
            const stats = await getUserDrawStats(draw.drawId);
            if (stats) {
              return {
                ...draw,
                prizeAmount: stats.prizePool,
                totalTicketsSold: Number(stats.totalTicketsSold),
                ticketPrice: '1000000000000000000' // 1 LYX default
              };
            }
            return draw;
          })
        );
        
        setDraws(detailedDraws);
        setFilteredDraws(detailedDraws);
        
        // Get official draw info
        const official = await getOfficialDrawInfo();
        setOfficialDrawInfo(official);
      } catch (error) {
        console.error('Error loading draws:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isConnected) {
      loadDraws();
    } else {
      setLoading(false);
    }
  }, [isConnected, getActiveUserDraws, getUserDrawStats, getOfficialDrawInfo]);

  useEffect(() => {
    let filtered = [...draws];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(draw => 
        draw.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draw.drawId.toString().includes(searchQuery)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(draw => {
        if (filters.status === 'active') return draw.isActive;
        if (filters.status === 'completed') return !draw.isActive;
        return true;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(draw => {
        if (filters.type === 'lyx') return draw.prizeType === 'LYX';
        if (filters.type === 'token') return draw.prizeType === 'LSP7';
        if (filters.type === 'nft') return draw.prizeType === 'LSP8';
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'endTime':
          aValue = Number(a.endTime);
          bValue = Number(b.endTime);
          break;
        case 'prizePool':
          aValue = BigInt(a.prizeAmount);
          bValue = BigInt(b.prizeAmount);
          break;
        case 'participants':
          aValue = a.totalTicketsSold;
          bValue = b.totalTicketsSold;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDraws(filtered);
  }, [draws, searchQuery, filters]);

  if (!isConnected) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
          <div className="container mx-auto px-4 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">Connect Your Wallet</h1>
              <p className="text-gray-400 mb-8">Please connect your Universal Profile to view and participate in draws</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
        <div className="container mx-auto px-4 py-24">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">
                Active Draws
              </h1>
              <p className="text-gray-400">
                Participate in community draws and win prizes
              </p>
            </div>
            <Link
              href="/create-draw"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              Create Draw
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by creator address or draw ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Filters */}
          <DrawFilters
            filters={filters}
            onFilterChange={setFilters}
          />

          {/* Official Draw Info */}
          {officialDrawInfo && (
            <div className="mb-8 p-6 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-xl border border-pink-500/30">
              <h3 className="text-xl font-bold text-white mb-2">Official Lottery</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Current Draw</p>
                  <p className="text-white font-semibold">#{officialDrawInfo.currentDrawNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Next Draw</p>
                  <p className="text-white font-semibold">
                    {new Date(Number(officialDrawInfo.nextDrawTime) * 1000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ticket Price</p>
                  <p className="text-white font-semibold">1 LYX</p>
                </div>
              </div>
            </div>
          )}

          {/* Draws Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-4" />
                  <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-white/10 rounded mb-4 w-1/2" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded" />
                    <div className="h-4 bg-white/10 rounded" />
                  </div>
                  <div className="h-10 bg-white/10 rounded mt-4" />
                </div>
              ))}
            </div>
          ) : filteredDraws.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDraws.map((draw) => (
                <DrawCard key={draw.drawId} draw={draw} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SparklesIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No draws found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to create a draw!'}
              </p>
              <Link
                href="/create-draw"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                Create a Draw
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}