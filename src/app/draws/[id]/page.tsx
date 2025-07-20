'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import Web3 from 'web3';
import { 
  TicketIcon,
  ClockIcon,
  UsersIcon,
  TrophyIcon,
  WalletIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface DrawDetails {
  id: number;
  creator: string;
  drawType: number;
  ticketPrice: string;
  ticketsSold: string;
  maxTickets: string;
  currentPrizePool: string;
  endTime: number;
  isActive: boolean;
  isCompleted: boolean;
  winners: string[];
  participantCount: number;
  minParticipants: number;
  maxParticipants: number;
  executorReward?: string;
}

export default function DrawDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const drawId = parseInt(id as string);
  
  const { account, isConnected } = useUPProvider();
  const { 
    getAdvancedDrawInfo, 
    purchaseTickets, 
    getUserDrawExecutorReward,
    executeUserDraw,
    canUserParticipate
  } = useGridottoContract();
  
  const [draw, setDraw] = useState<DrawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState(1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [canParticipate, setCanParticipate] = useState(true);
  const [participationReason, setParticipationReason] = useState<string>('');

  useEffect(() => {
    const loadDrawDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch advanced draw info
        const drawInfo = await getAdvancedDrawInfo(drawId);
        
        if (drawInfo) {
          // Get executor reward
          const executorReward = await getUserDrawExecutorReward(drawId);
          
          const drawDetails: DrawDetails = {
            id: drawId,
            creator: drawInfo.creator,
            drawType: drawInfo.drawType,
            ticketPrice: drawInfo.ticketPrice,
            ticketsSold: drawInfo.totalTickets.toString(),
            maxTickets: drawInfo.maxParticipants.toString() || '999999',
            currentPrizePool: drawInfo.prizePool,
            endTime: Number(drawInfo.endTime),
            isActive: !drawInfo.isCompleted && Number(drawInfo.endTime) > Date.now() / 1000,
            isCompleted: drawInfo.isCompleted,
            winners: drawInfo.winners || [],
            participantCount: Number(drawInfo.participantCount),
            minParticipants: Number(drawInfo.minParticipants),
            maxParticipants: Number(drawInfo.maxParticipants),
            executorReward
          };
          
          setDraw(drawDetails);
          
          // Check if user can participate
          if (account) {
            const participation = await canUserParticipate(drawId, account);
            setCanParticipate(participation.canParticipate);
            setParticipationReason(participation.reason);
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
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDrawDetails, 30000);
    return () => clearInterval(interval);
  }, [drawId, account, getAdvancedDrawInfo, getUserDrawExecutorReward, canUserParticipate]);

  const handleBuyTickets = async () => {
    if (!draw || !account) return;
    
    console.log('=== BUY TICKETS - STARTING ===');
    console.log('Draw ID:', drawId);
    console.log('Ticket Amount:', buyAmount);
    console.log('Ticket Price (wei):', draw.ticketPrice);
    console.log('Total Cost (wei):', (BigInt(draw.ticketPrice) * BigInt(buyAmount)).toString());
    
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
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        data: err.data
      });
      setError(err.message || 'Failed to buy tickets');
    } finally {
      setBuying(false);
    }
  };

  const handleExecuteDraw = async () => {
    if (!draw || !account) return;
    
    console.log('=== EXECUTE DRAW - STARTING ===');
    console.log('Draw ID:', drawId);
    console.log('Executor Reward:', draw.executorReward);
    console.log('Account:', account);
    
    try {
      setExecuting(true);
      setError(null);
      
      const tx = await executeUserDraw(drawId);
      setTxHash(tx.transactionHash);
      
      // Refresh draw details
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err: any) {
      console.error('Error executing draw:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        data: err.data
      });
      setError(err.message || 'Failed to execute draw');
    } finally {
      setExecuting(false);
    }
  };

  const getRemainingTime = (endTime: number) => {
    const now = Date.now() / 1000;
    const diff = endTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getDrawTypeLabel = (type: number) => {
    switch (type) {
      case 2: return 'LYX Prize';
      case 3: return 'Token Prize';
      case 4: return 'NFT Prize';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Draw not found</h1>
          <Link href="/draws" className="text-primary hover:underline">
            Back to draws
          </Link>
        </div>
      </div>
    );
  }

  const ticketPriceInLYX = parseFloat(Web3.utils.fromWei(draw.ticketPrice, 'ether'));
  const prizePoolInLYX = parseFloat(Web3.utils.fromWei(draw.currentPrizePool, 'ether'));
  const totalCost = ticketPriceInLYX * buyAmount;
  const soldPercentage = draw.maxTickets === '999999' ? 0 : (parseInt(draw.ticketsSold) / parseInt(draw.maxTickets)) * 100;
  const remainingTickets = draw.maxTickets === '999999' ? 999999 : parseInt(draw.maxTickets) - parseInt(draw.ticketsSold);
  const canExecute = !draw.isActive && !draw.isCompleted && draw.participantCount >= draw.minParticipants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/draws" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <span>←</span>
          <span>Back to draws</span>
        </Link>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Draw details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Draw #{draw.id}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                      {getDrawTypeLabel(draw.drawType)}
                    </span>
                    {draw.isCompleted ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                        Completed
                      </span>
                    ) : draw.isActive ? (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                        Ready to Execute
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Prize Pool</p>
                  <p className="text-3xl font-bold text-primary">{prizePoolInLYX.toFixed(2)} LYX</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <TicketIcon className="w-4 h-4" />
                    <span className="text-sm">Tickets Sold</span>
                  </div>
                  <p className="text-xl font-bold text-white">{draw.ticketsSold}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <UsersIcon className="w-4 h-4" />
                    <span className="text-sm">Participants</span>
                  </div>
                  <p className="text-xl font-bold text-white">{draw.participantCount}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">Time Left</span>
                  </div>
                  <p className="text-xl font-bold text-white">{getRemainingTime(draw.endTime)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <WalletIcon className="w-4 h-4" />
                    <span className="text-sm">Creator</span>
                  </div>
                  <p className="text-sm font-mono text-white">
                    {draw.creator.slice(0, 6)}...{draw.creator.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Winners (if completed) */}
            {draw.isCompleted && draw.winners.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-400" />
                  Winners
                </h2>
                <div className="space-y-2">
                  {draw.winners.map((winner, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400">#{index + 1}</span>
                        <span className="font-mono text-white">
                          {winner.slice(0, 6)}...{winner.slice(-4)}
                        </span>
                      </div>
                      <span className="text-primary font-bold">
                        {(prizePoolInLYX / draw.winners.length).toFixed(2)} LYX
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {draw.minParticipants > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="w-6 h-6 text-blue-400" />
                  Requirements
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Minimum Participants</span>
                    <span className="text-white font-medium">
                      {draw.participantCount} / {draw.minParticipants}
                    </span>
                  </div>
                  {draw.participantCount < draw.minParticipants && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-400 text-sm flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        Need {draw.minParticipants - draw.participantCount} more participants to execute
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Actions */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingCartIcon className="w-6 h-6 text-primary" />
                Actions
              </h2>

              {/* Buy tickets section */}
              {draw.isActive && (
                <>
                  <div className="space-y-4 mb-6">
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
                        <span className="text-white">{ticketPriceInLYX} LYX</span>
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
                  </div>

                  {canParticipate ? (
                    <button
                      onClick={handleBuyTickets}
                      disabled={buying || !isConnected}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                                              {buying ? (
                          <span className="flex items-center justify-center gap-2">
                           <SparklesIcon className="w-4 h-4 animate-spin" />
                           Processing...
                          </span>
                      ) : isConnected ? (
                        'Buy Tickets'
                      ) : (
                        'Connect Wallet to Buy'
                      )}
                    </button>
                  ) : (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{participationReason}</p>
                    </div>
                  )}
                </>
              )}

              {/* Execute draw section */}
              {canExecute && (
                <button
                  onClick={handleExecuteDraw}
                  disabled={executing || !isConnected}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                                      {executing ? (
                      <>
                       <SparklesIcon className="w-4 h-4 animate-spin" />
                       <span>Executing...</span>
                      </>
                  ) : (
                    <>
                                             <PlayIcon className="w-4 h-4" />
                      <span>
                        Execute Draw
                        {draw.executorReward && Number(draw.executorReward) > 0 && (
                          <span className="ml-1 text-xs opacity-80">
                            & Earn {Web3.utils.fromWei(draw.executorReward, 'ether')} LYX
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Status messages */}
              {draw.isCompleted && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Draw completed successfully
                  </p>
                </div>
              )}

              {!draw.isActive && !draw.isCompleted && draw.participantCount < draw.minParticipants && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Minimum {draw.minParticipants} participants required
                  </p>
                </div>
              )}

              {/* Error and success messages */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {txHash && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-4">
                  <p className="text-green-400 text-sm">
                    Transaction submitted!
                  </p>
                  <a
                    href={`https://explorer.execution.testnet.lukso.network/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs"
                  >
                    View on explorer →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}