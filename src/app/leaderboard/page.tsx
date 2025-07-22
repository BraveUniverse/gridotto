'use client';

import { useState, useEffect } from 'react';
import { useGridottoLeaderboard } from '@/hooks/useGridottoLeaderboard';
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

type TabType = 'winners' | 'buyers' | 'creators' | 'executors';

const tabs: { id: TabType; label: string; icon: any; color: string }[] = [
  { id: 'winners', label: 'Top Winners', icon: TrophyIcon, color: 'yellow' },
  { id: 'buyers', label: 'Top Ticket Buyers', icon: TicketIcon, color: 'blue' },
  { id: 'creators', label: 'Top Draw Creators', icon: GiftIcon, color: 'purple' },
  { id: 'executors', label: 'Top Executors', icon: BoltIcon, color: 'green' },
];

const LeaderboardPage = () => {
  const { 
    getTopWinners, 
    getTopTicketBuyers, 
    getTopDrawCreators, 
    getTopExecutors,
    getPlatformStats,
    loading: contractLoading 
  } = useGridottoLeaderboard();
  
  const [activeTab, setActiveTab] = useState<TabType>('winners');
  const [winners, setWinners] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [executors, setExecutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrizesDistributed: '0',
    totalTicketsSold: '0',
    totalDrawsCreated: '0',
    totalExecutions: '0'
  });

  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (contractLoading) return;
      
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [winnersData, buyersData, creatorsData, executorsData, platformStats] = await Promise.all([
          getTopWinners(20),
          getTopTicketBuyers(20),
          getTopDrawCreators(20),
          getTopExecutors(20),
          getPlatformStats()
        ]);
        
        setWinners(winnersData);
        setBuyers(buyersData);
        setCreators(creatorsData);
        setExecutors(executorsData);
        
        if (platformStats) {
          setStats(platformStats);
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [contractLoading, getTopWinners, getTopTicketBuyers, getTopDrawCreators, getTopExecutors, getPlatformStats]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
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
              {stats.totalPrizesDistributed} LYX
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <TicketIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Tickets Sold</p>
            <p className="text-2xl font-bold text-white">{Number(stats.totalTicketsSold).toLocaleString()}</p>
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

        {loading || contractLoading ? (
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
                  {winners.length > 0 ? (
                    winners.map((entry) => (
                      <div
                        key={entry.address}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                          entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <ProfileDisplay address={entry.address} size="md" showName={true} />
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                {entry.totalWins} wins
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {getTimeAgo(entry.lastWinTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                            {entry.totalWinnings} LYX
                          </p>
                          <p className="text-sm text-gray-400">Total Won</p>
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
            )}

            {/* Ticket Buyers Tab */}
            {activeTab === 'buyers' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TicketIcon className="w-6 h-6 text-blue-400" />
                  Top Ticket Buyers - Most Active Players
                </h2>
                <div className="space-y-2">
                  {buyers.length > 0 ? (
                    buyers.map((entry) => (
                      <div
                        key={entry.address}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                          entry.rank <= 3 ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <ProfileDisplay address={entry.address} size="md" showName={true} />
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <TicketIcon className="w-4 h-4" />
                                {Number(entry.totalTickets).toLocaleString()} tickets
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {getTimeAgo(entry.lastPurchaseTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            {entry.totalSpent} LYX
                          </p>
                          <p className="text-sm text-gray-400">Total Spent</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">
                      No ticket buyers yet. Be the first!
                    </p>
                  )}
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
                  {creators.length > 0 ? (
                    creators.map((entry) => (
                      <div
                        key={entry.address}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                          entry.rank <= 3 ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">
                            {getRankIcon(entry.rank)}
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
                                {entry.successRate} success
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {entry.totalRevenue} LYX
                          </p>
                          <p className="text-sm text-gray-400">Total Revenue</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">
                      No draw creators yet. Be the first!
                    </p>
                  )}
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
                  {executors.length > 0 ? (
                    executors.map((entry) => (
                      <div
                        key={entry.address}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/10 ${
                          entry.rank <= 3 ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <ProfileDisplay address={entry.address} size="md" showName={true} />
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <BoltIcon className="w-4 h-4" />
                                {entry.executionCount} executions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                            {entry.totalFeesEarned} LYX
                          </p>
                          <p className="text-sm text-gray-400">Total Earned (5% fees)</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">
                      No executors yet. Be the first!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;