import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import { ProfileItem } from '../ProfileItem';
import Image from 'next/image';
import Web3 from 'web3';

interface UserPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// User card with LSP3 profile display for Networks tab
interface ProfileCardProps {
  address: string;
  ticketCount: number;
  showName?: boolean;
}

const ProfileCard = ({ address, ticketCount, showName = true }: ProfileCardProps) => {
  const { profileData } = useLSP3Profile(address);
  
  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Display name is profile name or formatted address
  const displayName = profileData?.name || formatAddress(address);
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div className="w-8 h-8 mr-2">
          <ProfileItem 
            address={address}
            size="sm"
            showAddress={false}
          />
        </div>
        {showName && <span className="font-medium text-sm">{displayName}</span>}
      </div>
      <div className="flex items-center">
        <span className="text-[#FF2975] font-semibold mr-6">{ticketCount}</span>
        <a 
          href={`https://explorer.execution.mainnet.lukso.network/address/${address}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-[#FF2975]"
        >
          View on Explorer
        </a>
      </div>
    </div>
  );
};

export const UserPanelModal = ({ isOpen, onClose }: UserPanelModalProps) => {
  const [tab, setTab] = useState<'winnings' | 'profile' | 'networks'>('profile');
  const { account, contextAccount } = useUPProvider();
  const [pendingPrize, setPendingPrize] = useState('0');
  const [winnings, setWinnings] = useState<{draws: number[], amounts: string[]}>({draws: [], amounts: []});
  const [totalTickets, setTotalTickets] = useState<{bought: number, forSelf: number, forOthers: number}>({bought: 0, forSelf: 0, forOthers: 0});
  const [ticketBreakdown, setTicketBreakdown] = useState<{self: number, others: number}>({self: 0, others: 0});
  
  // Network tab state
  const [buyers, setBuyers] = useState<{address: string, tickets: number}[]>([]);
  const [profiles, setProfiles] = useState<{address: string, tickets: number}[]>([]);
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState('');
  
  const [claimLoading, setClaimLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { 
    getUserWinnings, 
    getUserPendingPrize, 
    claimPrize,
    getProfileBuyers,
    getTicketsBoughtForProfiles,
    getUserTicketsBreakdown,
    getUserTicketHistory,
    getUserTotalTickets,
    getCurrentDrawInfo,
    isLoading: isContractLoading
  } = useGridottoContract();
  
  const { profileData, loading: isProfileLoading } = useLSP3Profile(account || '');

  const [fadeIn, setFadeIn] = useState(false);

  // Network tab related states
  const [buyersForMe, setBuyersForMe] = useState<{ buyers: string[], ticketCounts: number[] }>({
    buyers: [],
    ticketCounts: []
  });
  const [profilesIBoughtFor, setProfilesIBoughtFor] = useState<{ profiles: string[], ticketCounts: number[] }>({
    profiles: [],
    ticketCounts: []
  });
  const [currentDraw, setCurrentDraw] = useState<number>(0);

  // Networks tab için profile cache tutacak yeni state ekleyeceğiz
  const [profilesCache, setProfilesCache] = useState<Record<string, { name: string | null }>>({});

  // Networks tab için alt sekme state'i ekleyeceğim
  const [networkSubTab, setNetworkSubTab] = useState<'buyers' | 'profiles'>('buyers');

  const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setFadeIn(true), 100);
    } else {
      setFadeIn(false);
    }
  }, [isOpen]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!isOpen || !account) return;
      
      setLoading(true);
      
      try {
        // Get user winnings
        const winningsData = await getUserWinnings(account);
        if (winningsData) {
          setWinnings(winningsData);
        }
        
        // Get pending prize
        const pendingPrizeData = await getUserPendingPrize(account);
        if (pendingPrizeData) {
          setPendingPrize(pendingPrizeData);
        }

        // Get current draw
        const drawInfo = await getCurrentDrawInfo();
        if (drawInfo) {
          setCurrentDraw(drawInfo.drawNumber);
        }
        
        // Network data - only load when network tab is active
        if (tab === 'networks') {
          await loadNetworkData();
        }
      } catch (err: any) {
        setError(err.message || 'Error loading user data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [isOpen, account, getUserWinnings, getUserPendingPrize, tab, getCurrentDrawInfo]);

  // Load network data
  const loadNetworkData = async () => {
    if (!account) return;
    
    try {
      // Get buyers who bought tickets for me
      const buyersData = await getProfileBuyers(account);
      setBuyersForMe(buyersData);
      
      // Get profiles I bought tickets for
      const profilesData = await getTicketsBoughtForProfiles(account);
      setProfilesIBoughtFor(profilesData);
      
      // Get ticket breakdown
      const breakdownData = await getUserTicketsBreakdown(account);
      setTicketBreakdown(breakdownData);
      
      // Get ticket history
      const historyData = await getUserTicketHistory(account);
      setTicketHistory(historyData);
      
      // Get total tickets
      const totalData = await getUserTotalTickets(account);
      // Handle type compatibility issues
      setTotalTickets({
        bought: totalData.bought || 0,
        forSelf: totalData.received || 0,
        forOthers: 0
      });
    } catch (err: any) {
      setError(err.message || 'Error loading network data');
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Calculate total winnings
  const calculateTotalWinnings = () => {
    return winnings.amounts.reduce((sum, amount) => {
      return sum + parseFloat(amount);
    }, 0).toFixed(3);
  };

  // Claim prize
  const handleClaimPrize = async () => {
    if (!account) return;
    
    setClaimLoading(true);
    
    try {
      const result = await claimPrize();
      
      if (result) {
        setSuccess('Prize claimed successfully!');
        setPendingPrize('0');
        
        // 3 saniye sonra başarı mesajını sil
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError('Failed to claim prize. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while claiming prize');
    } finally {
      setClaimLoading(false);
    }
  };

  // safeFromWei fonksiyonunu düzeltiyorum - değerin zaten Ether formatında olup olmadığını kontrol ediyorum
  const safeFromWei = (value: string | number) => {
    try {
      // Eğer value zaten string formatında bir sayı ise ve 
      // '.' içeriyorsa muhtemelen zaten ether formatındadır
      if (typeof value === 'string' && value.includes('.')) {
        return value;
      }
      
      // Diğer durumlarda normal dönüşümü yap
      return web3.utils.fromWei(value.toString(), 'ether');
    } catch (error) {
      // Hata durumunda güvenli bir değer döndür
      return '0';
    }
  };

  // useEffect içinde tüm profillerin verilerini ön yükleme yapacağız
  useEffect(() => {
    if (tab === 'networks' && (buyersForMe.buyers.length > 0 || profilesIBoughtFor.profiles.length > 0)) {
      // Tüm adresler için profil adlarını bir kerede yükleyelim
      const allAddresses = [...buyersForMe.buyers, ...profilesIBoughtFor.profiles];
      
      // Yeni adresleri bulalım (daha önce cache'lenmemiş olanlar)
      const newAddresses = allAddresses.filter(address => !profilesCache[address]);
      
      if (newAddresses.length === 0) return;
      
      // Her adres için profil verilerini ayrı ayrı yükleyeceğiz
      const newCache: Record<string, { name: string | null }> = {...profilesCache};
      
      // Her adres için LSP3Profile verisini yüklemek için promise'ler oluşturalım
      newAddresses.forEach(address => {
        // Şimdilik adres formatlamasını kullan, profile data sonra gelince güncellenecek
        newCache[address] = { name: formatAddress(address) };
        
        // LSP3Profile hook'u bir komponentin içinde çağrılmalı, bu yüzden 
        // biz burada formatlanmış adresi kullanıyoruz ve Profile bileşeni içindeki 
        // useLSP3Profile hook'unun profil verisini getirmesini bekliyoruz
      });
      
      // Cache'i güncelle
      setProfilesCache(newCache);
    }
  }, [tab, buyersForMe.buyers, profilesIBoughtFor.profiles]);

  // Adres için profil adını döndüren güvenli bir helper fonksiyon
  const getProfileName = (address: string): string => {
    // Cache'de varsa kullan
    if (profilesCache[address]?.name) {
      return profilesCache[address].name as string;
    }
    
    // Yoksa adresi formatla
    return formatAddress(address);
  };

  // NetworkSubTab değiştiğinde veri yüklenmesini sağlayacak fonksiyon ekleyelim
  useEffect(() => {
    if (tab === 'networks' && networkSubTab === 'profiles' && account) {
      loadNetworkData();
    }
  }, [tab, networkSubTab, account]);

  // Networks tab'ı güncelleyeceğim - sadece Buyers kısmı kalacak
  const renderNetworksTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-4 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <p className="text-xs text-gray-500 mt-1">Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Genel Bilgi - Mevcut çekiliş ve bilet toplam sayısı */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Current Draw: <span className="font-semibold text-gray-900">{currentDraw}</span></p>
            <p className="text-sm text-gray-600 mt-1">
              Total Tickets: <span className="font-semibold text-gray-900">
                {ticketBreakdown.self + ticketBreakdown.others}
              </span>
            </p>
          </div>
        </div>

        {/* Bilet Dağılımı Bölümü */}
        <div className="rounded-lg border bg-white divide-y">
          <div className="text-sm font-semibold p-3 bg-gray-50">Ticket Distribution</div>
          <div className="p-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-28 h-28 rounded-full flex items-center justify-center relative">
                {/* Dairesel pasta grafiği - Conic Gradient ile */}
                {(() => {
                  // Bilet sayılarını al
                  const selfTickets = ticketBreakdown.self || 0;
                  const othersTickets = ticketBreakdown.others || 0;
                  const totalTickets = selfTickets + othersTickets;
                  
                  // Yüzdeleri hesapla
                  const selfPercentage = totalTickets > 0 ? (selfTickets / totalTickets) * 100 : 50;
                  const othersPercentage = totalTickets > 0 ? (othersTickets / totalTickets) * 100 : 50;
                  
                  if (totalTickets === 0) {
                    // Bilet yoksa eşit bölünmüş gri daire göster
                    return (
                      <div className="w-full h-full rounded-full border-4 border-gray-200 bg-gray-100"></div>
                    );
                  }
                  
                  // Conic gradient için açıları hesapla
                  return (
                    <div 
                      className="w-full h-full rounded-full border-4 border-gray-200"
                      style={{
                        background: `conic-gradient(
                          #FF2975 0% ${selfPercentage}%, 
                          #5D5FEF ${selfPercentage}% 100%
                        )`
                      }}
                    >
                      {/* Merkez daire (opsiyonel - daha iyi görünüm için) */}
                      {totalTickets > 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-semibold">
                          {totalTickets}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded bg-gray-50">
                <p className="text-xs text-gray-500">Bought for myself</p>
                <p className="text-sm font-semibold text-[#FF2975]">{ticketBreakdown.self || 0} tickets</p>
              </div>
              <div className="p-2 rounded bg-gray-50">
                <p className="text-xs text-gray-500">Bought by others</p>
                <p className="text-sm font-semibold text-[#5D5FEF]">{ticketBreakdown.others || 0} tickets</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Total ticket count for the current draw:
              <span className="font-semibold"> {(ticketBreakdown.self || 0) + (ticketBreakdown.others || 0)} tickets</span>
            </p>
          </div>
        </div>

        {/* Buyers in my Profile bölümü */}
        <div className="rounded-lg border bg-white">
          <div className="text-sm font-semibold p-3 bg-gray-50">Buyers in my Profile</div>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-3 text-center">
              {buyersForMe.buyers.length} buyers, {buyersForMe.ticketCounts.reduce((sum, count) => sum + count, 0)} tickets
            </p>
            
            {buyersForMe.buyers.length === 0 ? (
              <p className="text-sm text-gray-500 py-2 text-center">No one has bought tickets for your profile yet.</p>
            ) : (
              <div className="border rounded-lg bg-white">
                <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 text-xs font-semibold">
                  <div className="col-span-1 text-center">BUYER</div>
                  <div className="col-span-1 text-center">TICKETS</div>
                  <div className="col-span-1 text-center">ACTION</div>
                </div>
                <div className="divide-y">
                  {buyersForMe.buyers.map((buyer, index) => (
                    <div key={buyer} className="grid grid-cols-3 gap-2 p-2">
                      <div className="col-span-1 flex items-center justify-center">
                        <ProfileItem 
                          address={buyer}
                          size="sm"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-[#5D5FEF] font-semibold">{buyersForMe.ticketCounts[index]}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <a 
                          href={`https://universaleverything.io/${buyer}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-[#FF2975]"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Winnings tab içeriğini güncelleyerek hata düzeltmesi ve hizalama yapıyorum
  const renderWinningsTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Pending Prize Card - Centered Design */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Pending Prize</h3>
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1 text-center">Available to claim:</p>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-[#FF2975] mr-2">
                  {Number(pendingPrize) > 0 
                    ? safeFromWei(pendingPrize).substring(0, 6)
                    : '0'}
                </span>
                <Image 
                  src="/assets/luksologo.png" 
                  alt="LUKSO" 
                  width={20} 
                  height={20}
                />
              </div>
            </div>
            
            {Number(pendingPrize) > 0 && (
              <button
                onClick={handleClaimPrize}
                disabled={claimLoading}
                className="px-4 py-2 bg-[#FF2975] text-white rounded-lg hover:bg-[#FF2975]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {claimLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : 'Claim Prize'}
              </button>
            )}
          </div>
          
          {success && (
            <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center">
              {success}
            </div>
          )}
        </div>
        
        {/* Winnings history */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-center">Winnings History</h3>
          
          {winnings.draws.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">You haven't won any prizes yet.</p>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-12 gap-2 bg-gray-100 p-3 text-xs font-semibold">
                <div className="col-span-4 text-center">DRAW #</div>
                <div className="col-span-8 text-center">AMOUNT</div>
              </div>
              
              <div className="divide-y">
                {winnings.draws.map((draw, index) => (
                  <div key={draw} className="grid grid-cols-12 gap-2 p-3 text-sm">
                    <div className="col-span-4 font-medium text-center">#{draw}</div>
                    <div className="col-span-8 text-[#FF2975] font-semibold flex items-center justify-center">
                      <span>{safeFromWei(winnings.amounts[index]).substring(0, 6)}</span>
                      <Image 
                        src="/assets/luksologo.png" 
                        alt="LUKSO" 
                        width={16} 
                        height={16}
                        className="ml-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Profile tab içeriğini hizalama için güncelleyelim
  const renderProfileTab = () => {
    if (loading || isProfileLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    // Create tweet text for sharing
    const tweetText = encodeURIComponent(
      `I'm participating in @braveuniverseup's Gridotto lottery on #LUKSO! 🎟️\n\nBuy me a ticket and increase both our chances to win $LYX rewards! 🎮\n\nMy profile: https://universaleverything.io/${account}\n\n#LUKSO $LYX #Web3 #Crypto`
    );

    return (
      <div className="space-y-6">
        {/* Profile Info - Center aligned */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Profile Information</h3>
          
          <div className="flex flex-col items-center justify-center">
            {/* Profile Image */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-4">
              <ProfileItem 
                address={account || ''} 
                size="lg"
                showAddress={false}
              />
            </div>
            
            {/* Profile Details */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Name:</p>
              <p className="text-md font-semibold mb-3">{profileData?.name || formatAddress(account || '')}</p>
              
              <div className="flex space-x-3 justify-center">
                <a 
                  href={`https://explorer.execution.mainnet.lukso.network/address/${account}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-[#FF2975] hover:underline"
                >
                  View on Explorer
                </a>
                <a 
                  href={`https://universaleverything.io/${account}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-[#FF2975] hover:underline"
                >
                  View Profile
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Share on X section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Share Your Profile</h3>
          
          <div className="text-center mb-4">
            <p className="text-sm text-gray-700 mb-4">
              Share your profile on X (Twitter) to encourage others to buy tickets for you! 
              More tickets means higher chances to win!
            </p>
            
            <a 
              href={`https://twitter.com/intent/tweet?text=${tweetText}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-black text-white py-3 px-6 rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8199 10.201L21.9999 0.800H20.0999L13.1699 8.787L7.63988 0.800H0.799805L9.16988 12.701L0.799805 22.400H2.69981L9.81981 14.111L15.5098 22.400H22.3498L13.8199 10.201ZM10.5499 12.889L9.69988 11.689L3.33988 2.689H6.61987L11.6699 9.967L12.5199 11.168L19.1699 20.511H15.8899L10.5499 12.889Z" />
              </svg>
              <span>Share on X</span>
            </a>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-center">Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-500 mb-1 text-center">Total Tickets Bought:</p>
              <p className="text-xl font-semibold text-[#FF2975] text-center">{totalTickets.bought || 0}</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-500 mb-1 text-center">Total Wins:</p>
              <p className="text-xl font-semibold text-[#FF2975] text-center">{winnings.draws.length}</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-500 mb-1 text-center">Tickets for Current Draw:</p>
              <p className="text-xl font-semibold text-[#FF2975] text-center">
                {ticketBreakdown.self + ticketBreakdown.others}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-500 mb-1 text-center">Total Pending Prize:</p>
              <div className="flex items-center justify-center">
                <span className="text-xl font-semibold text-[#FF2975] mr-2">
                  {Number(pendingPrize) > 0 
                    ? safeFromWei(pendingPrize).substring(0, 6)
                    : '0'}
                </span>
                <Image 
                  src="/assets/luksologo.png" 
                  alt="LUKSO" 
                  width={20} 
                  height={20}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Panel">
      <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-4 font-medium text-center ${
              tab === 'winnings'
                ? 'text-[#FF2975] border-b-2 border-[#FF2975]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setTab('winnings')}
          >
            Winnings
          </button>
          <button
            className={`py-3 px-4 font-medium text-center ${
              tab === 'profile'
                ? 'text-[#FF2975] border-b-2 border-[#FF2975]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setTab('profile')}
          >
            Profile
          </button>
          <button
            className={`py-3 px-4 font-medium text-center ${
              tab === 'networks'
                ? 'text-[#FF2975] border-b-2 border-[#FF2975]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setTab('networks');
              // Load network data when switching to this tab
              if (account) {
                loadNetworkData();
              }
            }}
          >
            Networks
          </button>
        </div>

        {/* Content based on tab */}
        <div className="px-4">
          {tab === 'winnings' && (
            <div>
              {renderWinningsTab()}
            </div>
          )}
          
          {tab === 'profile' && (
            <div>
              {renderProfileTab()}
            </div>
          )}
          
          {tab === 'networks' && renderNetworksTab()}
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
      `}</style>
    </Modal>
  );
}; 