'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { 
  CurrencyDollarIcon,
  TicketIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';

export const StatsSection = () => {
  const { isConnected } = useUPProvider();
  const { getActiveUserDraws, getUserDrawStats, getContractInfo } = useGridottoContract();
  const [stats, setStats] = useState([
    { label: 'Total Prize Pool', value: 0, prefix: '', suffix: ' LYX' },
    { label: 'Active Draws', value: 0, prefix: '', suffix: '' },
    { label: 'Total Participants', value: 0, prefix: '', suffix: '' },
    { label: 'Avg Ticket Price', value: 0, prefix: '', suffix: ' LYX' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get active draws
        const activeDraws = await getActiveUserDraws();
        
        // Calculate total prize pool and participants
        let totalPrizePool = BigInt(0);
        let totalParticipants = 0;
        let totalTicketPrice = BigInt(0);
        let drawCount = 0;
        
        for (const draw of activeDraws) {
          const stats = await getUserDrawStats(draw.drawId);
          if (stats) {
            totalPrizePool += BigInt(stats.prizePool);
            totalParticipants += Number(stats.totalParticipants);
            totalTicketPrice += BigInt(draw.ticketPrice);
            drawCount++;
          }
        }
        
        // Get contract balance
        const contractInfo = await getContractInfo();
        if (contractInfo) {
          totalPrizePool += BigInt(contractInfo.totalPrizePool);
        }
        
        // Calculate average ticket price
        const avgTicketPrice = drawCount > 0 
          ? Number(Web3.utils.fromWei((totalTicketPrice / BigInt(drawCount)).toString(), 'ether'))
          : 1;
        
        setStats([
          { 
            label: 'Total Prize Pool', 
            value: Number(Web3.utils.fromWei(totalPrizePool.toString(), 'ether')), 
            prefix: '', 
            suffix: ' LYX' 
          },
          { 
            label: 'Active Draws', 
            value: activeDraws.length, 
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
        ]);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh every minute
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, [isConnected, getActiveUserDraws, getUserDrawStats, getContractInfo]);

  const icons = [CurrencyDollarIcon, SparklesIcon, UsersIcon, TicketIcon];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Platform Statistics
        </h2>
        
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
                      {stat.value.toLocaleString()}
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