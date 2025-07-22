'use client';

import { useState, useEffect } from 'react';
import { useEthers } from '@/contexts/EthersContext';
import { useGridottoCoreV2 } from '@/hooks/useGridottoCoreV2';
import { useGridottoRefund } from '@/hooks/useGridottoRefund';
import { useGridottoLeaderboard } from '@/hooks/useGridottoLeaderboard';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { 
  UserCircleIcon, 
  TrophyIcon, 
  TicketIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

interface ProfileStats {
  totalWins: number;
  totalWinnings: string;
  totalTicketsBought: number;
  totalSpent: string;
  drawsParticipated: number;
  drawsWon: number;
  claimablePrizes: number;
}

const ProfilePage = () => {
  const { account, isConnected } = useEthers();
  const { getUserDrawHistory, getDrawDetails } = useGridottoCoreV2();
  const { canClaimPrize, claimPrize, batchClaimPrizes } = useGridottoRefund();
  const { getTopWinners } = useGridottoLeaderboard();
  
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalWins: 0,
    totalWinnings: '0',
    totalTicketsBought: 0,
    totalSpent: '0',
    drawsParticipated: 0,
    drawsWon: 0,
    claimablePrizes: 0
  });
  const [claimableDraws, setClaimableDraws] = useState<number[]>([]);
  const [participationHistory, setParticipationHistory] = useState<any[]>([]);

  useEffect(() => {
    if (account) {
      loadProfileData();
    }
  }, [account]);

  const loadProfileData = async () => {
    if (!account) return;

    try {
      setLoading(true);

      // Get user's draw history
      const history = await getUserDrawHistory(account);
      
      // Get detailed information for each draw
      const detailedHistory = [];
      let totalSpent = BigInt(0);
      let totalWon = BigInt(0);
      let drawsWon = 0;
      let totalTickets = 0;
      const claimable: number[] = [];

      for (const drawId of history) {
        const details = await getDrawDetails(drawId);
        if (details) {
          // Calculate spent amount (this is approximate as we don't have exact ticket count per user)
          // In a real implementation, you'd need a getUserTickets function
          const participated = true; // Assuming user participated if in history
          
          if (participated) {
            detailedHistory.push({
              drawId,
              drawType: details.drawType,
              endTime: Number(details.endTime),
              isCompleted: details.isCompleted,
              prizePool: details.prizePool.toString(),
              ticketPrice: details.ticketPrice.toString()
            });
          }

          // Check if user can claim prize
          if (details.isCompleted && !details.isCancelled) {
            const canClaim = await canClaimPrize(drawId, account);
            if (canClaim.canClaim) {
              claimable.push(drawId);
            }
          }
        }
      }

      // Get winner stats from leaderboard
      const topWinners = await getTopWinners(100);
      const userWinnerStats = topWinners.find(w => w.player.toLowerCase() === account.toLowerCase());
      
      if (userWinnerStats) {
        totalWon = userWinnerStats.totalWinnings;
        drawsWon = Number(userWinnerStats.totalWins);
      }

      setStats({
        totalWins: drawsWon,
        totalWinnings: ethers.formatEther(totalWon),
        totalTicketsBought: totalTickets,
        totalSpent: ethers.formatEther(totalSpent),
        drawsParticipated: detailedHistory.length,
        drawsWon,
        claimablePrizes: claimable.length
      });

      setClaimableDraws(claimable);
      setParticipationHistory(detailedHistory);
    } catch (err) {
      console.error('Error loading profile data:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAll = async () => {
    if (claimableDraws.length === 0) return;

    setClaiming(true);
    try {
      if (claimableDraws.length === 1) {
        await claimPrize(claimableDraws[0]);
      } else {
        await batchClaimPrizes(claimableDraws);
      }
      
      toast.success('All prizes claimed successfully!');
      await loadProfileData();
    } catch (err: any) {
      console.error('Error claiming prizes:', err);
      toast.error(err.message || 'Failed to claim prizes');
    } finally {
      setClaiming(false);
    }
  };

  const getDrawTypeLabel = (type: number) => {
    switch (type) {
      case 0: return 'LYX Draw';
      case 1: return 'Token Draw';
      case 2: return 'NFT Draw';
      case 3: return 'Weekly Draw';
      case 4: return 'Monthly Draw';
      default: return 'Unknown';
    }
  };

  const getDrawTypeIcon = (type: number) => {
    switch (type) {
      case 0: return CurrencyDollarIcon;
      case 1: return CurrencyDollarIcon;
      case 2: return GiftIcon;
      case 3: return ClockIcon;
      case 4: return TrophyIcon;
      default: return SparklesIcon;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <ProfileDisplay address={account!} size="lg" showName={false} />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
              <p className="text-gray-400 font-mono text-sm">{account}</p>
            </div>
          </div>

          {/* Claim All Button */}
          {claimableDraws.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-medium flex items-center gap-2">
                    <GiftIcon className="w-5 h-5" />
                    You have {claimableDraws.length} unclaimed prize{claimableDraws.length > 1 ? 's' : ''}!
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click the button to claim all your prizes at once.
                  </p>
                </div>
                <button
                  onClick={handleClaimAll}
                  disabled={claiming}
                  className="btn-primary"
                >
                  {claiming ? 'Claiming...' : 'Claim All'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{stats.totalWins}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Wins</p>
            <p className="text-xl font-bold text-white">{stats.totalWinnings} LYX</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <TicketIcon className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{stats.totalTicketsBought}</span>
            </div>
            <p className="text-gray-400 text-sm">Tickets Bought</p>
            <p className="text-xl font-bold text-white">{stats.totalSpent} LYX spent</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">{stats.drawsParticipated}</span>
            </div>
            <p className="text-gray-400 text-sm">Draws Participated</p>
            <p className="text-xl font-bold text-white">{stats.drawsWon} won</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <GiftIcon className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{stats.claimablePrizes}</span>
            </div>
            <p className="text-gray-400 text-sm">Claimable Prizes</p>
            <p className="text-xl font-bold text-white">Ready to claim</p>
          </div>
        </div>

        {/* Participation History */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ClockIcon className="w-6 h-6" />
            Participation History
          </h2>
          
          {participationHistory.length > 0 ? (
            <div className="space-y-4">
              {participationHistory.map((draw) => {
                const DrawIcon = getDrawTypeIcon(draw.drawType);
                const isWon = false; // This would need to check if user won this specific draw
                
                return (
                  <div key={draw.drawId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <DrawIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          Draw #{draw.drawId} - {getDrawTypeLabel(draw.drawType)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Ended {new Date(draw.endTime * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Prize Pool</p>
                        <p className="text-white font-medium">
                          {ethers.formatEther(draw.prizePool)} LYX
                        </p>
                      </div>
                      
                      {draw.isCompleted && (
                        <div className="flex items-center gap-2">
                          {isWon ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No participation history yet.</p>
              <p className="text-sm text-gray-500 mt-2">Start by buying tickets in active draws!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;