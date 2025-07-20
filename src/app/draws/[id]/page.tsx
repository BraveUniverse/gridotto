'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { 
  TicketIcon,
  TrophyIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';

interface DrawDetails {
  id: number;
  creator: string;
  drawType: number;
  ticketPrice: string;
  ticketsSold: string;
  maxTickets: string;
  currentPrizePool: string;
  endTime: string;
  isCompleted: boolean;
  prizeModel?: number;
  totalWinners?: number;
  requirements?: {
    type: number;
    tokenAddress?: string;
    minAmount?: string;
  };
  totalParticipants?: string;
}

interface PrizeDistribution {
  tier: number;
  percentage: number;
  amount: string;
  winners: number;
}

export default function DrawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, account } = useUPProvider();
  const { getDrawInfo, getUserDrawStats, purchaseTickets } = useGridottoContract();
  
  const [draw, setDraw] = useState<DrawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState(1);
  const [buying, setBuying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [prizeDistribution, setPrizeDistribution] = useState<PrizeDistribution[]>([]);
  
  const drawId = parseInt(params.id as string);

  useEffect(() => {
    const loadDrawDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch draw details
        const drawInfo = await getDrawInfo(drawId);
        
        if (drawInfo) {
          // Get additional stats
          const stats = await getUserDrawStats(drawId);
          
          const drawDetails: DrawDetails = {
            id: drawInfo.drawId,
            creator: drawInfo.creator,
            drawType: drawInfo.prizeType === 'LYX' ? 0 : drawInfo.prizeType === 'LSP7' ? 1 : 2,
            ticketPrice: drawInfo.ticketPrice,
            ticketsSold: drawInfo.totalTicketsSold.toString(),
            maxTickets: drawInfo.maxTickets.toString(),
            currentPrizePool: drawInfo.prizeAmount,
            endTime: drawInfo.endTime,
            isCompleted: !drawInfo.isActive,
            prizeModel: 0,
            totalWinners: 1,
            totalParticipants: stats?.totalParticipants || '0'
          };
          
          setDraw(drawDetails);
          
          // Calculate prize distribution based on prize model
          if (drawDetails.prizeModel !== undefined && drawDetails.totalWinners) {
            const distributions = calculatePrizeDistribution(
              parseFloat(Web3.utils.fromWei(drawDetails.currentPrizePool, 'ether')),
              drawDetails.prizeModel,
              drawDetails.totalWinners
            );
            setPrizeDistribution(distributions);
          }
        }
        
      } catch (err) {
        console.error('Error loading draw details:', err);
        setError('Failed to load draw details');
      } finally {
        setLoading(false);
      }
    };

    loadDrawDetails();
  }, [drawId, getDrawInfo, getUserDrawStats]);

  const calculatePrizeDistribution = (prizePool: number, prizeModel: number, totalWinners: number): PrizeDistribution[] => {
    const distributions: PrizeDistribution[] = [];
    
    // Define prize distribution percentages based on model
    let percentages: number[] = [];
    switch (prizeModel) {
      case 0: // Winner takes all
        percentages = [100];
        break;
      case 1: // 50/30/20
        percentages = [50, 30, 20];
        break;
      case 2: // 40/30/20/10
        percentages = [40, 30, 20, 10];
        break;
      case 3: // Equal distribution
        percentages = Array(totalWinners).fill(100 / totalWinners);
        break;
      default:
        percentages = [100];
    }
    
    // Calculate actual amounts
    percentages.forEach((percentage, index) => {
      if (index < totalWinners) {
        distributions.push({
          tier: index + 1,
          percentage,
          amount: ((prizePool * percentage) / 100).toFixed(2),
          winners: 1
        });
      }
    });
    
    return distributions;
  };

  const handleBuyTickets = async () => {
    if (!isConnected || !account || !draw) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setBuying(true);
      setError(null);
      setTxHash(null);
      
              const tx = await purchaseTickets(drawId, buyAmount, draw.ticketPrice);
        setTxHash(tx.transactionHash);
      
      // Refresh draw details
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err: any) {
      console.error('Error buying tickets:', err);
      setError(err.message || 'Failed to buy tickets');
    } finally {
      setBuying(false);
    }
  };

  const getRemainingTime = (endTime: string) => {
    const end = parseInt(endTime) * 1000;
    const now = Date.now();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getDrawTypeName = (type: number) => {
    switch (type) {
      case 0: return 'Token Draw';
      case 1: return 'NFT Draw';
      case 2: return 'Mixed Draw';
      default: return 'Custom Draw';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-400 mt-4">Loading draw details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Draw Not Found</h2>
            <p className="text-gray-400 mb-6">The draw you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => router.push('/draws')} className="btn-primary">
              Back to All Draws
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalCost = parseFloat(draw.ticketPrice) * buyAmount;
  const soldPercentage = (parseInt(draw.ticketsSold) / parseInt(draw.maxTickets)) * 100;
  const remainingTickets = parseInt(draw.maxTickets) - parseInt(draw.ticketsSold);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/draws')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to All Draws
        </button>

        {/* Draw Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-white">Draw #{draw.id}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  draw.isCompleted 
                    ? 'bg-gray-500/20 text-gray-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {draw.isCompleted ? 'Completed' : 'Active'}
                </span>
              </div>
              <p className="text-gray-400 mb-2">{getDrawTypeName(draw.drawType)}</p>
              <p className="text-sm text-gray-500 font-mono">
                Created by: {draw.creator.slice(0, 6)}...{draw.creator.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Time Remaining</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <ClockIcon className="w-6 h-6" />
                {getRemainingTime(draw.endTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prize Pool Info */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                Prize Pool
              </h2>
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  {draw.currentPrizePool} LYX
                </p>
                <p className="text-gray-400 mt-2">Total Prize Pool</p>
              </div>
              
              {prizeDistribution.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Prize Distribution</h3>
                  {prizeDistribution.map((dist) => (
                    <div key={dist.tier} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          dist.tier === 1 ? 'bg-yellow-400 text-black' :
                          dist.tier === 2 ? 'bg-gray-300 text-black' :
                          dist.tier === 3 ? 'bg-orange-400 text-black' :
                          'bg-gray-600 text-white'
                        }`}>
                          {dist.tier}
                        </div>
                        <span className="text-white">
                          {dist.tier === 1 ? '1st Place' :
                           dist.tier === 2 ? '2nd Place' :
                           dist.tier === 3 ? '3rd Place' :
                           `${dist.tier}th Place`}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{dist.amount} LYX</p>
                        <p className="text-xs text-gray-400">{dist.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ticket Sales Progress */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
                Ticket Sales
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{draw.ticketsSold} / {draw.maxTickets} tickets</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{soldPercentage.toFixed(1)}% sold</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Ticket Price</p>
                    <p className="text-xl font-bold text-white">{draw.ticketPrice} LYX</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Remaining</p>
                    <p className="text-xl font-bold text-white">{remainingTickets} tickets</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Participants */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-green-400" />
                Recent Participants
              </h2>
              <div className="space-y-2">
                {participants.slice(0, 5).map((participant, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                        <UsersIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-white font-mono text-sm">
                        {participant.slice(0, 6)}...{participant.slice(-4)}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">1 ticket</span>
                  </div>
                ))}
                {participants.length > 5 && (
                  <p className="text-center text-gray-400 text-sm mt-4">
                    And {participants.length - 5} more participants...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Buy Tickets */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingCartIcon className="w-6 h-6 text-primary" />
                Buy Tickets
              </h2>
              
              {!draw.isCompleted && remainingTickets > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Number of Tickets
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
                        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                        disabled={buyAmount <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(Math.max(1, Math.min(remainingTickets, parseInt(e.target.value) || 1)))}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-center"
                        min="1"
                        max={remainingTickets}
                      />
                      <button
                        onClick={() => setBuyAmount(Math.min(remainingTickets, buyAmount + 1))}
                        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                        disabled={buyAmount >= remainingTickets}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 py-4 border-t border-white/10">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price per ticket</span>
                      <span className="text-white">{draw.ticketPrice} LYX</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity</span>
                      <span className="text-white">×{buyAmount}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-white font-medium">Total Cost</span>
                      <span className="text-xl font-bold text-primary">{totalCost.toFixed(2)} LYX</span>
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <button
                      onClick={handleBuyTickets}
                      disabled={buying}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buying ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Buy Tickets'
                      )}
                    </button>
                  ) : (
                    <button className="w-full btn-secondary">
                      Connect Wallet to Buy
                    </button>
                  )}
                  
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {txHash && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 text-sm mb-2 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Transaction submitted!
                      </p>
                      <a
                        href={`https://explorer.execution.testnet.lukso.network/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 text-xs font-mono"
                      >
                        View on Explorer →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {draw.isCompleted ? 'This draw has ended' : 'No tickets available'}
                  </p>
                </div>
              )}
              
              {/* Draw Requirements */}
              {draw.requirements && draw.requirements.type > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Requirements</h3>
                  <div className="space-y-2">
                    {draw.requirements.type === 1 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                        <span className="text-white">Must hold token</span>
                      </div>
                    )}
                    {draw.requirements.type === 2 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                        <span className="text-white">Must hold NFT</span>
                      </div>
                    )}
                    {draw.requirements.minAmount && (
                      <div className="text-xs text-gray-400 ml-6">
                        Min amount: {draw.requirements.minAmount}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}