import { useState, useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import { useGridottoContract } from '@/hooks/useGridottoContract';
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
}

const UserCard = ({ address, isHighlighted = false, isYou = false }: UserCardProps) => {
  const { profileData } = useLSP3Profile(address);
  
  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Display name is profile name or formatted address
  const displayName = profileData?.name || formatAddress(address);
  
  return (
    <div className="flex items-center">
      <div className="w-6 h-6 flex-shrink-0 mr-2">
        {/* Only show the image, not the text */}
        <div className="w-full h-full rounded-full overflow-hidden">
          <ProfileItem 
            address={address}
            size="sm" 
            showAddress={false}
            isHighlighted={isHighlighted}
          />
        </div>
      </div>
      <div className="truncate">
        <span className="font-medium text-sm">{displayName}</span>
        {isYou && <span className="ml-1 text-gray-500 text-xs">(You)</span>}
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

  const { getWeeklyDetailedTopBuyers, getMonthlyDetailedTopBuyers } = useGridottoContract();
  const { account } = useUPProvider();

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setFadeIn(true), 100);
    } else {
      setFadeIn(false);
    }
  }, [isOpen]);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let data;
        
        if (period === 'weekly') {
          data = await getWeeklyDetailedTopBuyers(50); // Max 50 users
        } else {
          data = await getMonthlyDetailedTopBuyers(50); // Max 50 users
        }
        
        if (data) {
          setLeaderData(data);
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
  }, [isOpen, getWeeklyDetailedTopBuyers, getMonthlyDetailedTopBuyers, period]);

  // Check if address is user's address
  const isMyAddress = (address: string): boolean => {
    return !!(account && address.toLowerCase() === account.toLowerCase());
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
                {leaderData.users.map((user, index) => (
                  <div 
                    id={`leader-row-${index}`}
                    key={`list-${user}`}
                    className={`p-2 sm:p-3 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } ${
                      isMyAddress(user) ? 'bg-[#FF2975]/5' : ''
                    } transition-all hover:bg-gray-100 border-b border-gray-200`}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      scrollMarginTop: '100px' 
                    }}
                  >
                    <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center text-sm">
                      <div className="col-span-1 flex justify-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 font-semibold text-xs">
                          {index + 1}
                        </div>
                      </div>
                      <div className="col-span-5 sm:col-span-4 truncate">
                        <a 
                          href={`https://universaleverything.io/${user}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-[#FF2975]"
                        >
                          <UserCard 
                            address={user} 
                            isHighlighted={isMyAddress(user) && autoScrollToMe}
                            isYou={isMyAddress(user)}
                          />
                        </a>
                      </div>
                      <div className="col-span-2 text-center font-semibold text-xs sm:text-sm">
                        {leaderData.totalTickets[index]}
                      </div>
                      <div className="col-span-2 text-center text-xs sm:text-sm">
                        {leaderData.selfBought[index]}
                      </div>
                      <div className="col-span-2 text-center text-xs sm:text-sm">
                        {leaderData.othersBought[index]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm">
          <p>
            Showing top 50 users for current {period} draw
          </p>
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