'use client';

import { useState, useEffect } from 'react';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { 
  TrophyIcon, 
  FireIcon, 
  SparklesIcon,
  ChartBarIcon,
  UsersIcon,
  TicketIcon,
  GiftIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Web3 from 'web3';

interface LeaderboardEntry {
  address: string;
  totalWon: string;
  drawsWon: number;
  ticketsBought: number;
}

interface TicketBuyerEntry {
  address: string;
  totalTickets: number;
  totalSpent: string;
  lastPurchase: number;
}

interface DrawCreatorEntry {
  address: string;
  drawsCreated: number;
  totalRevenue: string;
  successRate: number;
}

interface DrawExecutorEntry {
  address: string;
  drawsExecuted: number;
  totalEarned: string;
  avgExecutionTime: number;
}

type TabType = 'winners' | 'buyers' | 'creators' | 'executors';

const tabs: { id: TabType; label: string; icon: any; color: string }[] = [
  { id: 'winners', label: 'Top Winners', icon: TrophyIcon, color: 'yellow' },
  { id: 'buyers', label: 'Top Ticket Buyers', icon: TicketIcon, color: 'blue' },
  { id: 'creators', label: 'Top Draw Creators', icon: GiftIcon, color: 'purple' },
  { id: 'executors', label: 'Top Executors', icon: BoltIcon, color: 'green' },
];

const LeaderboardPage = () => {
  const { getRecentWinners, contract } = useGridottoContract();
  const [activeTab, setActiveTab] = useState<TabType>('winners');
  const [winners, setWinners] = useState<LeaderboardEntry[]>([]);
  const [buyers, setBuyers] = useState<TicketBuyerEntry[]>([]);
  const [creators, setCreators] = useState<DrawCreatorEntry[]>([]);
  const [executors, setExecutors] = useState<DrawExecutorEntry[]>([]);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrizes: '0',
    totalTicketsSold: 0,
    totalDrawsCreated: 0,
    totalExecutions: 0
  });

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Get recent winners
        const winnersData = await getRecentWinners(50);
        setRecentWinners(winnersData);
        
        // Aggregate winners data
        const winnerMap = new Map<string, LeaderboardEntry>();
        
        winnersData.forEach((winner: any) => {
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
        const sortedWinners = Array.from(winnerMap.values()).sort((a, b) => {
          const aAmount = BigInt(a.totalWon);
          const bAmount = BigInt(b.totalWon);
          return aAmount > bAmount ? -1 : aAmount < bAmount ? 1 : 0;
        });
        
        setWinners(sortedWinners.slice(0, 20));

        // TODO: Load ticket buyers data from contract
        // For now, using mock data
        setBuyers([
          { address: '0x1234...5678', totalTickets: 1250, totalSpent: '125000000000000000000', lastPurchase: Date.now() - 3600000 },
          { address: '0x2345...6789', totalTickets: 980, totalSpent: '98000000000000000000', lastPurchase: Date.now() - 7200000 },
          { address: '0x3456...7890', totalTickets: 750, totalSpent: '75000000000000000000', lastPurchase: Date.now() - 10800000 },
        ]);

        // TODO: Load draw creators data from contract
        setCreators([
          { address: '0x4567...8901', drawsCreated: 25, totalRevenue: '500000000000000000000', successRate: 92 },
          { address: '0x5678...9012', drawsCreated: 18, totalRevenue: '350000000000000000000', successRate: 88 },
          { address: '0x6789...0123', drawsCreated: 12, totalRevenue: '200000000000000000000', successRate: 95 },
        ]);

        // TODO: Load draw executors data from contract
        setExecutors([
          { address: '0x7890...1234', drawsExecuted: 150, totalEarned: '75000000000000000000', avgExecutionTime: 45 },
          { address: '0x8901...2345', drawsExecuted: 120, totalEarned: '60000000000000000000', avgExecutionTime: 52 },
          { address: '0x9012...3456', drawsExecuted: 95, totalEarned: '47500000000000000000', avgExecutionTime: 38 },
        ]);

        // Calculate stats
        setStats({
          totalPrizes: winnersData.reduce((sum: any, w: any) => sum + BigInt(w.prize), BigInt(0)).toString(),
          totalTicketsSold: 5000, // TODO: Get from contract
          totalDrawsCreated: 150, // TODO: Get from contract
          totalExecutions: 450 // TODO: Get from contract
        });

      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [getRecentWinners]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <TrophyIcon className="w-12 h-12 text-yellow-400" />
            Gridotto Leaderboard
          </h1>
          <p className="text-xl text-gray-400">Track top performers across all activities</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6 text-center">
            <CurrencyDollarIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Total Prizes</p>
            <p className="text-2xl font-bold text-white">
              {Web3.utils.fromWei(stats.totalPrizes, 'ether')} LYX
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <TicketIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Tickets Sold</p>
            <p className="text-2xl font-bold text-white">{stats.totalTicketsSold.toLocaleString()}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <GiftIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Draws Created</p>
            <p className="text-2xl font-bold text-white">{stats.totalDrawsCreated}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <BoltIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Executions</p>
            <p className="text-2xl font-bold text-white">{stats.totalExecutions}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white`
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <SparklesIcon className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="glass-card p-6">
            {/* Winners Tab */}
            {activeTab === 'winners' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-400" />
                  Top Winners - Lucky Players
                </h2>
                <div className="space-y-2">
                  {winners.map((entry, index) => (
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
                            <span className="flex items-center gap-1">
                              <CheckCircleIcon className="w-4 h-4" />
                              {entry.drawsWon} wins
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                          {Web3.utils.fromWei(entry.totalWon, 'ether')} LYX
                        </p>
                        <p className="text-sm text-gray-400">Total Won</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Buyers Tab */}
            {activeTab === 'buyers' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TicketIcon className="w-6 h-6 text-blue-400" />
                  Top Ticket Buyers - Most Active Players
                </h2>
                <div className="space-y-2">
                  {buyers.map((entry, index) => (
                    <div
                      key={entry.address}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                        index < 3 ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <ProfileDisplay address={entry.address} size="md" showName={true} />
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <TicketIcon className="w-4 h-4" />
                              {entry.totalTickets.toLocaleString()} tickets
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {getTimeAgo(entry.lastPurchase)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                          {Web3.utils.fromWei(entry.totalSpent, 'ether')} LYX
                        </p>
                        <p className="text-sm text-gray-400">Total Spent</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draw Creators Tab */}
            {activeTab === 'creators' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <GiftIcon className="w-6 h-6 text-purple-400" />
                  Top Draw Creators - Business Minds
                </h2>
                <div className="space-y-2">
                  {creators.map((entry, index) => (
                    <div
                      key={entry.address}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                        index < 3 ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <ProfileDisplay address={entry.address} size="md" showName={true} />
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <GiftIcon className="w-4 h-4" />
                              {entry.drawsCreated} draws
                            </span>
                            <span className="flex items-center gap-1">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              {entry.successRate}% success
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          {Web3.utils.fromWei(entry.totalRevenue, 'ether')} LYX
                        </p>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draw Executors Tab */}
            {activeTab === 'executors' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <BoltIcon className="w-6 h-6 text-green-400" />
                  Top Draw Executors - Speed Demons
                </h2>
                <div className="space-y-2">
                  {executors.map((entry, index) => (
                    <div
                      key={entry.address}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                        index < 3 ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <ProfileDisplay address={entry.address} size="md" showName={true} />
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <BoltIcon className="w-4 h-4" />
                              {entry.drawsExecuted} executions
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {entry.avgExecutionTime}s avg
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                          {Web3.utils.fromWei(entry.totalEarned, 'ether')} LYX
                        </p>
                        <p className="text-sm text-gray-400">Total Earned (5% fees)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data Message */}
            {((activeTab === 'winners' && winners.length === 0) ||
              (activeTab === 'buyers' && buyers.length === 0) ||
              (activeTab === 'creators' && creators.length === 0) ||
              (activeTab === 'executors' && executors.length === 0)) && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">
                  No data available yet. Be the first to top this leaderboard!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;