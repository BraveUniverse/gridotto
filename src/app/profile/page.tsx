'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { 
  UserCircleIcon,
  TicketIcon,
  TrophyIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';

interface UserStats {
  totalTicketsBought: number;
  totalSpent: string;
  totalWinnings: string;
  drawsParticipated: number;
  drawsWon: number;
  drawsCreated: number;
  winRate: number;
  roi: number;
}

interface TicketHistory {
  txHash: string;
  drawType: number;
  amount: number;
  timestamp: number;
  blockNumber: number;
}

interface WinningHistory {
  txHash: string;
  drawNumber: number;
  prize: string;
  timestamp: number;
  blockNumber: number;
}

export default function ProfilePage() {
  const { isConnected, account } = useUPProvider();
  const { getActiveUserDraws, web3, gridottoContract } = useGridottoContract();
  const [userStats, setUserStats] = useState<UserStats>({
    totalTicketsBought: 0,
    totalSpent: '0',
    totalWinnings: '0',
    drawsParticipated: 0,
    drawsWon: 0,
    drawsCreated: 0,
    winRate: 0,
    roi: 0
  });
  const [ticketHistory, setTicketHistory] = useState<TicketHistory[]>([]);
  const [winningHistory, setWinningHistory] = useState<WinningHistory[]>([]);
  const [userDraws, setUserDraws] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'winnings' | 'created'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isConnected || !account || !web3 || !gridottoContract) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch ticket purchase events
        const ticketEvents = await gridottoContract.getPastEvents('TicketPurchased', {
          filter: { buyer: account },
          fromBlock: 0,
          toBlock: 'latest'
        });

        // Fetch winning events
        const winningEvents = await gridottoContract.getPastEvents('DrawExecuted', {
          filter: { winner: account },
          fromBlock: 0,
          toBlock: 'latest'
        });

        // Process ticket history
        const tickets: TicketHistory[] = [];
        let totalSpentWei = BigInt(0);
        const uniqueDraws = new Set<string>();

        for (const event of ticketEvents) {
          const block = await web3.eth.getBlock(event.blockNumber);
          tickets.push({
            txHash: event.transactionHash,
            drawType: parseInt(event.returnValues.drawType),
            amount: parseInt(event.returnValues.amount),
            timestamp: Number(block.timestamp),
            blockNumber: event.blockNumber
          });
          
          // Calculate total spent (assuming standard ticket price)
          const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
          const tx = await web3.eth.getTransaction(event.transactionHash);
          totalSpentWei += BigInt(tx.value);
          
          uniqueDraws.add(`${event.returnValues.drawType}-${event.blockNumber}`);
        }

        // Process winning history
        const winnings: WinningHistory[] = [];
        let totalWinningsWei = BigInt(0);

        for (const event of winningEvents) {
          const block = await web3.eth.getBlock(event.blockNumber);
          winnings.push({
            txHash: event.transactionHash,
            drawNumber: parseInt(event.returnValues.drawNumber),
            prize: Web3.utils.fromWei(event.returnValues.prize, 'ether'),
            timestamp: Number(block.timestamp),
            blockNumber: event.blockNumber
          });
          totalWinningsWei += BigInt(event.returnValues.prize);
        }

        // Fetch user created draws
        const createdDraws = await getActiveUserDraws();

        // Calculate stats
        const totalTickets = tickets.reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = Web3.utils.fromWei(totalSpentWei.toString(), 'ether');
        const totalWinningsAmount = Web3.utils.fromWei(totalWinningsWei.toString(), 'ether');
        const winRate = uniqueDraws.size > 0 ? (winnings.length / uniqueDraws.size) * 100 : 0;
        const roi = parseFloat(totalSpent) > 0 
          ? ((parseFloat(totalWinningsAmount) - parseFloat(totalSpent)) / parseFloat(totalSpent)) * 100 
          : 0;

        setUserStats({
          totalTicketsBought: totalTickets,
          totalSpent,
          totalWinnings: totalWinningsAmount,
          drawsParticipated: uniqueDraws.size,
          drawsWon: winnings.length,
          drawsCreated: createdDraws.length,
          winRate,
          roi
        });

        setTicketHistory(tickets.sort((a, b) => b.timestamp - a.timestamp));
        setWinningHistory(winnings.sort((a, b) => b.timestamp - a.timestamp));
        setUserDraws(createdDraws);

      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isConnected, account, web3, gridottoContract, getActiveUserDraws]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDrawTypeName = (type: number) => {
    switch (type) {
      case 0: return 'Daily Draw';
      case 1: return 'Weekly Draw';
      case 2: return 'Monthly Draw';
      default: return 'User Draw';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'tickets', label: 'Tickets', icon: TicketIcon },
    { id: 'winnings', label: 'Winnings', icon: TrophyIcon },
    { id: 'created', label: 'Created Draws', icon: SparklesIcon }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="glass-card p-12 text-center max-w-md mx-auto">
            <UserCircleIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-gray-400 font-mono text-sm">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total ROI</p>
                <p className={`text-2xl font-bold ${userStats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userStats.roi >= 0 ? '+' : ''}{userStats.roi.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <TicketIcon className="w-8 h-8 text-primary" />
              <span className="text-sm text-gray-400">Total Tickets</span>
            </div>
            <p className="text-3xl font-bold text-white">{userStats.totalTicketsBought}</p>
            <p className="text-sm text-gray-400 mt-2">{userStats.drawsParticipated} draws</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-400">Total Spent</span>
            </div>
            <p className="text-3xl font-bold text-white">{parseFloat(userStats.totalSpent).toFixed(2)} LYX</p>
            <p className="text-sm text-gray-400 mt-2">Investment</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-sm text-gray-400">Total Winnings</span>
            </div>
            <p className="text-3xl font-bold text-white">{parseFloat(userStats.totalWinnings).toFixed(2)} LYX</p>
            <p className="text-sm text-gray-400 mt-2">{userStats.drawsWon} wins</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-400">Win Rate</span>
            </div>
            <p className="text-3xl font-bold text-white">{userStats.winRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-400 mt-2">Success rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card">
          <div className="border-b border-white/10">
            <div className="flex space-x-1 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-400 mt-4">Loading your data...</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Activity Chart Placeholder */}
                      <div className="glass-card p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Activity Overview</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                          <p>Activity chart coming soon</p>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="glass-card p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          {[...ticketHistory.slice(0, 3), ...winningHistory.slice(0, 2)]
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .slice(0, 5)
                            .map((activity, index) => (
                              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                  {'prize' in activity ? (
                                    <TrophyIcon className="w-5 h-5 text-yellow-400" />
                                  ) : (
                                    <TicketIcon className="w-5 h-5 text-primary" />
                                  )}
                                  <div>
                                    <p className="text-white text-sm">
                                      {'prize' in activity ? `Won ${activity.prize} LYX` : `Bought ${activity.amount} tickets`}
                                    </p>
                                    <p className="text-gray-500 text-xs">{formatDate(activity.timestamp)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Ticket Purchase History</h3>
                    {ticketHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No tickets purchased yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Draw Type</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Tickets</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ticketHistory.map((ticket, index) => (
                              <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-white">{formatDate(ticket.timestamp)}</td>
                                <td className="py-3 px-4">
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                    {getDrawTypeName(ticket.drawType)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-white">{ticket.amount}</td>
                                <td className="py-3 px-4">
                                  <a
                                    href={`https://explorer.execution.testnet.lukso.network/tx/${ticket.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 text-sm font-mono"
                                  >
                                    {ticket.txHash.slice(0, 8)}...
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Winnings Tab */}
                {activeTab === 'winnings' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Winning History</h3>
                    {winningHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No winnings yet</p>
                        <p className="text-sm text-gray-500 mt-2">Keep playing to win!</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Draw #</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Prize</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction</th>
                            </tr>
                          </thead>
                          <tbody>
                            {winningHistory.map((winning, index) => (
                              <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-white">{formatDate(winning.timestamp)}</td>
                                <td className="py-3 px-4 text-white">#{winning.drawNumber}</td>
                                <td className="py-3 px-4">
                                  <span className="text-green-400 font-bold">{winning.prize} LYX</span>
                                </td>
                                <td className="py-3 px-4">
                                  <a
                                    href={`https://explorer.execution.testnet.lukso.network/tx/${winning.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 text-sm font-mono"
                                  >
                                    {winning.txHash.slice(0, 8)}...
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Created Draws Tab */}
                {activeTab === 'created' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Your Created Draws</h3>
                    {userDraws.length === 0 ? (
                      <div className="text-center py-12">
                        <SparklesIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">You haven't created any draws yet</p>
                        <a href="/create-draw" className="btn-primary mt-4 inline-block">
                          Create Your First Draw
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userDraws.map((draw) => (
                          <div key={draw.id} className="glass-card p-6 hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                Draw #{draw.id}
                              </span>
                              <span className={`text-xs ${draw.isCompleted ? 'text-gray-400' : 'text-green-400'}`}>
                                {draw.isCompleted ? 'Completed' : 'Active'}
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Prize Pool</span>
                                <span className="text-white font-bold">{draw.currentPrizePool} LYX</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Tickets Sold</span>
                                <span className="text-white">{draw.ticketsSold} / {draw.maxTickets}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Ticket Price</span>
                                <span className="text-white">{draw.ticketPrice} LYX</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">End Time</span>
                                <span className="text-white text-sm">
                                  {new Date(parseInt(draw.endTime) * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <a 
                              href={`/draws/${draw.id}`}
                              className="mt-4 w-full btn-secondary text-center block"
                            >
                              View Details
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}