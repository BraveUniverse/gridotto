import { useState, useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useVIPPassContract, VIPPassTier } from '@/hooks/useVIPPassContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import { ProfileItem } from '@/components/ProfileItem';
import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import Image from 'next/image';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Period type
type PeriodType = 'weekly' | 'monthly';

// Detailed leaderboard data type
interface DetailedLeaderboardData {
  users: string[]; 
  totalTickets: number[]; 
  selfBought: number[]; 
  othersBought: number[];
}

// User card component with LSP3 profile display
interface UserCardProps {
  address: string;
  isHighlighted?: boolean;
  isYou?: boolean;
  vipTier?: VIPPassTier;
}

const UserCard = ({ address, isHighlighted = false, isYou = false, vipTier = VIPPassTier.NO_TIER }: UserCardProps) => {
  const { profileData } = useLSP3Profile(address);
  
  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Display name is profile name or formatted address
  const displayName = profileData?.name || formatAddress(address);
  
  // VIP badge color
  const getVipColor = () => {
    switch (vipTier) {
      case VIPPassTier.SILVER: return 'bg-gray-300';
      case VIPPassTier.GOLD: return 'bg-yellow-400';
      case VIPPassTier.DIAMOND: return 'bg-blue-300';
      case VIPPassTier.UNIVERSE: return 'bg-purple-500';
      default: return '';
    }
  };
  
  // VIP tier name
  const getVipTierName = () => {
    switch (vipTier) {
      case VIPPassTier.SILVER: return 'Silver';
      case VIPPassTier.GOLD: return 'Gold';
      case VIPPassTier.DIAMOND: return 'Diamond';
      case VIPPassTier.UNIVERSE: return 'Universe';
      default: return '';
    }
  };
  
  return (
    <div className="flex items-center">
      <div className="w-6 h-6 flex-shrink-0 mr-2 relative">
        {/* Profil bileşenine VIP durumunu ilet */}
        <div className="w-full h-full rounded-full overflow-hidden">
          <ProfileItem 
            address={address}
            size="sm" 
            showAddress={false}
            isHighlighted={isHighlighted}
            vipTier={vipTier}
          />
        </div>
      </div>
      <div className="truncate flex items-center">
        <span className="font-medium text-sm">{displayName}</span>
        {isYou && <span className="ml-1 text-gray-500 text-xs">(You)</span>}
        {vipTier !== VIPPassTier.NO_TIER && (
          <span className={`ml-1.5 px-1.5 py-0.5 text-xs text-white rounded font-semibold ${getVipColor()}`}>
            {getVipTierName()}
          </span>
        )}
      </div>
    </div>
  );
};

export const LeaderboardModal = ({ isOpen, onClose }: LeaderboardModalProps) => {
  // Main tab: Weekly vs Monthly
  const [period, setPeriod] = useState<PeriodType>('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderData, setLeaderData] = useState<DetailedLeaderboardData>({
    users: [],
    totalTickets: [],
    selfBought: [],
    othersBought: []
  });
  const [fadeIn, setFadeIn] = useState(false);
  const [autoScrollToMe, setAutoScrollToMe] = useState(false);
  const [userVipTiers, setUserVipTiers] = useState<Record<string, VIPPassTier>>({});
  const [loadingVipStatus, setLoadingVipStatus] = useState(false);

  const { getCurrentWeeklyParticipants, getCurrentMonthlyParticipants } = useGridottoContract();
  const { getHighestTierOwned } = useVIPPassContract();
  const { account } = useUPProvider();

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setFadeIn(true), 100);
    } else {
      setFadeIn(false);
    }
  }, [isOpen]);

  // Process and sort leaderboard data
  const processAndSortLeaderboardData = (
    participants: string[], 
    totalTickets: number[], 
    selfBought: number[], 
    othersBought: number[],
    maxCount: number = 50
  ): DetailedLeaderboardData => {
    // Create array of user data objects for sorting
    const userData = participants.map((address, index) => ({
      address,
      totalTicket: totalTickets[index],
      selfBought: selfBought[index],
      othersBought: othersBought[index]
    }));

    // Sort by total tickets (high to low)
    userData.sort((a, b) => b.totalTicket - a.totalTicket);

    // Limit to maxCount
    const limitedData = userData.slice(0, maxCount);

    // Transform back to separate arrays format
    return {
      users: limitedData.map(item => item.address),
      totalTickets: limitedData.map(item => item.totalTicket),
      selfBought: limitedData.map(item => item.selfBought),
      othersBought: limitedData.map(item => item.othersBought)
    };
  };

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let rawData;
        
        if (period === 'weekly') {
          rawData = await getCurrentWeeklyParticipants();
        } else {
          rawData = await getCurrentMonthlyParticipants();
        }
        
        if (rawData && Array.isArray(rawData.participants)) {
          // Process and sort the data client-side
          const sortedData = processAndSortLeaderboardData(
            rawData.participants,
            rawData.totalTickets.map(Number),
            rawData.selfBought.map(Number),
            rawData.othersBought.map(Number),
            rawData.participants.length
          );
          
          setLeaderData(sortedData);
          // Reset VIP tiers when new data is loaded
          setUserVipTiers({});
          
          // Load VIP status for the top users (limit to first 10 to avoid too many requests)
          await loadVipStatus(sortedData.users.slice(0, 10));
        } else {
          setError('Failed to load leaderboard data');
        }
      } catch (err: any) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboardData();
  }, [isOpen, getCurrentWeeklyParticipants, getCurrentMonthlyParticipants, period]);

  // Load VIP status for users
  const loadVipStatus = async (addresses: string[]) => {
    setLoadingVipStatus(true);
    
    try {
      const tierPromises = addresses.map(async (address) => {
        try {
          const tier = await getHighestTierOwned(address);
          return { address, tier };
        } catch (error) {
          return { address, tier: VIPPassTier.NO_TIER };
        }
      });
      
      const results = await Promise.all(tierPromises);
      
      // Create a record of address to tier
      const tiers: Record<string, VIPPassTier> = {};
      results.forEach(({ address, tier }) => {
        tiers[address.toLowerCase()] = tier;
      });
      
      setUserVipTiers(tiers);
    } catch (error) {
      // Error handling - silently fail
    } finally {
      setLoadingVipStatus(false);
    }
  };

  // Check if address is user's address
  const isMyAddress = (address: string): boolean => {
    return !!(account && address.toLowerCase() === account.toLowerCase());
  };

  // Get VIP tier for an address
  const getVipTierForAddress = (address: string): VIPPassTier => {
    const tier = userVipTiers[address.toLowerCase()] || VIPPassTier.NO_TIER;
    return tier;
  };

  // Find user's position in leaderboard
  const findMyPosition = () => {
    if (!account) return -1;
    return leaderData.users.findIndex(
      addr => addr.toLowerCase() === account.toLowerCase()
    );
  };

  // Scroll to user's position
  const scrollToMyPosition = () => {
    setAutoScrollToMe(true);
    const myPosition = findMyPosition();
    if (myPosition !== -1) {
      const element = document.getElementById(`leader-row-${myPosition}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight animation
        element.classList.add('bg-[#FF2975]/20');
        setTimeout(() => {
          element.classList.remove('bg-[#FF2975]/20');
        }, 2000);
      }
    }
    
    // Reset auto-scroll after a delay
    setTimeout(() => setAutoScrollToMe(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leaderboard">
      <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {/* Tabs - Restored Weekly/Monthly tabs */}
        <div className="mb-4 sm:mb-6">
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div className={`h-full bg-[#FF2975] ${period === 'weekly' ? 'w-1/2' : 'w-full'}`}></div>
          </div>
          
          {/* Tab buttons */}
          <div className="flex">
            <button
              className={`flex-1 py-2 text-sm font-medium text-center rounded-l-lg border ${
                period === 'weekly' 
                  ? 'bg-[#FF2975] text-white border-[#FF2975]' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setPeriod('weekly')}
            >
              WEEKLY
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium text-center rounded-r-lg border ${
                period === 'monthly' 
                  ? 'bg-[#FF2975] text-white border-[#FF2975]' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setPeriod('monthly')}
            >
              MONTHLY
            </button>
          </div>
        </div>

        {/* Statistics */}
        {!loading && !error && leaderData.users.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 w-full md:w-[48%] text-center">
              <div className="font-semibold text-[#FF2975] text-lg sm:text-xl">
                {leaderData.totalTickets.reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm">Total Tickets</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 w-full md:w-[48%] text-center">
              <div className="font-semibold text-[#FF2975] text-lg sm:text-xl">{leaderData.users.length}</div>
              <div className="text-gray-500 text-xs sm:text-sm">Participants</div>
            </div>
          </div>
        )}

        {/* Find me button */}
        {account && leaderData.users.length > 0 && findMyPosition() !== -1 && (
          <button
            onClick={scrollToMyPosition}
            className="mb-3 sm:mb-4 py-2 sm:py-3 px-4 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm sm:text-base">Find Me</span>
          </button>
        )}

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#FF2975]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg text-sm">
              <p>{error}</p>
            </div>
          ) : leaderData.users.length === 0 ? (
            <div className="py-6 sm:py-8 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">No data available yet</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {/* Table Header */}
              <div className="bg-gray-50 p-2 sm:p-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-1 sm:gap-2 font-semibold text-gray-600 text-xs">
                  <div className="col-span-1 text-center">RANK</div>
                  <div className="col-span-5 sm:col-span-4">USER</div>
                  <div className="col-span-2 text-center">TOTAL</div>
                  <div className="col-span-2 text-center">SELF</div>
                  <div className="col-span-2 text-center">RECEIVED</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="max-h-[350px] sm:max-h-[400px] overflow-y-auto">
                {leaderData.users.map((address, index) => {
                  const isMe = isMyAddress(address);
                  const vipTier = getVipTierForAddress(address);
                  
                  return (
                    <div 
                      key={`leader-${index}`} 
                      id={`leader-row-${index}`}
                      className={`p-2 sm:p-3 border-b border-gray-200 ${isMe ? 'bg-[#FF2975]/10' : 'hover:bg-gray-50'} transition-colors text-sm`}
                    >
                      <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center text-xs sm:text-sm">
                        <div className="col-span-1 text-center font-bold text-gray-500">{index + 1}</div>
                        <div className="col-span-5 sm:col-span-4 truncate">
                          <UserCard 
                            address={address} 
                            isHighlighted={autoScrollToMe && isMe}
                            isYou={isMe}
                            vipTier={vipTier}
                          />
                        </div>
                        <div className="col-span-2 text-center font-bold">{leaderData.totalTickets[index]}</div>
                        <div className="col-span-2 text-center text-gray-600">{leaderData.selfBought[index]}</div>
                        <div className="col-span-2 text-center text-gray-600">{leaderData.othersBought[index]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* VIP Pass information */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-700 font-medium">VIP Pass Tiers:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 bg-gray-300 text-white text-xs rounded">Silver VIP</span>
              <span className="inline-flex items-center px-2 py-1 bg-yellow-400 text-white text-xs rounded">Gold VIP</span>
              <span className="inline-flex items-center px-2 py-1 bg-blue-300 text-white text-xs rounded">Diamond VIP</span>
              <span className="inline-flex items-center px-2 py-1 bg-purple-500 text-white text-xs rounded">Universe VIP</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">VIP Pass holders receive bonus tickets in each draw.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @media (max-width: 640px) {
          .grid-cols-12 {
            grid-template-columns: repeat(12, minmax(0, 1fr));
          }
        }
      `}</style>
    </Modal>
  );
}; 