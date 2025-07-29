'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from '@/hooks/useUPProvider';
import { 
  CurrencyDollarIcon,
  TicketIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { diamondAbi } from '@/abi';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';

// Diamond Contract Address
const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

export const StatsSection = () => {
  const { web3, isConnected } = useUPProvider();
  const [stats, setStats] = useState([
    { label: 'Total Prize Pool', value: 0, prefix: '', suffix: ' LYX' },
    { label: 'Active Draws', value: 0, prefix: '', suffix: '' },
    { label: 'Total Participants', value: 0, prefix: '', suffix: '' },
    { label: 'Avg Ticket Price', value: 0, prefix: '', suffix: ' LYX' }
  ]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadRealStats = async () => {
    if (!web3 || loading) return;

    try {
      setLoading(true);
      console.log('[StatsSection] Loading real contract data...');
      
      const contract = new web3.eth.Contract(diamondAbi as any, DIAMOND_ADDRESS);
      
      // Get next draw ID to know how many draws exist
      const nextDrawId = await contract.methods.getNextDrawId().call();
      console.log('[StatsSection] Next draw ID:', nextDrawId);
      
      let totalPrizePool = BigInt(0);
      let activeDrawsCount = 0;
      let totalParticipants = 0;
      let totalTicketPrices = BigInt(0);
      let ticketPriceCount = 0;
      
      // Check draws 1 to nextDrawId-1
      for (let i = 1; i < Number(nextDrawId) && i <= 10; i++) {
        try {
          const drawDetails = await contract.methods.getDrawDetails(i).call();
          
          // Type guard - ensure drawDetails has the expected structure
          if (!drawDetails || typeof drawDetails !== 'object') {
            console.log(`[StatsSection] Invalid draw details for draw #${i}`);
            continue;
          }
          
          // Check if draw is active with safe property access
          const currentTime = Math.floor(Date.now() / 1000);
          const isCompleted = (drawDetails as any).isCompleted;
          const isCancelled = (drawDetails as any).isCancelled;
          const endTime = (drawDetails as any).endTime;
          const prizePool = (drawDetails as any).prizePool;
          
          const isActive = !isCompleted && !isCancelled && Number(endTime) > currentTime;
          
          if (isActive && prizePool) {
            activeDrawsCount++;
            // Safe BigInt conversion
            const prizePoolBigInt = typeof prizePool === 'bigint' ? prizePool : BigInt(prizePool.toString());
            totalPrizePool += prizePoolBigInt;
            
            totalParticipants += Number((drawDetails as any).participantCount);
            
            // Safe BigInt conversion for ticket price
            const ticketPrice = (drawDetails as any).ticketPrice;
            const ticketPriceBigInt = typeof ticketPrice === 'bigint' ? ticketPrice : BigInt(ticketPrice.toString());
            totalTicketPrices += ticketPriceBigInt;
            ticketPriceCount++;
          }
          
          console.log(`[StatsSection] Draw #${i}: Active=${isActive}, Prize=${prizePool}, Participants=${(drawDetails as any).participantCount}`);
        } catch (error) {
          console.error(`[StatsSection] Error fetching draw #${i}:`, error);
        }
      }
      
      // Calculate average ticket price
      const avgTicketPrice = ticketPriceCount > 0 
        ? Number(Web3.utils.fromWei((totalTicketPrices / BigInt(ticketPriceCount)).toString(), 'ether'))
        : 0.1;
      
      const newStats = [
        { 
          label: 'Total Prize Pool', 
          value: Number(Web3.utils.fromWei(totalPrizePool.toString(), 'ether')), 
          prefix: '', 
          suffix: ' LYX' 
        },
        { 
          label: 'Active Draws', 
          value: activeDrawsCount, 
          prefix: '', 
          suffix: '' 
        },
        { 
          label: 'Total Participants', 
          value: totalParticipants, 
          prefix: '', 
          suffix: '' 
        },
        { 
          label: 'Avg Ticket Price', 
          value: avgTicketPrice, 
          prefix: '', 
          suffix: ' LYX' 
        }
      ];
      
      console.log('[StatsSection] Final stats:', newStats);
      setStats(newStats);
      setLastUpdate(new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error('[StatsSection] Error loading real stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load stats only once when component mounts and web3 is available
  useEffect(() => {
    if (web3 && isConnected) {
      loadRealStats();
    }
  }, [web3, isConnected]); // Only depend on web3 and isConnected

  const icons = [CurrencyDollarIcon, SparklesIcon, UsersIcon, TicketIcon];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Platform Statistics
          </h2>
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-gray-400">
              {lastUpdate ? `Last updated: ${lastUpdate}` : 'Loading...'}
            </p>
            <button
              onClick={loadRealStats}
              disabled={loading || !web3}
              className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 disabled:opacity-50 text-sm"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = icons[index];
            return (
              <div
                key={stat.label}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-pink-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-pink-400" />
                  </div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
                
                <p className="text-3xl font-bold text-white">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>
                      {stat.prefix}
                      {typeof stat.value === 'number' ? 
                        (stat.suffix === ' LYX' ? 
                          parseFloat(stat.value.toFixed(4)).toString() : 
                          stat.value.toLocaleString()
                        ) : 
                        stat.value
                      }
                      {stat.suffix}
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};