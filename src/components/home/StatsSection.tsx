'use client';

import { useState } from 'react';
import { 
  CurrencyDollarIcon,
  TicketIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import contractData from '@/data/contractData.json';

export const StatsSection = () => {
  const [stats] = useState([
    { 
      label: 'Total Prize Pool', 
      value: contractData.summary.total_active_prize_pool_LYX, 
      prefix: '', 
      suffix: ' LYX' 
    },
    { 
      label: 'Active Draws', 
      value: contractData.summary.total_active_draws, 
      prefix: '', 
      suffix: '' 
    },
    { 
      label: 'Total Participants', 
      value: contractData.summary.total_participants, 
      prefix: '', 
      suffix: '' 
    },
    { 
      label: 'Avg Ticket Price', 
      value: contractData.summary.average_ticket_price_LYX, 
      prefix: '', 
      suffix: ' LYX' 
    }
  ]);

  const icons = [CurrencyDollarIcon, SparklesIcon, UsersIcon, TicketIcon];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Platform Statistics
        </h2>
        
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            Last updated: {new Date(contractData.timestamp).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Network: {contractData.network} | Contract: {contractData.contract_address.slice(0, 8)}...
          </p>
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
                  {stat.prefix}
                  {typeof stat.value === 'number' ? stat.value.toFixed(4) : stat.value}
                  {stat.suffix}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};