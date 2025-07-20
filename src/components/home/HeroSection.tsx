'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SparklesIcon, TicketIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import Web3 from 'web3';

export const HeroSection = () => {
  const { 
    getCurrentDrawInfo, 
    getCurrentDrawPrize, 
    getMonthlyPrize,
    getTicketPrice,
    buyTickets,
    buyMonthlyTickets 
  } = useGridottoContract();
  
  const [weeklyPrize, setWeeklyPrize] = useState('0');
  const [monthlyPrize, setMonthlyPrize] = useState('0');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [drawInfo, setDrawInfo] = useState<any>(null);
  const [weeklyTickets, setWeeklyTickets] = useState(1);
  const [monthlyTickets, setMonthlyTickets] = useState(1);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [info, weekly, monthly, price] = await Promise.all([
          getCurrentDrawInfo(),
          getCurrentDrawPrize(),
          getMonthlyPrize(),
          getTicketPrice()
        ]);
        
        setDrawInfo(info);
        setWeeklyPrize(weekly);
        setMonthlyPrize(monthly);
        setTicketPrice(price);
      } catch (err) {
        console.error('Error loading official draw data:', err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [getCurrentDrawInfo, getCurrentDrawPrize, getMonthlyPrize, getTicketPrice]);

  const handleBuyWeeklyTickets = async () => {
    try {
      setBuying(true);
      await buyTickets(weeklyTickets);
      // Refresh data
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error('Error buying weekly tickets:', err);
    } finally {
      setBuying(false);
    }
  };

  const handleBuyMonthlyTickets = async () => {
    try {
      setBuying(true);
      await buyMonthlyTickets(monthlyTickets);
      // Refresh data
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error('Error buying monthly tickets:', err);
    } finally {
      setBuying(false);
    }
  };

  const formatTimeRemaining = (timestamp: string) => {
    const now = Date.now() / 1000;
    const diff = Number(timestamp) - now;
    
    if (diff <= 0) return 'Starting soon...';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const ticketPriceInLYX = Web3.utils.fromWei(ticketPrice, 'ether');
  const weeklyPrizeInLYX = Web3.utils.fromWei(weeklyPrize, 'ether');
  const monthlyPrizeInLYX = Web3.utils.fromWei(monthlyPrize, 'ether');

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
              <div className="flex items-center gap-2 text-primary">
                <ClockIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {drawInfo ? formatTimeRemaining(drawInfo.drawTime) : 'Loading...'}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-2">Current Prize Pool</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {weeklyPrizeInLYX} LYX
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWeeklyTickets(Math.max(1, weeklyTickets - 1))}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={weeklyTickets}
                    onChange={(e) => setWeeklyTickets(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-center"
                    min="1"
                  />
                  <button
                    onClick={() => setWeeklyTickets(weeklyTickets + 1)}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ticket Price</span>
                  <span className="text-white">{ticketPriceInLYX} LYX</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Total Cost</span>
                  <span className="text-white font-bold">
                    {(Number(ticketPriceInLYX) * weeklyTickets).toFixed(2)} LYX
                  </span>
                </div>
              </div>

              <button
                onClick={handleBuyWeeklyTickets}
                disabled={buying}
                className="w-full btn-primary"
              >
                {buying ? (
                  <span className="flex items-center justify-center gap-2">
                    <SparklesIcon className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <TicketIcon className="w-5 h-5" />
                    Buy Tickets
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monthly Draw */}
          <div className="glass-card p-8 border-2 border-yellow-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Monthly Draw</h2>
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex items-center gap-2 text-primary">
                <ClockIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {drawInfo ? formatTimeRemaining(drawInfo.monthlyDrawTime) : 'Loading...'}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-2">MEGA Prize Pool</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {monthlyPrizeInLYX} LYX
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMonthlyTickets(Math.max(1, monthlyTickets - 1))}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={monthlyTickets}
                    onChange={(e) => setMonthlyTickets(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-center"
                    min="1"
                  />
                  <button
                    onClick={() => setMonthlyTickets(monthlyTickets + 1)}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ticket Price</span>
                  <span className="text-white">{ticketPriceInLYX} LYX</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Total Cost</span>
                  <span className="text-white font-bold">
                    {(Number(ticketPriceInLYX) * monthlyTickets).toFixed(2)} LYX
                  </span>
                </div>
              </div>

              <button
                onClick={handleBuyMonthlyTickets}
                disabled={buying}
                className="w-full btn-primary bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500"
              >
                {buying ? (
                  <span className="flex items-center justify-center gap-2">
                    <SparklesIcon className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <TicketIcon className="w-5 h-5" />
                    Buy Monthly Tickets
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};