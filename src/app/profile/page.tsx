'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { DrawCard } from '@/components/draws/DrawCard';
import { UserDraw } from '@/types/gridotto';
import Web3 from 'web3';
import { 
  UserIcon,
  TicketIcon,
  TrophyIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface UserStats {
  totalTicketsBought: number;
  totalSpent: string;
  totalWon: string;
  totalDrawsCreated: number;
  activeDraws: number;
  pendingPrizes: string;
}

interface Tab {
  id: string;
  name: string;
  icon: any;
  count?: number;
}

export default function ProfilePage() {
  const { isConnected, account } = useUPProvider();
  const { getUserCreatedDraws, getUserDrawStats, getAllClaimablePrizes, claimAll } = useGridottoContract();
  const { profileData } = useLSP3Profile(account);
  const [userStats, setUserStats] = useState<UserStats>({
    totalTicketsBought: 0,
    totalSpent: '0',
    totalDrawsCreated: 0,
    activeDraws: 0,
    totalWon: '0',
    pendingPrizes: '0'
  });
  const [userDraws, setUserDraws] = useState<UserDraw[]>([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const tabs: Tab[] = [
    { id: 'created', name: 'Created Draws', icon: SparklesIcon, count: userDraws.length },
    { id: 'stats', name: 'Statistics', icon: ChartBarIcon }
  ];

  const loadUserData = async () => {
    if (!account) return;

    try {
      setLoading(true);
      
      // Get user created draws
      const drawIds = await getUserCreatedDraws(account, 0, 100);
      const draws: UserDraw[] = [];
      let activeCount = 0;
      
      for (const drawId of drawIds) {
        const stats = await getUserDrawStats(Number(drawId));
        if (stats) {
          const isActive = Number(stats.endTime) > Date.now() / 1000;
          if (isActive) activeCount++;
          
          draws.push({
            drawId: Number(drawId),
            creator: stats.creator,
            endTime: stats.endTime,
            prizeType: 'LYX',
            prizeAmount: stats.prizePool,
            ticketPrice: '1000000000000000000', // 1 LYX default
            maxTickets: 100,
            minTickets: 1,
            isActive,
            totalTicketsSold: Number(stats.totalTicketsSold),
            participants: []
          });
        }
      }
      
      setUserDraws(draws);
      
      // Get claimable prizes
      const claimable = await getAllClaimablePrizes(account);
      
      // Update stats
      setUserStats({
        totalTicketsBought: 0, // Would need event tracking
        totalSpent: '0', // Would need event tracking
        totalDrawsCreated: draws.length,
        activeDraws: activeCount,
        totalWon: '0', // Would need event tracking
        pendingPrizes: claimable.totalLYX
      });
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
    }
  }, [isConnected, account]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleClaimAll = async () => {
    if (!account) return;
    
    try {
      setClaiming(true);
      await claimAll();
      // Refresh data after claiming
      await loadUserData();
    } catch (error) {
      console.error('Error claiming prizes:', error);
    } finally {
      setClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
          <div className="container mx-auto px-4 py-24">
            <div className="text-center">
              <UserIcon className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4 text-white">Connect Your Wallet</h1>
              <p className="text-gray-400">Please connect your Universal Profile to view your profile</p>
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
          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {account && (
                <ProfileDisplay 
                  address={account} 
                  size="lg"
                  showName={false}
                />
              )}
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profileData?.name || `${account?.slice(0, 6)}...${account?.slice(-4)}`}
                </h1>
                {profileData?.description && (
                  <p className="text-gray-400 mb-4">{profileData.description}</p>
                )}
                <p className="text-sm text-gray-500 font-mono">{account}</p>
                
                {/* Claim Button */}
                {userStats.pendingPrizes !== '0' && (
                  <button
                    onClick={handleClaimAll}
                    disabled={claiming}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                  >
                    <TrophyIcon className="w-5 h-5" />
                    {claiming ? 'Claiming...' : `Claim ${Web3.utils.fromWei(userStats.pendingPrizes, 'ether')} LYX`}
                  </button>
                )}
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-gray-400 text-sm">Draws Created</p>
              </div>
              <p className="text-2xl font-bold text-white">{userStats.totalDrawsCreated}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm">Active Draws</p>
              </div>
              <p className="text-2xl font-bold text-white">{userStats.activeDraws}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrophyIcon className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-gray-400 text-sm">Total Won</p>
              </div>
              <p className="text-2xl font-bold text-white">{userStats.totalWon} LYX</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-gray-400 text-sm">Pending Prizes</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {Web3.utils.fromWei(userStats.pendingPrizes, 'ether')} LYX
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/10 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className="ml-2 px-2 py-1 text-xs bg-white/10 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'created' && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 animate-pulse">
                      <div className="h-6 bg-white/10 rounded mb-4" />
                      <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                      <div className="h-4 bg-white/10 rounded mb-4 w-1/2" />
                      <div className="h-10 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : userDraws.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userDraws.map((draw) => (
                    <DrawCard key={draw.drawId} draw={draw} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <SparklesIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No draws created yet</h3>
                  <p className="text-gray-400">Create your first draw to see it here!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">Detailed Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-400">Total Draws Created</span>
                  <span className="text-white font-semibold">{userStats.totalDrawsCreated}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-400">Active Draws</span>
                  <span className="text-white font-semibold">{userStats.activeDraws}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-400">Completed Draws</span>
                  <span className="text-white font-semibold">{userStats.totalDrawsCreated - userStats.activeDraws}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Pending Prizes</span>
                  <span className="text-green-400 font-semibold">
                    {Web3.utils.fromWei(userStats.pendingPrizes, 'ether')} LYX
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}