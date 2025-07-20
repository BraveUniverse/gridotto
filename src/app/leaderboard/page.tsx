'use client';

import { useState, useEffect } from 'react';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { 
  TrophyIcon, 
  FireIcon, 
  SparklesIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';

interface LeaderboardEntry {
  address: string;
  totalWon: string;
  drawsWon: number;
  ticketsBought: number;
}

const LeaderboardPage = () => {
  const { getRecentWinners, contract } = useGridottoContract();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Get recent winners
        const winners = await getRecentWinners(50);
        setRecentWinners(winners);
        
        // Aggregate winners data for leaderboard
        const winnerMap = new Map<string, LeaderboardEntry>();
        
        winners.forEach((winner: any) => {
          const existing = winnerMap.get(winner.winner) || {
            address: winner.winner,
            totalWon: '0',
            drawsWon: 0,
            ticketsBought: 0
          };
          
          existing.totalWon = (BigInt(existing.totalWon) + BigInt(winner.prize)).toString();
          existing.drawsWon += 1;
          
          winnerMap.set(winner.winner, existing);
        });
        
        // Sort by total won
        const sorted = Array.from(winnerMap.values()).sort((a, b) => {
          const aAmount = BigInt(a.totalWon);
          const bAmount = BigInt(b.totalWon);
          return aAmount > bAmount ? -1 : aAmount < bAmount ? 1 : 0;
        });
        
        setLeaderboard(sorted.slice(0, 20));
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [getRecentWinners, timeRange]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <TrophyIcon className="w-12 h-12 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-xl text-gray-400">Top winners on Gridotto</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {(['all', 'month', 'week'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {range === 'all' ? 'All Time' : range === 'month' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <SparklesIcon className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Leaderboard */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FireIcon className="w-6 h-6 text-orange-400" />
                  Top Winners
                </h2>
                
                <div className="space-y-2">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => (
                      <div
                        key={entry.address}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">
                            {getRankIcon(index + 1)}
                          </div>
                          <div>
                            <ProfileDisplay address={entry.address} size="md" showName={true} />
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span>{entry.drawsWon} wins</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                            {Web3.utils.fromWei(entry.totalWon, 'ether')} LYX
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">
                      No winners yet. Be the first!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats & Recent Winners */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-blue-400" />
                  Statistics
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Winners</p>
                    <p className="text-2xl font-bold text-white">{recentWinners.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Prizes Distributed</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      {Web3.utils.fromWei(
                        recentWinners.reduce((sum, w) => sum + BigInt(w.prize), BigInt(0)).toString(),
                        'ether'
                      )} LYX
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Winners */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-green-400" />
                  Recent Winners
                </h3>
                <div className="space-y-3">
                  {recentWinners.slice(0, 5).map((winner, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-gray-400">
                        {formatAddress(winner.winner)}
                      </span>
                      <span className="text-white font-medium">
                        {Web3.utils.fromWei(winner.prize, 'ether')} LYX
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;