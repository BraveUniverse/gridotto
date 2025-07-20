'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { 
  UserCircleIcon, 
  TicketIcon, 
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';
import Link from 'next/link';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';

interface UserStats {
  totalWon: string;
  totalSpent: string;
  drawsParticipated: number;
  drawsWon: number;
  ticketsBought: number;
}

interface ParticipationHistory {
  drawId: string;
  ticketsBought: number;
  won: boolean;
  prize?: string;
  drawType?: string;
}

const ProfilePage = () => {
  const { account, isConnected } = useUPProvider();
  const { 
    getUserParticipationHistory, 
    getAdvancedDrawInfo,
    getUserCreatedDraws,
    getUserDrawStats
  } = useGridottoContract();
  const [userStats, setUserStats] = useState<UserStats>({
    totalWon: '0',
    totalSpent: '0',
    drawsParticipated: 0,
    drawsWon: 0,
    ticketsBought: 0
  });
  const [participationHistory, setParticipationHistory] = useState<ParticipationHistory[]>([]);
  const [createdDraws, setCreatedDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'participated' | 'created'>('participated');

  useEffect(() => {
    const loadUserData = async () => {
      if (!account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user participation history
        const history = await getUserParticipationHistory(account, 0, 100);
        
        // Calculate stats and get draw details
        let totalWon = BigInt(0);
        let totalSpent = BigInt(0);
        let drawsWon = 0;
        let totalTickets = 0;
        
        const detailedHistory: ParticipationHistory[] = [];
        
        for (let i = 0; i < history.drawIds.length; i++) {
          const drawId = history.drawIds[i];
          const tickets = Number(history.ticketsBought[i]);
          const won = history.won[i];
          
          totalTickets += tickets;
          
          try {
            const drawInfo = await getAdvancedDrawInfo(drawId);
            if (drawInfo) {
              const ticketCost = BigInt(drawInfo.ticketPrice) * BigInt(tickets);
              totalSpent += ticketCost;
              
              let prize = '0';
              if (won) {
                drawsWon++;
                // Calculate prize based on draw info
                prize = drawInfo.prizePool;
                totalWon += BigInt(prize);
              }
              
              detailedHistory.push({
                drawId: drawId.toString(),
                ticketsBought: tickets,
                won,
                prize: won ? prize : undefined,
                drawType: drawInfo.drawType
              });
            }
          } catch (err) {
            console.error(`Error loading draw ${drawId}:`, err);
          }
        }
        
        setUserStats({
          totalWon: totalWon.toString(),
          totalSpent: totalSpent.toString(),
          drawsParticipated: history.drawIds.length,
          drawsWon,
          ticketsBought: totalTickets
        });
        
        setParticipationHistory(detailedHistory);
        
        // Load created draws
        const createdDrawIds = await getUserCreatedDraws(account, 0, 100);
        const createdDrawsData = [];
        
        for (const drawId of createdDrawIds) {
          const stats = await getUserDrawStats(Number(drawId));
          if (stats) {
            createdDrawsData.push({
              drawId: Number(drawId),
              ...stats
            });
          }
        }
        
        setCreatedDraws(createdDrawsData);
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [account, getUserParticipationHistory, getAdvancedDrawInfo, getUserCreatedDraws, getUserDrawStats]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDrawTypeLabel = (type: string) => {
    switch (type) {
      case '0': return 'Official Weekly';
      case '1': return 'Official Monthly';
      case '2': return 'User LYX';
      case '3': return 'User Token';
      case '4': return 'User NFT';
      default: return 'Unknown';
    }
  };

  const roi = userStats.totalSpent !== '0' 
    ? ((Number(Web3.utils.fromWei(userStats.totalWon, 'ether')) / 
        Number(Web3.utils.fromWei(userStats.totalSpent, 'ether'))) * 100).toFixed(2)
    : '0';

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <ProfileDisplay 
            address={account || ''} 
            size="lg" 
            showName={true} 
            showDescription={true} 
            className="mb-4"
          />
          <h1 className="text-4xl font-bold text-white">My Profile</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <SparklesIcon className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrophyIcon className="w-8 h-8 text-yellow-400" />
                  <span className="text-sm text-gray-400">Total Won</span>
                </div>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  {Web3.utils.fromWei(userStats.totalWon, 'ether')} LYX
                </p>
                <p className="text-sm text-green-400 mt-1">
                  ROI: {roi}%
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <TicketIcon className="w-8 h-8 text-blue-400" />
                  <span className="text-sm text-gray-400">Tickets Bought</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {userStats.ticketsBought}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {Web3.utils.fromWei(userStats.totalSpent, 'ether')} LYX spent
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <ChartBarIcon className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-gray-400">Draws Participated</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {userStats.drawsParticipated}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {userStats.drawsWon} won
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <SparklesIcon className="w-8 h-8 text-green-400" />
                  <span className="text-sm text-gray-400">Win Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {userStats.drawsParticipated > 0 
                    ? ((userStats.drawsWon / userStats.drawsParticipated) * 100).toFixed(1)
                    : '0'}%
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Success rate
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('participated')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'participated'
                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                Participated Draws ({participationHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('created')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'created'
                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                Created Draws ({createdDraws.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="glass-card p-6">
              {activeTab === 'participated' ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-primary" />
                    Participation History
                  </h2>

              {participationHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Draw</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Tickets</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Result</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Prize</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participationHistory.map((entry, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-white">#{entry.drawId}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-400">
                              {getDrawTypeLabel(entry.drawType || '')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white">{entry.ticketsBought}</span>
                          </td>
                          <td className="py-3 px-4">
                            {entry.won ? (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircleIcon className="w-4 h-4" />
                                Won
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400">
                                <XCircleIcon className="w-4 h-4" />
                                Lost
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {entry.won && entry.prize ? (
                              <span className="text-yellow-400 font-medium">
                                {Web3.utils.fromWei(entry.prize, 'ether')} LYX
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Link 
                              href={`/draws/${entry.drawId}`}
                              className="text-primary hover:text-primary/80 text-sm font-medium"
                            >
                              View Draw
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TicketIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No participation history yet</p>
                  <Link href="/draws" className="btn-primary mt-4 inline-flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    Explore Draws
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                Created Draws
              </h2>

              {createdDraws.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Draw ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Prize Pool</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Participants</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">End Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {createdDraws.map((draw, index) => {
                        const isActive = Number(draw.endTime) > Date.now() / 1000;
                        const endDate = new Date(Number(draw.endTime) * 1000);
                        
                        return (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono text-white">#{draw.drawId}</span>
                            </td>
                            <td className="py-3 px-4">
                              {isActive ? (
                                <span className="flex items-center gap-1 text-green-400">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                  Active
                                </span>
                              ) : draw.isCompleted ? (
                                <span className="text-blue-400">Completed</span>
                              ) : (
                                <span className="text-yellow-400">Pending</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-yellow-400 font-medium">
                                {Web3.utils.fromWei(draw.prizePool || '0', 'ether')} LYX
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-white">{draw.totalTicketsSold || 0}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-400 text-sm">
                                {endDate.toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Link 
                                href={`/draws/${draw.drawId}`}
                                className="text-primary hover:text-primary/80 text-sm font-medium"
                              >
                                Manage
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <SparklesIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No draws created yet</p>
                  <Link href="/create-draw" className="btn-primary mt-4 inline-flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    Create Your First Draw
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;