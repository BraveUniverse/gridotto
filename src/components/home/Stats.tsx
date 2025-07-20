'use client';

import { useState, useEffect } from 'react';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { 
  TrophyIcon, 
  UsersIcon, 
  TicketIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';

export const Stats = () => {
  const { getContractInfo, getActiveUserDraws, getRecentWinners } = useGridottoContract();
  const [stats, setStats] = useState({
    totalPrizePool: '0',
    totalWinners: 0,
    activeDraws: 0,
    totalDistributed: '0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get contract info
        const contractInfo = await getContractInfo();
        
        // Get active draws count
        const activeDraws = await getActiveUserDraws();
        
        // Get recent winners
        const winners = await getRecentWinners(100);
        
        // Calculate total distributed
        let totalDistributed = BigInt(0);
        winners.forEach((winner: any) => {
          totalDistributed += BigInt(winner.prize);
        });
        
        setStats({
          totalPrizePool: contractInfo?.totalPrizePool || '0',
          totalWinners: winners.length,
          activeDraws: activeDraws.length,
          totalDistributed: totalDistributed.toString()
        });
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [getContractInfo, getActiveUserDraws, getRecentWinners]);

  const statItems = [
    {
      icon: CurrencyDollarIcon,
      label: 'Total Prize Pool',
      value: loading ? '...' : `${Web3.utils.fromWei(stats.totalPrizePool, 'ether')} LYX`,
      color: 'text-yellow-400'
    },
    {
      icon: TrophyIcon,
      label: 'Total Winners',
      value: loading ? '...' : stats.totalWinners.toLocaleString(),
      color: 'text-green-400'
    },
    {
      icon: TicketIcon,
      label: 'Active Draws',
      value: loading ? '...' : stats.activeDraws.toLocaleString(),
      color: 'text-blue-400'
    },
    {
      icon: UsersIcon,
      label: 'Total Distributed',
      value: loading ? '...' : `${Web3.utils.fromWei(stats.totalDistributed, 'ether')} LYX`,
      color: 'text-purple-400'
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Platform Statistics
          </h2>
          <p className="text-xl text-gray-400">
            Real-time stats from the Gridotto ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, index) => (
            <div 
              key={index}
              className="glass-card p-6 text-center hover:scale-105 transition-transform"
            >
              <item.icon className={`w-12 h-12 mx-auto mb-4 ${item.color}`} />
              <p className="text-gray-400 text-sm mb-2">{item.label}</p>
              <p className="text-2xl font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};