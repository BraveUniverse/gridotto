'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SparklesIcon, TicketIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoCoreV2 } from '@/hooks/useGridottoCoreV2';
import { COMPLETE_DIAMOND_ABI } from '@/abi/completeDiamondAbi';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

export const HeroSection = () => {
  const { web3, isConnected, account } = useUPProvider();
  const { buyTickets } = useGridottoCoreV2(); // GERÇEKTİ contract function
  const [weeklyTickets, setWeeklyTickets] = useState(1);
  const [buying, setBuying] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Platform data from contract
  const [weeklyDraw, setWeeklyDraw] = useState<any>(null);
  const [monthlyDraw, setMonthlyDraw] = useState<any>(null);
  const [userMonthlyTickets, setUserMonthlyTickets] = useState<any>(null);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadPlatformData = async () => {
    if (!web3 || loading) return;

    try {
      setLoading(true);
      console.log('[HeroSection] Loading platform data...');
      
      const contract = new web3.eth.Contract(COMPLETE_DIAMOND_ABI as any, DIAMOND_ADDRESS);
      
      // Get platform draws info
      try {
        const platformInfo = await contract.methods.getPlatformDrawsInfo().call();
        console.log('[HeroSection] Platform info:', platformInfo);
        
        // Type guard for platform info
        if (platformInfo && typeof platformInfo === 'object') {
          // Get weekly draw details
          if ((platformInfo as any).weeklyDrawId && Number((platformInfo as any).weeklyDrawId) > 0) {
            const weeklyDetails = await contract.methods.getDrawDetails(Number((platformInfo as any).weeklyDrawId)).call();
            if (weeklyDetails && typeof weeklyDetails === 'object') {
              const currentTime = Math.floor(Date.now() / 1000);
              const timeRemaining = Math.max(0, Number((weeklyDetails as any).endTime) - currentTime);
              
              setWeeklyDraw({
                drawId: Number((platformInfo as any).weeklyDrawId),
                prizePool_LYX: Number(Web3.utils.fromWei((weeklyDetails as any).prizePool.toString(), 'ether')),
                ticketPrice_LYX: Number(Web3.utils.fromWei((weeklyDetails as any).ticketPrice.toString(), 'ether')),
                ticketsSold: Number((weeklyDetails as any).ticketsSold),
                participantCount: Number((weeklyDetails as any).participantCount),
                timeRemaining: timeRemaining,
                endTime: Number((weeklyDetails as any).endTime),
                executorFee_LYX: Number(Web3.utils.fromWei(((weeklyDetails as any).executorFeeCollected || 0).toString(), 'ether'))
              });
            }
          }
          
          // Get monthly draw details if exists
          if ((platformInfo as any).monthlyDrawId && Number((platformInfo as any).monthlyDrawId) > 0) {
            const monthlyDetails = await contract.methods.getDrawDetails(Number((platformInfo as any).monthlyDrawId)).call();
            if (monthlyDetails && typeof monthlyDetails === 'object') {
              const currentTime = Math.floor(Date.now() / 1000);
              const timeRemaining = Math.max(0, Number((monthlyDetails as any).endTime) - currentTime);
              
              // Try to get total participants from monthly draw stats
              let totalParticipants = Number((monthlyDetails as any).participantCount);
              
              // If participantCount is 0, try to get it from getUserMonthlyTickets if user is connected
              if (totalParticipants === 0 && account) {
                try {
                  const monthlyTickets = await contract.methods.getUserMonthlyTickets(account).call();
                  if (monthlyTickets && typeof monthlyTickets === 'object') {
                    // Use total tickets as an approximation for participants
                    const totalTickets = Number((monthlyTickets as any).total || 0) +
                                       Number((monthlyTickets as any).fromWeekly || 0) +
                                       Number((monthlyTickets as any).fromCreating || 0) +
                                       Number((monthlyTickets as any).fromParticipating || 0);
                    totalParticipants = Math.max(totalParticipants, totalTickets > 0 ? 1 : 0);
                  }
                } catch (error) {
                  console.log('[HeroSection] Could not get monthly participants from user tickets:', error);
                }
              }
              
              setMonthlyDraw({
                drawId: Number((platformInfo as any).monthlyDrawId),
                prizePool_LYX: Number(Web3.utils.fromWei((monthlyDetails as any).prizePool.toString(), 'ether')),
                ticketPrice_LYX: 0, // Monthly draws don't have direct ticket purchase
                ticketsSold: Number((monthlyDetails as any).ticketsSold),
                participantCount: totalParticipants,
                timeRemaining: timeRemaining,
                endTime: Number((monthlyDetails as any).endTime),
                executorFee_LYX: Number(Web3.utils.fromWei(((monthlyDetails as any).executorFeeCollected || 0).toString(), 'ether'))
              });
            }
          } else {
            // Monthly draw info from platform info
            // Try to estimate participants from platform stats
            let estimatedParticipants = 0;
            if (account) {
              try {
                const monthlyTickets = await contract.methods.getUserMonthlyTickets(account).call();
                if (monthlyTickets && typeof monthlyTickets === 'object') {
                  const totalTickets = Number((monthlyTickets as any).total || 0) +
                                     Number((monthlyTickets as any).fromWeekly || 0) +
                                     Number((monthlyTickets as any).fromCreating || 0) +
                                     Number((monthlyTickets as any).fromParticipating || 0);
                  estimatedParticipants = totalTickets > 0 ? 1 : 0; // At least 1 if user has tickets
                }
              } catch (error) {
                console.log('[HeroSection] Could not estimate monthly participants:', error);
              }
            }
            
            setMonthlyDraw({
              drawId: 0,
              prizePool_LYX: Number(Web3.utils.fromWei(((platformInfo as any).monthlyPoolBalance || 0).toString(), 'ether')),
              ticketPrice_LYX: 0,
              ticketsSold: 0,
              participantCount: estimatedParticipants,
              timeRemaining: 0,
              endTime: 0,
              isUpcoming: true // Next monthly draw
            });
          }
        }
      } catch (error) {
        console.error('[HeroSection] Error fetching platform draws:', error);
      }
      
      // Get user's monthly tickets if connected
      if (account) {
        try {
          const monthlyTickets = await contract.methods.getUserMonthlyTickets(account).call();
          if (monthlyTickets && typeof monthlyTickets === 'object') {
            setUserMonthlyTickets({
              fromWeekly: Number((monthlyTickets as any).fromWeekly),
              fromCreating: Number((monthlyTickets as any).fromCreating),
              fromParticipating: Number((monthlyTickets as any).fromParticipating),
              total: Number((monthlyTickets as any).total)
            });
          }
        } catch (error) {
          console.error('[HeroSection] Error fetching user monthly tickets:', error);
        }
      }
      
      // Get platform stats
      try {
        const stats = await contract.methods.getPlatformStats().call();
        
        // Type guard for platform stats
        if (stats && typeof stats === 'object') {
          setPlatformStats({
            totalTicketsSold: Number((stats as any).totalTicketsSold || 0),
            totalExecutions: Number((stats as any).totalExecutions || 0),
            totalPrizesDistributed: Number(Web3.utils.fromWei(((stats as any).totalPrizesDistributed || 0).toString(), 'ether'))
          });
        }
      } catch (error) {
        console.error('[HeroSection] Error fetching platform stats:', error);
      }
      
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('[HeroSection] Platform data loaded:', { weeklyDraw, monthlyDraw, userMonthlyTickets, platformStats });
      
    } catch (error) {
      console.error('[HeroSection] Error loading platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load platform data when component mounts and web3 is available
  useEffect(() => {
    if (web3 && isConnected) {
      loadPlatformData();
    }
  }, [web3, isConnected, account]);

  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Starting soon...';
    
    const days = Math.floor(timeRemaining / 86400);
    const hours = Math.floor((timeRemaining % 86400) / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleBuyWeekly = async () => {
    if (!weeklyDraw || !account) {
      console.error('[BuyTickets] Missing requirements:', { weeklyDraw, account });
      return;
    }

    try {
      setBuying(true);
      console.log('[BuyTickets] Starting transaction:', {
        drawId: weeklyDraw.drawId,
        tickets: weeklyTickets,
        ticketPrice: weeklyDraw.ticketPrice_LYX,
        totalCost: weeklyTickets * weeklyDraw.ticketPrice_LYX,
        account
      });
      
      // Gerçek blockchain transaction
      const tx = await buyTickets(weeklyDraw.drawId, weeklyTickets);
      
      console.log('[BuyTickets] Transaction object type:', typeof tx);
      console.log('[BuyTickets] Transaction object keys:', tx ? Object.keys(tx) : 'null');
      console.log('[BuyTickets] Transaction object:', tx);
      
      // Try to find transaction hash in different possible locations
      const txHash = tx?.transactionHash || 'Unknown';
      console.log('[BuyTickets] Found transaction hash:', txHash);
      
      // Refresh data after successful purchase
      setTimeout(() => {
        loadPlatformData();
      }, 3000);
      
      console.log('✅ Transaction completed successfully! TX Hash:', txHash);
    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error object:', err);
      
      // Check if it's a user rejection
      if (err.code === 4001 || err.message?.includes('User denied')) {
        console.log('User rejected transaction');
      } else if (err.message?.includes('insufficient funds')) {
        console.log('Insufficient funds');
      } else {
        console.log('Unknown transaction error');
      }
    } finally {
      setBuying(false);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Gridotto
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The first decentralized lottery platform on LUKSO. Join weekly draws or earn monthly tickets through participation!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/draws" className="btn-primary">
              <SparklesIcon className="w-5 h-5" />
              Explore Draws
            </Link>
            <Link href="/create-draw" className="btn-secondary">
              Create Your Draw
            </Link>
            <button
              onClick={loadPlatformData}
              disabled={loading || !web3}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
          
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {lastUpdate}
            </p>
          )}
        </div>

        {/* Official Draws */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Weekly Draw */}
          <div className="glass-card p-8 border-2 border-yellow-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Weekly Draw</h2>
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="mb-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? '...' : weeklyDraw ? parseFloat(weeklyDraw.prizePool_LYX.toFixed(4)) : '0'} LYX
              </div>
              <p className="text-gray-400">Current Prize Pool</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">
                {loading ? 'Loading...' : weeklyDraw ? formatTimeRemaining(weeklyDraw.timeRemaining) : 'No active draw'}
              </span>
            </div>
            
            {weeklyDraw && (
              <div className="text-center text-sm text-gray-400 mb-6 space-y-1">
                <p>Tickets sold: {weeklyDraw.ticketsSold}</p>
                <p>Participants: {weeklyDraw.participantCount}</p>
                <p>Draw ID: #{weeklyDraw.drawId}</p>
                {weeklyDraw.executorFee_LYX && weeklyDraw.executorFee_LYX > 0 && (
                  <p className="text-purple-400 font-medium">
                    🎯 Executor Reward: {weeklyDraw.executorFee_LYX.toFixed(4)} LYX
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <label className="text-white">Tickets:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeeklyTickets(Math.max(1, weeklyTickets - 1))}
                    className="w-8 h-8 bg-yellow-500/20 rounded-lg text-yellow-400 hover:bg-yellow-500/30"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-white font-bold">{weeklyTickets}</span>
                  <button
                    onClick={() => setWeeklyTickets(weeklyTickets + 1)}
                    className="w-8 h-8 bg-yellow-500/20 rounded-lg text-yellow-400 hover:bg-yellow-500/30"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="text-center text-gray-400">
                {weeklyDraw ? parseFloat(weeklyDraw.ticketPrice_LYX.toFixed(4)) : '0.25'} LYX per ticket
              </div>
              
              <div className="text-center text-white font-bold">
                Total: {weeklyDraw ? parseFloat((weeklyTickets * weeklyDraw.ticketPrice_LYX).toFixed(4)) : (weeklyTickets * 0.25)} LYX
              </div>

              <button
                onClick={handleBuyWeekly}
                disabled={buying || !weeklyDraw || !isConnected}
                className="w-full btn-primary bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50"
              >
                {buying ? 'Sending Transaction...' : !isConnected ? 'Connect Wallet' : !weeklyDraw ? 'No Active Draw' : `🚀 Buy ${weeklyTickets} Ticket${weeklyTickets > 1 ? 's' : ''}`}
              </button>
              
              {userMonthlyTickets && userMonthlyTickets.total > 0 && (
                <div className="text-center text-sm text-yellow-400">
                  📧 Buying tickets earns you monthly draw tickets!
                </div>
              )}
            </div>
          </div>

          {/* Monthly Draw */}
          <div className="glass-card p-8 border-2 border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Monthly Draw</h2>
              <SparklesIcon className="w-8 h-8 text-purple-400" />
            </div>
            
            <div className="mb-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? '...' : monthlyDraw ? parseFloat(monthlyDraw.prizePool_LYX.toFixed(4)) : '0'} LYX
              </div>
              <p className="text-gray-400">
                {monthlyDraw?.isUpcoming ? 'Accumulating Pool' : 'Current Prize Pool'}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">
                {loading ? 'Loading...' : 
                 monthlyDraw?.isUpcoming ? 'Next monthly draw in 4 weeks' :
                 monthlyDraw ? formatTimeRemaining(monthlyDraw.timeRemaining) : 'No active draw'}
              </span>
            </div>
            
            {userMonthlyTickets ? (
              <div className="text-center text-sm text-gray-400 mb-6 space-y-1">
                <p className="text-white font-bold">Your Monthly Tickets: {userMonthlyTickets.total}</p>
                <p>📧 From weekly: {userMonthlyTickets.fromWeekly}</p>
                <p>✏️ From creating: {userMonthlyTickets.fromCreating}</p>
                <p>🎯 From participating: {userMonthlyTickets.fromParticipating}</p>
                {monthlyDraw && !monthlyDraw.isUpcoming && monthlyDraw.executorFee_LYX && monthlyDraw.executorFee_LYX > 0 && (
                  <p className="text-purple-400 font-medium mt-2">
                    🎯 Executor Reward: {monthlyDraw.executorFee_LYX.toFixed(4)} LYX
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-400 mb-6 space-y-1">
                <p>Earn tickets by:</p>
                <p>📧 Buying weekly tickets</p>
                <p>✏️ Creating draws (max 5/month)</p>
                <p>🎯 Participating in draws (max 15/month)</p>
                {monthlyDraw && !monthlyDraw.isUpcoming && monthlyDraw.executorFee_LYX && monthlyDraw.executorFee_LYX > 0 && (
                  <p className="text-purple-400 font-medium mt-2">
                    🎯 Executor Reward: {monthlyDraw.executorFee_LYX.toFixed(4)} LYX
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="text-center text-white font-bold">
                No Direct Purchase Available
              </div>
              <div className="text-center text-gray-400 text-sm">
                Monthly draws use tickets earned through platform participation
              </div>

              <button
                disabled={true}
                className="w-full btn-primary bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 cursor-not-allowed"
              >
                Earn Tickets Through Participation
              </button>
            </div>
          </div>
        </div>

        {/* Platform Stats Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Platform Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-pink-400">
                {loading ? '...' : platformStats ? platformStats.totalTicketsSold : '0'}
              </div>
              <div className="text-sm text-gray-400">Total Tickets</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-purple-400">
                {(weeklyDraw ? 1 : 0) + (monthlyDraw && !monthlyDraw.isUpcoming ? 1 : 0)}
              </div>
              <div className="text-sm text-gray-400">Active Draws</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {loading ? '...' : platformStats ? platformStats.totalExecutions : '0'}
              </div>
              <div className="text-sm text-gray-400">Executions</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-green-400">
                {loading ? '...' : parseFloat(((weeklyDraw ? weeklyDraw.prizePool_LYX : 0) + (monthlyDraw ? monthlyDraw.prizePool_LYX : 0)).toFixed(2))}
              </div>
              <div className="text-sm text-gray-400">Total Prize LYX</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};