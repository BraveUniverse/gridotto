'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SparklesIcon, TicketIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useUPProvider } from '@/hooks/useUPProvider';
import { diamondAbi } from '@/abi';
import Web3 from 'web3';

const DIAMOND_ADDRESS = "0x5Ad808FAE645BA3682170467114e5b80A70bF276";

export const HeroSection = () => {
  const { web3, isConnected } = useUPProvider();
  const [weeklyTickets, setWeeklyTickets] = useState(1);
  const [monthlyTickets, setMonthlyTickets] = useState(1);
  const [buying, setBuying] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Platform data from contract
  const [weeklyDraw, setWeeklyDraw] = useState<any>(null);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadPlatformData = async () => {
    if (!web3 || loading) return;

    try {
      setLoading(true);
      console.log('[HeroSection] Loading platform data...');
      
      const contract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
      
      // Get platform stats
      try {
        const stats = await contract.methods.getPlatformStatistics().call();
        
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
      
      // Find weekly draw
      const nextDrawId = await contract.methods.getNextDrawId().call();
      let foundWeeklyDraw = null;
      
      for (let i = 1; i < Number(nextDrawId) && i <= 10; i++) {
        try {
          const drawDetails = await contract.methods.getDrawDetails(i).call();
          
          // Type guard - ensure drawDetails has the expected structure
          if (!drawDetails || typeof drawDetails !== 'object') {
            console.log(`[HeroSection] Invalid draw details for draw #${i}`);
            continue;
          }
          
          // Check if it's a weekly draw (drawType = 3) and active with safe property access
          const drawType = (drawDetails as any).drawType;
          const isCompleted = (drawDetails as any).isCompleted;
          const isCancelled = (drawDetails as any).isCancelled;
          const prizePool = (drawDetails as any).prizePool;
          const endTime = (drawDetails as any).endTime;
          
          if (Number(drawType) === 3 && !isCompleted && !isCancelled && prizePool) {
            const currentTime = Math.floor(Date.now() / 1000);
            const timeRemaining = Math.max(0, Number(endTime) - currentTime);
            
            foundWeeklyDraw = {
              drawId: i,
              prizePool_LYX: Number(Web3.utils.fromWei(prizePool.toString(), 'ether')),
              ticketPrice_LYX: Number(Web3.utils.fromWei((drawDetails as any).ticketPrice.toString(), 'ether')),
              ticketsSold: Number((drawDetails as any).ticketsSold),
              participantCount: Number((drawDetails as any).participantCount),
              timeRemaining: timeRemaining
            };
            break;
          }
        } catch (error) {
          console.error(`[HeroSection] Error fetching draw #${i}:`, error);
        }
      }
      
      setWeeklyDraw(foundWeeklyDraw);
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('[HeroSection] Platform data loaded:', { weeklyDraw: foundWeeklyDraw, platformStats });
      
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
  }, [web3, isConnected]);

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
    try {
      setBuying(true);
      // This would normally connect to wallet and buy tickets
      console.log('Buying weekly tickets:', weeklyTickets);
    } catch (err) {
      console.error('Error buying weekly tickets:', err);
    } finally {
      setBuying(false);
    }
  };

  const handleBuyMonthly = async () => {
    try {
      setBuying(true);
      // This would normally connect to wallet and buy tickets
      console.log('Buying monthly tickets:', monthlyTickets);
    } catch (err) {
      console.error('Error buying monthly tickets:', err);
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
            The first decentralized lottery platform on LUKSO. Create your own draws or join official weekly & monthly lotteries!
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
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Weekly Draw</h2>
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? '...' : weeklyDraw ? weeklyDraw.prizePool_LYX.toFixed(4) : '0.0000'} LYX
              </div>
              <p className="text-gray-400">Current Prize Pool</p>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">
                {loading ? 'Loading...' : weeklyDraw ? formatTimeRemaining(weeklyDraw.timeRemaining) : 'No active draw'}
              </span>
            </div>
            
            {weeklyDraw && (
              <div className="text-sm text-gray-400 mb-6">
                <p>Tickets sold: {weeklyDraw.ticketsSold} | Participants: {weeklyDraw.participantCount}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-white">Tickets:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeeklyTickets(Math.max(1, weeklyTickets - 1))}
                    className="w-8 h-8 bg-pink-500/20 rounded-lg text-pink-400 hover:bg-pink-500/30"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-white">{weeklyTickets}</span>
                  <button
                    onClick={() => setWeeklyTickets(weeklyTickets + 1)}
                    className="w-8 h-8 bg-pink-500/20 rounded-lg text-pink-400 hover:bg-pink-500/30"
                  >
                    +
                  </button>
                </div>
                <div className="text-gray-400">
                  × {weeklyDraw ? weeklyDraw.ticketPrice_LYX.toFixed(4) : '0.25'} LYX = {weeklyDraw ? (weeklyTickets * weeklyDraw.ticketPrice_LYX).toFixed(4) : (weeklyTickets * 0.25).toFixed(4)} LYX
                </div>
              </div>

              <button
                onClick={handleBuyWeekly}
                disabled={buying || !weeklyDraw}
                className="w-full btn-primary disabled:opacity-50"
              >
                {buying ? 'Processing...' : `Buy ${weeklyTickets} Ticket${weeklyTickets > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          {/* Monthly Draw */}
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Monthly Draw</h2>
              <SparklesIcon className="w-8 h-8 text-purple-400" />
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2">
                Coming Soon
              </div>
              <p className="text-gray-400">Monthly Pool</p>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">Feature in development</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-white">Tickets:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMonthlyTickets(Math.max(1, monthlyTickets - 1))}
                    className="w-8 h-8 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-white">{monthlyTickets}</span>
                  <button
                    onClick={() => setMonthlyTickets(monthlyTickets + 1)}
                    className="w-8 h-8 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30"
                  >
                    +
                  </button>
                </div>
                <div className="text-gray-400">
                  × 0.1 LYX = {(monthlyTickets * 0.1).toFixed(1)} LYX
                </div>
              </div>

              <button
                onClick={handleBuyMonthly}
                disabled={true}
                className="w-full btn-primary bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 opacity-50 cursor-not-allowed"
              >
                Coming Soon
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
                {weeklyDraw ? '1' : '0'}
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
                {loading ? '...' : weeklyDraw ? weeklyDraw.prizePool_LYX.toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-400">Prize Pool LYX</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};