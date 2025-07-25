'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import Web3 from 'web3';
import { 
  ClockIcon, 
  TicketIcon, 
  UsersIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  SparklesIcon,
  CalendarIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import Link from 'next/link';

const drawTypeConfig: Record<number, { icon: any; label: string; color: string }> = {
  0: { // LYX
    icon: CurrencyDollarIcon,
    label: 'LYX Prize',
    color: 'from-blue-500 to-cyan-500'
  },
  1: { // LSP7 Token
    icon: SparklesIcon,
    label: 'Token Prize',
    color: 'from-purple-500 to-pink-500'
  },
  2: { // LSP8 NFT
    icon: PhotoIcon,
    label: 'NFT Prize',
    color: 'from-pink-500 to-rose-500'
  },
  3: { // WEEKLY
    icon: CalendarIcon,
    label: 'Weekly Draw',
    color: 'from-green-500 to-emerald-500'
  },
  4: { // MONTHLY
    icon: ChartBarIcon,
    label: 'Monthly Draw',
    color: 'from-orange-500 to-red-500'
  }
};

export default function DrawDetailPage() {
  const params = useParams();
  const drawId = params.id as string;
  const { account, isConnected } = useUPProvider();
  const { getDrawDetails, buyTickets, getDrawParticipants } = useGridottoContract();
  
  const [draw, setDraw] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [buying, setBuying] = useState(false);
  
  const { profileData: creatorProfile } = useLSP3Profile(draw?.creator || '');

  useEffect(() => {
    console.log('[DrawDetailPage] Component mounted with drawId:', drawId);
    if (drawId) {
      loadDrawData();
    }
  }, [drawId]);

  const loadDrawData = async () => {
    try {
      setLoading(true);
      const drawIdNum = parseInt(drawId);
      console.log('[DrawDetailPage] Loading data for draw:', drawIdNum);
      console.log('[DrawDetailPage] Contract hook status:', {
        hasGetDrawDetails: !!getDrawDetails,
        hasGetDrawParticipants: !!getDrawParticipants,
        hasBuyTickets: !!buyTickets
      });
      
      if (isNaN(drawIdNum) || drawIdNum <= 0) {
        console.error('[DrawDetailPage] Invalid draw ID:', drawId);
        setDraw(null);
        return;
      }
      
      const details = await getDrawDetails(drawIdNum);
      console.log('[DrawDetailPage] Draw details received:', details);
      
      if (details) {
        setDraw(details);
        
        // Load participants
        const participantsList = await getDrawParticipants(drawIdNum);
        console.log('[DrawDetailPage] Participants loaded:', participantsList?.length || 0);
        setParticipants(participantsList || []);
      } else {
        console.log('[DrawDetailPage] No draw details found');
        setDraw(null);
      }
    } catch (error) {
      console.error('[DrawDetailPage] Error loading draw:', error);
      setDraw(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!draw) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(draw.endTime);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [draw]);

  const handleBuyTickets = async () => {
    if (!isConnected || !draw) return;

    try {
      setBuying(true);
      await buyTickets(parseInt(drawId), ticketCount);
      // Reload data after purchase
      await loadDrawData();
      setTicketCount(1);
    } catch (error) {
      console.error('Error buying tickets:', error);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Draw not found</h1>
            <Link href="/draws" className="text-primary hover:underline">
              Back to draws
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const config = drawTypeConfig[draw.drawType] || drawTypeConfig[0];
  const prizeAmount = draw.prizePool || '0';
  const prizeInLYX = Web3.utils.fromWei(prizeAmount.toString(), 'ether');
  const ticketPriceInLYX = Web3.utils.fromWei(draw.ticketPrice.toString(), 'ether');
  const totalCost = (parseFloat(ticketPriceInLYX) * ticketCount).toFixed(4);
  const progress = draw.maxTickets > 0 ? (Number(draw.ticketsSold) / Number(draw.maxTickets)) * 100 : 0;
  const isActive = !draw.isCompleted && !draw.isCancelled && timeLeft !== 'Ended';

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/draws" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Back to draws
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                <config.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Draw #{drawId}</h1>
                <p className="text-gray-400">{config.label}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isActive ? (
                <>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-medium">Active</span>
                </>
              ) : draw.isCompleted ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Completed</span>
                </>
              ) : draw.isCancelled ? (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Cancelled</span>
                </>
              ) : (
                <>
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 font-medium">Ended</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prize & Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6">Prize Pool</h2>
              
              <div className="text-center mb-8">
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
                  {prizeInLYX} LYX
                </p>
                <p className="text-gray-400">Current Prize Pool</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <TicketIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{Number(draw.ticketsSold)}</p>
                  <p className="text-xs text-gray-400">Tickets Sold</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <UsersIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{Number(draw.participantCount)}</p>
                  <p className="text-xs text-gray-400">Participants</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{ticketPriceInLYX}</p>
                  <p className="text-xs text-gray-400">Per Ticket (LYX)</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <ClockIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{timeLeft}</p>
                  <p className="text-xs text-gray-400">Time Left</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Number(draw.ticketsSold)} / {Number(draw.maxTickets)} tickets</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6">Recent Participants</h2>
              
              {participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.slice(0, 10).map((participant, index) => (
                    <ParticipantRow key={index} participant={participant} />
                  ))}
                  {participants.length > 10 && (
                    <p className="text-center text-gray-400 text-sm pt-2">
                      And {participants.length - 10} more participants...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No participants yet. Be the first!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Created by</h3>
              <div className="flex items-center gap-3">
                <ProfileDisplay address={draw.creator} size="md" />
                <div>
                  <p className="font-medium text-white">
                    {creatorProfile?.name || `${draw.creator.slice(0, 6)}...${draw.creator.slice(-4)}`}
                  </p>
                  <p className="text-xs text-gray-400">Draw Creator</p>
                </div>
              </div>
            </div>

            {/* Buy Tickets */}
            {isActive && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Buy Tickets</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Number of tickets</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={ticketCount}
                        onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-center"
                        min="1"
                      />
                      <button
                        onClick={() => setTicketCount(ticketCount + 1)}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Ticket price</span>
                      <span className="text-white">{ticketPriceInLYX} LYX</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Quantity</span>
                      <span className="text-white">×{ticketCount}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total</span>
                        <span className="text-lg font-bold text-white">{totalCost} LYX</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBuyTickets}
                    disabled={!isConnected || buying}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-600/80 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {buying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-5 h-5" />
                        Buy Tickets
                      </>
                    )}
                  </button>

                  {!isConnected && (
                    <p className="text-xs text-center text-gray-400">
                      Connect your wallet to buy tickets
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Draw Info */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Draw Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Participants</span>
                  <span className="text-white">{Number(draw.minParticipants)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-white">{Number(draw.platformFeePercent)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Time</span>
                  <span className="text-white">
                    {new Date(Number(draw.startTime) * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Time</span>
                  <span className="text-white">
                    {new Date(Number(draw.endTime) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Participant Row Component
function ParticipantRow({ participant }: { participant: any }) {
  const { profileData } = useLSP3Profile(participant.address);
  
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <ProfileDisplay address={participant.address} size="sm" />
        <div>
          <p className="text-sm font-medium text-white">
            {profileData?.name || `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`}
          </p>
          <p className="text-xs text-gray-400">{participant.ticketCount} tickets</p>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        {new Date(participant.timestamp * 1000).toLocaleTimeString()}
      </p>
    </div>
  );
}