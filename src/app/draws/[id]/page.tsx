'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEthers } from '@/contexts/EthersContext';
import { useGridottoCoreV2 } from '@/hooks/useGridottoCoreV2';
import { useGridottoExecutionV2 } from '@/hooks/useGridottoExecutionV2';
import { useGridottoRefund } from '@/hooks/useGridottoRefund';
import { 
  TicketIcon, 
  UsersIcon, 
  TrophyIcon,
  ClockIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  BoltIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

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
  isCancelled: boolean;
  winners: string[];
  participantCount: number;
  minParticipants: number;
  maxParticipants: number;
  executorReward: string;
  tokenAddress?: string;
}

const DrawDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const drawId = Number(params.id);
  
  const { account, isConnected } = useEthers();
  const { getDrawDetails, buyTickets, cancelDraw } = useGridottoCoreV2();
  const { executeDraw, getDrawWinners, canExecuteDraw } = useGridottoExecutionV2();
  const { claimPrize, canClaimPrize, claimRefund, getRefundAmount } = useGridottoRefund();
  
  const [draw, setDraw] = useState<DrawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [canExecute, setCanExecute] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [refundAmount, setRefundAmount] = useState('0');

  useEffect(() => {
    loadDrawDetails();
  }, [drawId]);

  useEffect(() => {
    if (draw && account) {
      checkUserStatus();
    }
  }, [draw, account]);

  const loadDrawDetails = async () => {
    try {
      setLoading(true);
      
      const details = await getDrawDetails(drawId);
      
      if (details) {
        // Get winners if draw is completed
        let winners: string[] = [];
        if (details.isCompleted) {
          const winnersData = await getDrawWinners(drawId);
          if (winnersData) {
            winners = winnersData.winners;
          }
        }
        
        // Calculate executor reward (5% of platform fee)
        const platformFee = (details.prizePool * details.platformFeePercent) / BigInt(10000);
        const executorReward = (platformFee * BigInt(500)) / BigInt(10000); // 5% of platform fee
        
        const drawDetails: DrawDetails = {
          id: drawId,
          creator: details.creator,
          drawType: details.drawType,
          ticketPrice: details.ticketPrice.toString(),
          ticketsSold: details.ticketsSold.toString(),
          maxTickets: details.maxTickets.toString(),
          currentPrizePool: details.prizePool.toString(),
          endTime: Number(details.endTime),
          isActive: !details.isCompleted && !details.isCancelled && Number(details.endTime) > Date.now() / 1000,
          isCompleted: details.isCompleted,
          isCancelled: details.isCancelled,
          winners,
          participantCount: Number(details.participantCount),
          minParticipants: Number(details.minParticipants),
          maxParticipants: Number(details.maxTickets),
          executorReward: executorReward.toString(),
          tokenAddress: details.tokenAddress
        };
        
        setDraw(drawDetails);
        
        if (winners.includes(account?.toLowerCase() || '')) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 10000);
        }
      }
    } catch (err) {
      console.error('Error loading draw details:', err);
      toast.error('Failed to load draw details');
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    if (!draw || !account) return;

    try {
      // Check if can execute
      const executableStatus = await canExecuteDraw(drawId);
      setCanExecute(executableStatus.canExecute);

      // Check if can claim prize
      if (draw.isCompleted && !draw.isCancelled) {
        const claimStatus = await canClaimPrize(drawId, account);
        setCanClaim(claimStatus.canClaim);
      }

      // Check refund amount if cancelled
      if (draw.isCancelled) {
        const amount = await getRefundAmount(drawId, account);
        setRefundAmount(amount.toString());
      }
    } catch (err) {
      console.error('Error checking user status:', err);
    }
  };

  const handleBuyTickets = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setPurchasing(true);
    try {
      await buyTickets(drawId, ticketCount);
      toast.success(`Successfully purchased ${ticketCount} ticket(s)!`);
      await loadDrawDetails();
    } catch (err: any) {
      console.error('Error purchasing tickets:', err);
      toast.error(err.message || 'Failed to purchase tickets');
    } finally {
      setPurchasing(false);
    }
  };

  const handleExecuteDraw = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setExecuting(true);
    try {
      const result = await executeDraw(drawId);
      if (result) {
        toast.success('Draw executed successfully!');
        await loadDrawDetails();
      }
    } catch (err: any) {
      console.error('Error executing draw:', err);
      toast.error(err.message || 'Failed to execute draw');
    } finally {
      setExecuting(false);
    }
  };

  const handleClaimPrize = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setClaiming(true);
    try {
      await claimPrize(drawId);
      toast.success('Prize claimed successfully!');
      await checkUserStatus();
    } catch (err: any) {
      console.error('Error claiming prize:', err);
      toast.error(err.message || 'Failed to claim prize');
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setClaiming(true);
    try {
      await claimRefund(drawId);
      toast.success('Refund claimed successfully!');
      await checkUserStatus();
    } catch (err: any) {
      console.error('Error claiming refund:', err);
      toast.error(err.message || 'Failed to claim refund');
    } finally {
      setClaiming(false);
    }
  };

  const handleCancelDraw = async () => {
    if (!isConnected || !draw || account?.toLowerCase() !== draw.creator.toLowerCase()) {
      return;
    }

    if (!confirm('Are you sure you want to cancel this draw? This action cannot be undone.')) {
      return;
    }

    try {
      await cancelDraw(drawId);
      toast.success('Draw cancelled successfully');
      await loadDrawDetails();
    } catch (err: any) {
      console.error('Error cancelling draw:', err);
      toast.error(err.message || 'Failed to cancel draw');
    }
  };

  const getDrawTypeLabel = (type: number) => {
    switch (type) {
      case 0: return 'LYX Prize';
      case 1: return 'Token Prize';
      case 2: return 'NFT Prize';
      case 3: return 'Weekly Platform Draw';
      case 4: return 'Monthly Platform Draw';
      default: return 'Unknown';
    }
  };

  const getDrawTypeIcon = (type: number) => {
    switch (type) {
      case 0: return CurrencyDollarIcon;
      case 1: return CurrencyDollarIcon;
      case 2: return GiftIcon;
      case 3: return ClockIcon;
      case 4: return TrophyIcon;
      default: return SparklesIcon;
    }
  };

  const formatTimeLeft = (endTime: number) => {
    const now = Date.now() / 1000;
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Draw Not Found</h2>
          <p className="text-gray-400 mb-4">This draw doesn't exist or has been removed.</p>
          <Link href="/draws" className="btn-primary">
            Back to Draws
          </Link>
        </div>
      </div>
    );
  }

  const DrawTypeIcon = getDrawTypeIcon(draw.drawType);
  const ticketPrice = ethers.formatEther(draw.ticketPrice);
  const prizePool = ethers.formatEther(draw.currentPrizePool);
  const progress = (Number(draw.ticketsSold) / Number(draw.maxTickets)) * 100;

  return (
    <div className="min-h-screen py-20">
      {showConfetti && <Confetti />}
      
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link 
          href="/draws" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Draws
        </Link>

        {/* Draw Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <DrawTypeIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Draw #{draw.id}
                </h1>
                <p className="text-gray-400">{getDrawTypeLabel(draw.drawType)}</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-lg font-medium ${
              draw.isCancelled 
                ? 'bg-red-500/20 text-red-400'
                : draw.isCompleted 
                  ? 'bg-green-500/20 text-green-400' 
                  : draw.isActive 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-gray-500/20 text-gray-400'
            }`}>
              {draw.isCancelled ? 'Cancelled' : draw.isCompleted ? 'Completed' : draw.isActive ? 'Active' : 'Ended'}
            </div>
          </div>

          {/* Prize Pool */}
          <div className="text-center mb-6">
            <p className="text-gray-400 mb-2">Current Prize Pool</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              {prizePool} LYX
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{draw.ticketsSold} / {draw.maxTickets} tickets sold</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Draw Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Ticket Price</p>
              <p className="text-xl font-bold text-white">{ticketPrice} LYX</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Participants</p>
              <p className="text-xl font-bold text-white">{draw.participantCount}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Time Left</p>
              <p className="text-xl font-bold text-white">{formatTimeLeft(draw.endTime)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Min Participants</p>
              <p className="text-xl font-bold text-white">{draw.minParticipants}</p>
            </div>
          </div>
        </div>

        {/* Action Section */}
        {draw.isActive && !draw.isCompleted && !draw.isCancelled && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Buy Tickets</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-20 text-center bg-white/10 rounded-lg px-2 py-2 text-white"
                  min="1"
                  max="100"
                />
                <button
                  onClick={() => setTicketCount(Math.min(100, ticketCount + 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  +
                </button>
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-400">Total Cost</p>
                <p className="text-xl font-bold text-white">
                  {(Number(ticketPrice) * ticketCount).toFixed(4)} LYX
                </p>
              </div>
              
              <button
                onClick={handleBuyTickets}
                disabled={purchasing || !isConnected}
                className="btn-primary px-8"
              >
                {purchasing ? 'Purchasing...' : 'Buy Tickets'}
              </button>
            </div>
          </div>
        )}

        {/* Execute Draw Section */}
        {canExecute && !draw.isCompleted && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BoltIcon className="w-6 h-6 text-yellow-400" />
              Execute Draw
            </h2>
            <p className="text-gray-400 mb-4">
              This draw has ended and is ready to be executed. Execute it to select winners and earn a reward!
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Executor Reward</p>
                <p className="text-xl font-bold text-yellow-400">
                  {ethers.formatEther(draw.executorReward)} LYX
                </p>
              </div>
              <button
                onClick={handleExecuteDraw}
                disabled={executing}
                className="btn-primary px-8"
              >
                {executing ? 'Executing...' : 'Execute Draw'}
              </button>
            </div>
          </div>
        )}

        {/* Claim Prize Section */}
        {canClaim && draw.isCompleted && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              Congratulations! You Won!
            </h2>
            <p className="text-gray-400 mb-4">
              You have won this draw! Claim your prize now.
            </p>
            <button
              onClick={handleClaimPrize}
              disabled={claiming}
              className="btn-primary px-8"
            >
              {claiming ? 'Claiming...' : 'Claim Prize'}
            </button>
          </div>
        )}

        {/* Refund Section */}
        {draw.isCancelled && refundAmount !== '0' && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Claim Refund</h2>
            <p className="text-gray-400 mb-4">
              This draw was cancelled. You can claim a refund for your tickets.
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Refund Amount</p>
                <p className="text-xl font-bold text-green-400">
                  {ethers.formatEther(refundAmount)} LYX
                </p>
              </div>
              <button
                onClick={handleClaimRefund}
                disabled={claiming}
                className="btn-primary px-8"
              >
                {claiming ? 'Claiming...' : 'Claim Refund'}
              </button>
            </div>
          </div>
        )}

        {/* Winners Section */}
        {draw.isCompleted && draw.winners.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              Winners
            </h2>
            <div className="space-y-3">
              {draw.winners.map((winner, index) => (
                <div key={winner} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <ProfileDisplay address={winner} size="sm" showName={true} />
                  </div>
                  {winner.toLowerCase() === account?.toLowerCase() && (
                    <span className="text-sm text-green-400 font-medium">You!</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draw Details */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Draw Details</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Creator</span>
              <ProfileDisplay address={draw.creator} size="sm" showName={true} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Draw Type</span>
              <span className="text-white">{getDrawTypeLabel(draw.drawType)}</span>
            </div>
            {draw.tokenAddress && draw.tokenAddress !== ethers.ZeroAddress && (
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Token/NFT Address</span>
                <span className="text-white font-mono text-sm">
                  {draw.tokenAddress.slice(0, 6)}...{draw.tokenAddress.slice(-4)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">End Time</span>
              <span className="text-white">
                {new Date(draw.endTime * 1000).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cancel Draw Button (only for creator) */}
          {draw.isActive && !draw.isCompleted && !draw.isCancelled && 
           account?.toLowerCase() === draw.creator.toLowerCase() && (
            <button
              onClick={handleCancelDraw}
              className="mt-6 w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
            >
              Cancel Draw
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawDetailsPage;