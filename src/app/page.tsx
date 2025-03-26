'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { CountdownTimer } from '@/components/CountdownTimer';
import { BuyTicketModal } from '@/components/modals/BuyTicketModal';
import { LeaderboardModal } from '@/components/modals/LeaderboardModal';
import { UserPanelModal } from '@/components/modals/UserPanelModal';
import { PastDrawsModal } from '@/components/modals/PastDrawsModal';
import { AdminPanelModal } from '@/components/modals/AdminPanelModal';
import { InfoModal } from '@/components/modals/InfoModal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Header } from '@/components/Header';
import Image from 'next/image';

// Check if running on client-side
const isClient = typeof window !== 'undefined';

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { isConnected, account, contextAccount, providerError, refreshConnection } = useUPProvider();
  const { 
    getCurrentDrawInfo, 
    getMonthlyDrawInfo,
    getContractInfo,
    isLoading: contractLoading,
    error: contractError,
    getOwner
  } = useGridottoContract();
  
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyPool, setWeeklyPool] = useState(0);
  const [monthlyPool, setMonthlyPool] = useState(0);
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState(0);
  const [monthlyTimeLeft, setMonthlyTimeLeft] = useState(0);
  const [weeklyDrawNumber, setWeeklyDrawNumber] = useState(0);
  const [monthlyDrawNumber, setMonthlyDrawNumber] = useState(0);
  const [weeklyTicketCount, setWeeklyTicketCount] = useState(0);
  const [monthlyTicketCount, setMonthlyTicketCount] = useState(0);
  const [ticketPrice, setTicketPrice] = useState<string>('0.1');
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  // Admin wallet check
  const [isAdmin, setIsAdmin] = useState(false);

  // Sadece admin paneli için state tutuyoruz
  const [adminPanelForced, setAdminPanelForced] = useState(false);
  
  // Her modal için ayrı state kullanacağız - tek bir activeModal yerine
  const [isBuyTicketOpen, setIsBuyTicketOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isPastDrawsOpen, setIsPastDrawsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // iframe kontrolü
  useEffect(() => {
    if (isClient) {
      // Bu sayfanın iframe içinde olup olmadığını kontrol et
      const checkIfInIframe = () => {
        try {
          return window.self !== window.top;
        } catch (e) {
          return true; // Aynı kaynaktan olmayan bir iframe içindeyiz
        }
      };
      
      setIsIframe(checkIfInIframe());
    }
  }, []);
  
  // iframe içindeyken özel bağlantı kontrolü
  useEffect(() => {
    if (isClient && isIframe) {
   
      // iframe mesaj dinleyicisi ekle
      const handleMessage = (event: MessageEvent) => {
       
        
        // Parent'tan context hesapları alabiliriz
        if (event.data && event.data.type === 'up_contextAccounts' && event.data.accounts) {
        
          if (event.data.accounts.length > 0) {
            // Bu kısmı implement et, context hesaplarını güncelleyin
            refreshConnection();
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Temizlik
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isIframe, refreshConnection]);

  // Admin wallet check
  useEffect(() => {
    if (!isClient) return;
    
    const checkIfAdmin = async () => {
      if (account) {
        try {
          const ownerAddress = await getOwner();
          if (ownerAddress) {
            setIsAdmin(account.toLowerCase() === ownerAddress.toLowerCase());
          }
        } catch (error) {
          // Hata sessizce ele alınıyor
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkIfAdmin();
  }, [account, getOwner]);

  // Tüm modalları kapat
  const closeAllModals = () => {
   
    setIsBuyTicketOpen(false);
    setIsLeaderboardOpen(false);
    setIsUserPanelOpen(false);
    setIsPastDrawsOpen(false);
    setIsInfoOpen(false);
    setIsAdminOpen(false);
  };

  // Modal açma fonksiyonları
  const openBuyTicket = () => {
  
    closeAllModals();
    setIsBuyTicketOpen(true);
  };
  
  const openLeaderboard = () => {
 
    closeAllModals();
    setIsLeaderboardOpen(true);
  };
  
  const openUserPanel = () => {
  
    closeAllModals();
    setIsUserPanelOpen(true);
  };
  
  const openPastDraws = () => {
   
    closeAllModals();
    setIsPastDrawsOpen(true);
  };
  
  const openInfo = () => {
  
    closeAllModals();
    setIsInfoOpen(true);
  };
  
  const openAdmin = () => {
    
    closeAllModals();
    setIsAdminOpen(true);
    // Admin panelini zorla açık tutmayı kaldırıyoruz
    setAdminPanelForced(false);
  };
  
  // Modal kapama fonksiyonları
  const closeBuyTicket = () => {
    
    setIsBuyTicketOpen(false);
  };
  
  const closeLeaderboard = () => {
   
    setIsLeaderboardOpen(false);
  };
  
  const closeUserPanel = () => {
   
    setIsUserPanelOpen(false);
  };
  
  const closePastDraws = () => {
   
    setIsPastDrawsOpen(false);
  };
  
  const closeInfo = () => {
  ;
    setIsInfoOpen(false);
  };
  
  const closeAdmin = () => {
  
    // Zorunlu açık kalma kontrolünü kaldırıyoruz
    setIsAdminOpen(false);
  };
  
  // Admin panelini açmak için özel fonksiyon
  const handleOpenAdminPanel = () => {
    
    
    // Önce tüm modalları kapat
    closeAllModals();
    
    // Sonra admin paneli aç (gecikmeli)
    setTimeout(() => {
      setIsAdminOpen(true);
    }, 500);
  };
  
  // Loading screen tamamlandığında
  const handleLoadingFinish = () => {
    setIsLoading(false);
  };

  // Connection error handling
  const handleConnectionRetry = async () => {
    if (!isClient) return;
    
    setLoadError('Reconnecting...');
    setConnectionRetries(prev => prev + 1);
    
    try {
      const result = await refreshConnection();
      
      if (result) {
        setLoadError(null);
        // Load contract data immediately after reconnecting
        loadContractData();
      } else {
        setLoadError('Connection failed. Please make sure you are logged in through the parent page.');
      }
    } catch (err: any) {
      setLoadError(`Connection error: ${err.message}`);
    }
  };

  // Provider error handling
  useEffect(() => {
    if (!isClient) return;
    
    if (providerError) {
      setLoadError(`Connection issue: ${providerError}`);
    }
  }, [providerError]);

  // Load contract data
  const loadContractData = async () => {
    if (!isClient) return;
    
    if (!isConnected || !account) {
      return;
    }
    
    setLoadingData(true);
    setLoadError(null);
    
    try {
      // Contract general info
      const contractInfo = await getContractInfo();
      if (contractInfo) {
        setTicketPrice(contractInfo.ticketPrice);
      }
      
      // Get weekly draw info
      const weeklyInfo = await getCurrentDrawInfo();
      if (weeklyInfo) {
        setWeeklyPool(Number(weeklyInfo.prizePool));
        setWeeklyTimeLeft(Number(weeklyInfo.remainingTime));
        setWeeklyDrawNumber(Number(weeklyInfo.drawNumber));
        setWeeklyTicketCount(Number(weeklyInfo.ticketCount));
      }

      // Get monthly draw info
      const monthlyInfo = await getMonthlyDrawInfo();
      if (monthlyInfo) {
        setMonthlyPool(Number(monthlyInfo.prizePool));
        setMonthlyTimeLeft(Number(monthlyInfo.remainingTime));
        setMonthlyDrawNumber(Number(monthlyInfo.drawNumber));
        setMonthlyTicketCount(Number(monthlyInfo.ticketCount));
      }

      // Set last update time
      setLastUpdated(new Date());
    } catch (error: any) {
      if (error.message && error.message.includes('503')) {
        setLoadError('Network connection issue (503). LUKSO RPC service unreachable. Please try again later.');
      } else {
        setLoadError(error.message || 'Error loading data');
      }
    } finally {
      setLoadingData(false);
    }
  };

  // Connection status update
  useEffect(() => {
    if (!isClient) return;
    
    // LUKSO dokümantasyonuna uygun olarak bağlantı durumunu analiz et
    const updateConnectedStatus = () => {
      // Hem hesap hem de context hesabı varsa bağlantı tam demektir
      const fullyConnected = isConnected && !!account && !!contextAccount;
      
      if (fullyConnected && isLoading) {
        // Eğer tam bağlıysa ve veriler hala yükleniyor ise, verileri çek
        loadContractData();
      }
    };
    
    updateConnectedStatus();
  }, [isConnected, account, contextAccount, isLoading]);

  // Load data when connection status changes
  useEffect(() => {
    if (!isClient) return;
    
    if (isConnected && account) {
      loadContractData();
    }
  }, [isConnected, account]);

  // Periodic data refresh
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      if (isConnected && account) {
        loadContractData();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, account]);

  // Update remaining time locally
  useEffect(() => {
    if (!isClient) return;
    if (weeklyTimeLeft <= 0 && monthlyTimeLeft <= 0) return; 
    
    const timer = setInterval(() => {
      setWeeklyTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      setMonthlyTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [weeklyTimeLeft, monthlyTimeLeft]);

  return (
    <div className="flex flex-col min-h-screen">
      {isLoading ? (
        <LoadingScreen onFinish={handleLoadingFinish} />
      ) : (
        <>
          <div className="flex-1 flex flex-col">
            <main className="w-full bg-white">
              <div className="container mx-auto p-responsive-lg">
                <div className="flex flex-col items-center justify-center space-y-responsive-xl">
                  <h1 className="text-responsive-4xl font-bold mt-responsive-md">
                    <span className="text-[#FF2975]">Grid</span>
                    <span className="text-[#1D1D1F]">otto</span>
                  </h1>
                  
                  <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 items-center justify-items-center px-2">
                    <div className="w-full max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                      <CountdownTimer 
                        title="Weekly Draw" 
                        timeLeft={weeklyTimeLeft}
                        poolAmount={weeklyPool}
                      />
                      <div className="text-center mt-1 text-[9px] sm:text-xs text-gray-500">
                        Draw #{weeklyDrawNumber} • {weeklyTicketCount} tickets
                      </div>
                    </div>

                    <div className="text-center p-2 sm:p-4 bg-[#EDEDED] rounded-[var(--border-radius-lg)] w-full max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                      <div className="flex flex-col gap-1 sm:gap-3 items-center">
                        <h2 className="text-xs sm:text-responsive-sm font-medium text-gray-700">Ticket Price</h2>
                        <div className="flex items-center gap-1">
                          <p className="text-sm sm:text-responsive-lg font-bold text-[#FF2975]">{ticketPrice}</p>
                          <Image src="/assets/luksologo.png" alt="LYX" width={14} height={14} className="sm:w-5 sm:h-5" />
                        </div>
                      </div>
                      {lastUpdated && (
                        <p className="text-[8px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                          Updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    <div className="w-full max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                      <CountdownTimer 
                        title="Monthly Draw" 
                        timeLeft={monthlyTimeLeft}
                        poolAmount={monthlyPool}
                      />
                      <div className="text-center mt-1 text-[9px] sm:text-xs text-gray-500">
                        Draw #{monthlyDrawNumber} • {monthlyTicketCount} tickets
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-[500px] px-4">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                      <button
                        onClick={openBuyTicket}
                        className="btn btn-primary btn-md text-sm sm:text-base"
                        disabled={loadingData || !isConnected || !contextAccount}
                      >
                        Buy Ticket
                      </button>
                      <button
                        onClick={openLeaderboard}
                        className="btn btn-secondary btn-md text-sm sm:text-base"
                        disabled={loadingData || !isConnected}
                      >
                        Leaderboard
                      </button>
                      <button
                        onClick={openUserPanel}
                        className="btn btn-secondary btn-md text-sm sm:text-base"
                        disabled={loadingData || !isConnected}
                      >
                        My Profile
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <button
                        onClick={openPastDraws}
                        className="btn btn-secondary btn-md text-sm sm:text-base"
                        disabled={loadingData || !isConnected}
                      >
                        Past Draws
                      </button>
                      <button
                        onClick={openInfo}
                        className="btn btn-secondary btn-md text-sm sm:text-base"
                      >
                        Info
                      </button>
                    </div>
                  </div>

                  {contractError && (
                    <div className="mt-responsive-md p-responsive-sm bg-red-100 text-red-700 rounded-md">
                      {contractError}
                    </div>
                  )}

                  {loadError && (
                    <div className="mt-responsive-md p-responsive-sm bg-red-100 text-red-700 rounded-md">
                      <p>{loadError}</p>
                      {connectionRetries < 3 && (
                        <button 
                          onClick={handleConnectionRetry}
                          className="mt-2 px-3 py-1 bg-red-700 text-white rounded-md"
                        >
                          Refresh Connection
                        </button>
                      )}
                    </div>
                  )}

                  {!isConnected && (
                    <div className="mt-responsive-md p-responsive-sm bg-yellow-100 text-yellow-700 rounded-md">
                      Please connect with UP Provider. For full mini-app functionality, wait for the parent page to establish connection.
                    </div>
                  )}

                  {isConnected && !contextAccount && (
                    <div className="mt-responsive-md p-responsive-sm bg-yellow-100 text-yellow-700 rounded-md">
                      No context account found. Please make sure this mini-app is running in an iframe and select a profile.
                      <div className="mt-2 text-xs">
                        Debug: isConnected={isConnected?.toString()} | contextAccount={contextAccount || "null"}
                      </div>
                      <button 
                        onClick={refreshConnection}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md"
                      >
                        Yenile
                      </button>
                    </div>
                  )}
                </div>
        </div>
      </main>
          </div>
          
          {/* Modals */}
          <BuyTicketModal 
            isOpen={isBuyTicketOpen} 
            onClose={closeBuyTicket} 
            ticketPrice={ticketPrice}
          />
          <LeaderboardModal 
            isOpen={isLeaderboardOpen} 
            onClose={closeLeaderboard} 
          />
          <UserPanelModal 
            isOpen={isUserPanelOpen} 
            onClose={closeUserPanel} 
          />
          <PastDrawsModal 
            isOpen={isPastDrawsOpen} 
            onClose={closePastDraws} 
          />
          <InfoModal 
            isOpen={isInfoOpen} 
            onClose={closeInfo}
            onOpenAdminPanel={handleOpenAdminPanel}
          />
          <AdminPanelModal 
            isOpen={isAdminOpen} 
            onClose={closeAdmin} 
          />
        </>
      )}
    </div>
  );
}
