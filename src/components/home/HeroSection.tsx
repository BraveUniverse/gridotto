'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SparklesIcon, TicketIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';
import contractData from '@/data/contractData.json';

export const HeroSection = () => {
  const [weeklyTickets, setWeeklyTickets] = useState(1);
  const [monthlyTickets, setMonthlyTickets] = useState(1);
  const [buying, setBuying] = useState(false);

  // Get platform data from contract
  const weeklyDraw = contractData.active_draws.find(draw => draw.drawTypeName === 'WEEKLY');
  const weeklyPrize = weeklyDraw ? weeklyDraw.prizePool_LYX : 0;
  const weeklyTicketPrice = weeklyDraw ? weeklyDraw.ticketPrice_LYX : 0.25;
  const monthlyPrize = contractData.platform_info.monthlyPoolBalance_LYX;
  const monthlyTicketPrice = 0.1; // Default monthly ticket price

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
          </div>
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
                {weeklyPrize.toFixed(4)} LYX
              </div>
              <p className="text-gray-400">Current Prize Pool</p>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">
                {weeklyDraw ? formatTimeRemaining(weeklyDraw.timeRemaining) : 'Loading...'}
              </span>
            </div>
            
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
                  × {weeklyTicketPrice.toFixed(4)} LYX = {(weeklyTickets * weeklyTicketPrice).toFixed(4)} LYX
                </div>
              </div>

              <button
                onClick={handleBuyWeekly}
                disabled={buying}
                className="w-full btn-primary"
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
                {monthlyPrize.toFixed(9)} LYX
              </div>
              <p className="text-gray-400">Monthly Pool</p>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">30 days remaining</span>
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
                  × {monthlyTicketPrice.toFixed(1)} LYX = {(monthlyTickets * monthlyTicketPrice).toFixed(1)} LYX
                </div>
              </div>

              <button
                onClick={handleBuyMonthly}
                disabled={buying}
                className="w-full btn-primary bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500"
              >
                {buying ? 'Processing...' : `Buy ${monthlyTickets} Ticket${monthlyTickets > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>

        {/* Platform Stats Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Platform Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-pink-400">{contractData.platform_stats.totalTicketsSold}</div>
              <div className="text-sm text-gray-400">Total Tickets</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-purple-400">{contractData.summary.total_active_draws}</div>
              <div className="text-sm text-gray-400">Active Draws</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-yellow-400">{contractData.platform_stats.totalExecutions}</div>
              <div className="text-sm text-gray-400">Executions</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-2xl font-bold text-green-400">{contractData.summary.total_active_prize_pool_LYX.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Prize Pool LYX</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};