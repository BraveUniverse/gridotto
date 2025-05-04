import { useState, useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import { useUPProvider } from '@/hooks/useUPProvider';
import { DiceIcon } from '@/components/icons/DiceIcon';
import { ProfileItem } from '@/components/ProfileItem';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useVIPPassContract, VIPPassTier } from '@/hooks/useVIPPassContract';
import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import Image from 'next/image';
import { ethers } from 'ethers';
import { LSP26FollowerSystem, useLSP26 } from '@/config/lsp26';
import { InfoCircle } from '@/components/icons/InfoCircle';

interface BuyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice?: string;
}

// Takipçi profil bilgilerini tutacak arayüz
interface FollowerProfile {
  name?: string;
  description?: string;
  profileImage?: {
    url?: string;
  }[];
  address: string;
}

export const BuyTicketModal = ({ 
  isOpen, 
  onClose, 
  ticketPrice = '0.1' 
}: BuyTicketModalProps) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [ticketCountInput, setTicketCountInput] = useState('1');
  const { contextAccount, account, provider } = useUPProvider();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showTicketInput, setShowTicketInput] = useState(false);
  const [buyMode, setBuyMode] = useState<'regular' | 'followers'>('regular');
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [vipTier, setVipTier] = useState<VIPPassTier>(VIPPassTier.NO_TIER);
  const [showVipInfo, setShowVipInfo] = useState(false);
  
  // Takipçi arama ve profil için yeni state'ler
  const [searchTerm, setSearchTerm] = useState('');
  const [followerProfiles, setFollowerProfiles] = useState<Record<string, FollowerProfile>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  
  // Refs for button press handling
  const decreaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const increaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { buyTicket, bulkBuyForSelectedFollowers, getContractInfo, isLoading: isContractLoading, error: contractError } = useGridottoContract();
  const { getHighestTierOwned, getTierName, isLoading: isVipLoading } = useVIPPassContract();
  const { profileData } = useLSP3Profile(contextAccount || '');
  const lsp26 = useLSP26();

  // Takipçilerin VIP durumlarını saklayan state
  const [followerVipTiers, setFollowerVipTiers] = useState<Record<string, VIPPassTier>>({});

  // Initialize modal and fetch contract info when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form states
      setTransactionStatus(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      setBuyMode('regular');
      setSelectedFollowers([]);
      setSearchTerm('');
      
      // Fetch contract info immediately
      fetchContractInfo();
      
      // Fetch VIP Pass information
      fetchVipPassInfo();
      
      // Remove loading state after a short delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Reset states when modal closes
      setShowConfirmation(false);
      setTransactionStatus(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      setTxHash(null);
      setIsProcessing(false);
      setTicketCount(1);
      setTicketCountInput('1');
      setShowTicketInput(false);
      setShowVipInfo(false);
    }
  }, [isOpen]);

  // Watch for contract errors
  useEffect(() => {
    if (contractError) {
      setErrorMessage(contractError);
      setTransactionStatus('error');
      setIsProcessing(false);
    }
  }, [contractError]);
  
  // Clear any running intervals on unmount
  useEffect(() => {
    return () => {
      if (decreaseIntervalRef.current) clearInterval(decreaseIntervalRef.current);
      if (increaseIntervalRef.current) clearInterval(increaseIntervalRef.current);
      if (initialDelayTimeoutRef.current) clearTimeout(initialDelayTimeoutRef.current);
    };
  }, []);

  const fetchContractInfo = async () => {
    try {
      const contractInfo = await getContractInfo();
    } catch (error) {

    }
  };

  const fetchVipPassInfo = async () => {
    if (account) {
      try {
   
        const tier = await getHighestTierOwned(account);

        setVipTier(tier);
      } catch (error) {
   
      }
    }
  };

  // Takipçilerin LSP3 profil verilerini yükleme
  const loadFollowerProfiles = async (followersList: string[]) => {
    if (followersList.length === 0) return;
    
    setLoadingProfiles(true);
    
    try {
      // En fazla 20 profili eşzamanlı olarak yükle (API limitlerine dikkat etmek için)
      const batchSize = 20;
      const profiles: Record<string, FollowerProfile> = {};
      
      for (let i = 0; i < followersList.length; i += batchSize) {
        const batch = followersList.slice(i, i + batchSize);
        
        // Her bir grup için profilleri paralel olarak yükle
        const batchPromises = batch.map(async (address) => {
          try {
            // Hook içinde ERC725 kullanarak profil bilgilerini al
            const { profileData, error } = await fetchProfileData(address);
            
            if (error || !profileData) {
              throw new Error(error || 'Failed to load profile data');
            }
            
            // Profil verisini kullan
            const profile: FollowerProfile = {
              address,
              name: profileData.name || address.slice(0, 6) + '...' + address.slice(-4),
              description: profileData.description,
              profileImage: profileData.profileImage
            };
            
            return { address, profile };
          } catch (error) {
            console.error(`Error loading profile for ${address}:`, error);
            // Hata durumunda basit bir profil göster
            return { 
              address, 
              profile: { 
                address,
                name: address.slice(0, 6) + '...' + address.slice(-4),
              } 
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Sonuçları ana profiles nesnesine ekle
        batchResults.forEach(({ address, profile }) => {
          profiles[address.toLowerCase()] = profile;
        });
      }
      
      // Tüm profilleri state'e kaydet
      setFollowerProfiles(profiles);
    } catch (error) {
      console.error('Error loading follower profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // LSP3 profil verilerini getiren fonksiyon
  const fetchProfileData = async (address: string) => {
    try {
      if (!address) {
        return { profileData: null, error: 'No address provided' };
      }
      
      // Web3 instance'ı kontrol et
      if (!lsp26.web3) {
        return { profileData: null, error: 'Web3 not initialized' };
      }
      
      // useLSP3Profile hook'unu doğrudan kullanamayız, ancak
      // aynı işlemleri manuel olarak gerçekleştirebiliriz
      const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';
      
      const ERC725js = (await import('@erc725/erc725.js')).default;
      const LSP3ProfileSchema = (await import('@erc725/erc725.js/schemas/LSP3ProfileMetadata.json')).default;
      
      // ERC725 instance oluştur
      const config = {
        ipfsGateway: IPFS_GATEWAY
      };
      
      const erc725 = new ERC725js(
        LSP3ProfileSchema,
        address,
        lsp26.web3.currentProvider,
        config
      );
      
      // Profil verilerini çek
      const profileData = await erc725.getData('LSP3Profile');
      
      if (profileData && profileData.value) {
        try {
          const profileValue = profileData.value as any;
          
          if (profileValue.url) {
            // IPFS URL'sini düzelt
            let jsonUrl = profileValue.url;
            if (jsonUrl.startsWith('ipfs://')) {
              jsonUrl = `${IPFS_GATEWAY}${jsonUrl.slice(7)}`;
            }
            
            // JSON içeriğini çek
            const response = await fetch(jsonUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              },
              mode: 'cors',
              cache: 'no-cache'
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseText = await response.text();
            const metadata = JSON.parse(responseText);
            
            if (metadata.LSP3Profile) {
              // Profil resimlerini işle
              const processedProfileImages = metadata.LSP3Profile.profileImage?.map((img: any) => {
                // Kopya oluştur
                const processedImg = { ...img };
                
                // IPFS URL'lerini düzelt
                if (processedImg.url && processedImg.url.startsWith('ipfs://')) {
                  processedImg.url = `${IPFS_GATEWAY}${processedImg.url.slice(7)}`;
                }
                
                return processedImg;
              }) || [];
              
              // Profil verilerini döndür
              return {
                profileData: {
                  name: metadata.LSP3Profile.name,
                  description: metadata.LSP3Profile.description,
                  profileImage: processedProfileImages,
                  tags: metadata.LSP3Profile.tags,
                  links: metadata.LSP3Profile.links
                },
                error: null
              };
            }
          }
        } catch (err: any) {
          return { 
            profileData: null, 
            error: `Metadata parsing error: ${err.message}` 
          };
        }
      }
      
      // Fallback profil verisi
      return {
        profileData: {
          name: address.slice(0, 6) + '...' + address.slice(-4),
          description: 'LUKSO Profile',
          profileImage: []
        },
        error: null
      };
    } catch (err: any) {
      return { 
        profileData: null, 
        error: `Profile fetch error: ${err.message}` 
      };
    }
  };

  // VIP durumu kontrolü için yeni fonksiyon
  const checkFollowersVipStatus = async (followersList: string[]) => {
    try {
     
      const results = await Promise.all(
        followersList.map(async (follower) => {
          try {
    
            const tier = await getHighestTierOwned(follower);
      
            return { address: follower, tier };
          } catch (error) {
       
            return { address: follower, tier: VIPPassTier.NO_TIER };
          }
        })
      );

      const newVipTiers: Record<string, VIPPassTier> = {};
      results.forEach(({ address, tier }) => {
        newVipTiers[address.toLowerCase()] = tier;
      });

  
      setFollowerVipTiers(newVipTiers);
    } catch (error) {
 
    }
  };

  const loadFollowers = async () => {
    if (buyMode === 'followers') {
      setFollowersLoading(true);
      try {
        // If no account connection
        if (!account) {
          console.log('No account connected');
          // Show only 'buy for yourself' option
          setFollowers([]);
          return;
        }
        
        console.log('Trying to load followers for account:', account);
        
        try {
          // Hook'tan LSP26 fonksiyonlarını kullan
          console.log('Getting follower count...');
          const followerCount = await lsp26.getFollowerCount(account);
          console.log('Follower count:', followerCount);
    
          if (followerCount > 0) {
            // Get followers
            console.log('Getting all followers...');
            const followersList = await lsp26.getAllFollowers(account);
            console.log('Followers list received:', followersList);
           
            // Convert followers to a string array
            const followerAddresses = followersList.map((addr: string) => addr.toString());
            console.log('Processed follower addresses:', followerAddresses);
            
            // Do NOT add yourself to the followers list
            // Remove any instance of your own account if it exists in the list
            const filteredFollowers = followerAddresses.filter((addr: string) => !isSameAccount(addr, account));
            console.log('Filtered followers (without self):', filteredFollowers);
            
            setFollowers(filteredFollowers);

            // Takipçilerin VIP durumlarını kontrol et
            await checkFollowersVipStatus(filteredFollowers);
            
            // Takipçilerin profil bilgilerini yükle
            await loadFollowerProfiles(filteredFollowers);
          } else {
            console.log('No followers found');
            // No followers
            setFollowers([]);
          }
        } catch (innerError: any) {
          console.error('Inner error while loading followers:', innerError);
          setErrorMessage(`Error fetching followers: ${innerError.message || 'Unknown error'}`);
          setFollowers([]);
        }
      } catch (error: any) {
        console.error('Error loading followers:', error);
        // Return empty list in case of error
        setFollowers([]);
        setErrorMessage(`Error connecting to LSP-26 Follower System: ${error.message || 'Unknown error'}`);
      } finally {
        setFollowersLoading(false);
      }
    }
  };

  // Arama teriminin değiştiğinde işlem yapacak fonksiyon
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Effect to load followers when buy mode changes
  useEffect(() => {
    loadFollowers();
  }, [buyMode, account]);
  
  // Arama terimine göre filtrelenmiş takipçi listesi
  const filteredFollowers = followers.filter(follower => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const followerAddress = follower.toLowerCase();
    const profile = followerProfiles[followerAddress];
    
    // Adres içinde arama
    if (followerAddress.includes(searchLower)) return true;
    
    // Profil ismi içinde arama
    if (profile?.name && profile.name.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });
  
  // Decrease ticket count on press
  const startDecreaseCount = () => {
    if (ticketCount <= 1) return;
    
    setTicketCount(prev => Math.max(1, prev - 1));
    setTicketCountInput(Math.max(1, ticketCount - 1).toString());
    
    // Start continuous decrease after a delay
    initialDelayTimeoutRef.current = setTimeout(() => {
      decreaseIntervalRef.current = setInterval(() => {
        setTicketCount(prev => {
          const newValue = Math.max(1, prev - 1);
          setTicketCountInput(newValue.toString());
          return newValue;
        });
      }, 100);
    }, 500);
  };
  
  // Stop decreasing
  const stopDecreaseCount = () => {
    if (initialDelayTimeoutRef.current) clearTimeout(initialDelayTimeoutRef.current);
    if (decreaseIntervalRef.current) clearInterval(decreaseIntervalRef.current);
  };
  
  // Increase ticket count on press
  const startIncreaseCount = () => {
    if (ticketCount >= 100) return;
    
    setTicketCount(prev => Math.min(100, prev + 1));
    setTicketCountInput(Math.min(100, ticketCount + 1).toString());
    
    // Start continuous increase after a delay
    initialDelayTimeoutRef.current = setTimeout(() => {
      increaseIntervalRef.current = setInterval(() => {
        setTicketCount(prev => {
          const newValue = Math.min(100, prev + 1);
          setTicketCountInput(newValue.toString());
          return newValue;
        });
      }, 100);
    }, 500);
  };
  
  // Stop increasing
  const stopIncreaseCount = () => {
    if (initialDelayTimeoutRef.current) clearTimeout(initialDelayTimeoutRef.current);
    if (increaseIntervalRef.current) clearInterval(increaseIntervalRef.current);
  };
  
  // Handle direct ticket count input
  const handleTicketInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setTicketCountInput(value);
    
    if (!value) return;
    
    const numValue = parseInt(value);
    if (numValue >= 1 && numValue <= 100) {
      setTicketCount(numValue);
    }
  };
  
  // Finalize ticket count input when blur
  const handleTicketInputBlur = () => {
    let finalValue = parseInt(ticketCountInput || '1');
    
    if (isNaN(finalValue) || finalValue < 1) {
      finalValue = 1;
    } else if (finalValue > 100) {
      finalValue = 100;
    }
    
    setTicketCount(finalValue);
    setTicketCountInput(finalValue.toString());
    setShowTicketInput(false);
  };

  // Toggle follower selection
  const toggleFollowerSelection = (follower: string) => {
    if (selectedFollowers.includes(follower)) {
      setSelectedFollowers(prev => prev.filter(f => f !== follower));
    } else {
      setSelectedFollowers(prev => [...prev, follower]);
    }
  };

  // Equity check helper function
  const isSameAccount = (addr1?: string | null, addr2?: string | null): boolean => {
    if (!addr1 || !addr2) return false;
    return addr1.toLowerCase() === addr2.toLowerCase();
  };

  const handleContinue = () => {
    setErrorMessage(null);
    
    // Common validation checks
    if (!account) {
      setErrorMessage('Not connected');
      return;
    }
    
    if (buyMode === 'regular') {
      // Regular buy validation
      if (!contextAccount) {
        setErrorMessage('No grid profile selected');
      return;
      }
    
    if (isSameAccount(contextAccount, account)) {
      setErrorMessage('You cannot buy from your own profile');
      return;
    }
    } else {
      // Follower buy validation
      if (selectedFollowers.length === 0) {
        setErrorMessage('Please select at least one follower');
      return;
      }
    }
    
    // Show confirmation screen
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!account) {
      setErrorMessage('Not connected');
      return;
    }
    
    setIsProcessing(true);
    setTransactionStatus('pending');
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      let tx;
      
      if (buyMode === 'regular' && contextAccount) {
        // Regular ticket purchase (without security number)
        tx = await buyTicket(contextAccount, ticketCount);
      } else {
        // Bulk buy for followers
        tx = await bulkBuyForSelectedFollowers(selectedFollowers);
      }
      
      if (tx) {
        setTxHash(tx.txHash);
        setTransactionStatus('success');
        setSuccessMessage(buyMode === 'regular' 
          ? `Successfully purchased ${ticketCount} tickets for profile!` 
          : `Successfully purchased tickets for ${selectedFollowers.length} followers!`);
      }
    } catch (error: any) {
     
      setTransactionStatus('error');
      setErrorMessage(error.message || 'Failed to complete transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setShowConfirmation(false);
    setTransactionStatus(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };
  
  const handleVipInfoToggle = () => {
    setShowVipInfo(!showVipInfo);
  };

  // Calculate total price including all selected tickets
  const calculateTotalPrice = () => {
    if (buyMode === 'regular') {
      return parseFloat(ticketPrice) * ticketCount;
    } else {
      return parseFloat(ticketPrice) * selectedFollowers.length;
    }
  };

  // Render VIP badge if user has a VIP pass
  const renderVipBadge = () => {
    if (vipTier === VIPPassTier.NO_TIER) return null;
    
    const tierColors = {
      [VIPPassTier.SILVER]: 'bg-gray-300',
      [VIPPassTier.GOLD]: 'bg-yellow-400',
      [VIPPassTier.DIAMOND]: 'bg-blue-300',
      [VIPPassTier.UNIVERSE]: 'bg-purple-500',
    };
    
    return (
      <div 
        className={`px-3 py-1 text-xs rounded-full text-white font-semibold cursor-pointer ${tierColors[vipTier]}`}
        onClick={handleVipInfoToggle}
      >
        {getTierName(vipTier)} VIP
      </div>
    );
  };

  // Takipçi VIP durumunu alma yardımcı fonksiyonu
  const getFollowerVipTier = (follower: string): VIPPassTier => {
    const tier = followerVipTiers[follower.toLowerCase()] || VIPPassTier.NO_TIER;
  
    return tier;
  };

  // Render the content based on the current mode and state
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buy Tickets">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF2975]"></div>
        </div>
      ) : showConfirmation ? (
        // Confirmation screen
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Confirmation</h3>
            
            {buyMode === 'regular' ? (
              <div className="space-y-2">
                <p className="text-sm">You are about to purchase <span className="font-bold">{ticketCount}</span> ticket{ticketCount > 1 ? 's' : ''} for:</p>
                <div className="flex items-center">
                  <ProfileItem 
                    address={contextAccount || ''} 
                    size="md"
                    vipTier={vipTier}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">You are about to purchase tickets for <span className="font-bold">{selectedFollowers.length}</span> follower{selectedFollowers.length > 1 ? 's' : ''}:</p>
                <div className="max-h-32 overflow-y-auto">
                  {selectedFollowers.map((follower, index) => (
                    <div key={index} className="mb-2">
                      <ProfileItem address={follower} size="sm" vipTier={getFollowerVipTier(follower)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-bold">{calculateTotalPrice().toFixed(2)} LYX</span>
              </div>
              
              {vipTier !== VIPPassTier.NO_TIER && (
                <div className="mt-2 text-sm text-green-600">
                  Your {getTierName(vipTier)} VIP pass will provide bonus tickets!
                </div>
              )}
            </div>
          </div>
          
          {transactionStatus === 'pending' && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg flex items-center text-sm">
              <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-yellow-700"></div>
              Transaction in progress...
            </div>
          )}
          
          {transactionStatus === 'success' && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              <p className="font-semibold">Success!</p>
              <p>{successMessage}</p>
              {txHash && (
                <p className="mt-1">
                  <a
                    href={`https://explorer.lukso.network/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View transaction
                  </a>
                </p>
              )}
            </div>
          )}
          
          {transactionStatus === 'error' && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              <p className="font-semibold">Error</p>
              <p>{errorMessage}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              className="w-1/2 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleBack}
              disabled={isProcessing}
            >
              Back
            </button>
            
            <button
              className="w-1/2 py-2 bg-[#FF2975] text-white rounded-lg hover:bg-[#E82569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={isProcessing || transactionStatus === 'success'}
            >
              {isProcessing ? 'Processing...' : transactionStatus === 'success' ? 'Completed' : 'Confirm'}
            </button>
          </div>
                </div>
              ) : (
        // Main form
        <div className="space-y-4">
          {/* Mode switcher */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              className={`py-2 text-sm font-medium rounded-lg ${
                buyMode === 'regular' 
                  ? 'bg-[#FF2975] text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setBuyMode('regular')}
            >
              Buy For Profile
            </button>
            <button
              className={`py-2 text-sm font-medium rounded-lg ${
                buyMode === 'followers' 
                  ? 'bg-[#FF2975] text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setBuyMode('followers')}
            >
              Buy For Followers
            </button>
          </div>
          
          {/* VIP Pass info if user has one */}
          {vipTier !== VIPPassTier.NO_TIER && (
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Your VIP Status</div>
                {renderVipBadge()}
              </div>
              
              {showVipInfo && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">VIP Pass Benefits:</p>
                  <ul className="mt-1 list-disc list-inside">
                    {vipTier === VIPPassTier.SILVER && <li>5 bonus tickets weekly</li>}
                    {vipTier === VIPPassTier.GOLD && <li>10 bonus tickets weekly</li>}
                    {vipTier === VIPPassTier.DIAMOND && <li>20 bonus tickets weekly</li>}
                    {vipTier === VIPPassTier.UNIVERSE && <li>50 bonus tickets weekly</li>}
                    <li>Increased winning chances</li>
                    <li>Special access to future events</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {buyMode === 'regular' ? (
            <>
              {/* Regular buy form */}
          <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Profile to Buy For
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                {contextAccount ? (
                      <ProfileItem 
                        address={contextAccount} 
                        size="md"
                        vipTier={vipTier}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No profile selected</p>
                    )}
            </div>
          </div>
          
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tickets
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
            <button 
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none"
              onMouseDown={startDecreaseCount}
              onMouseUp={stopDecreaseCount}
              onMouseLeave={stopDecreaseCount}
              onTouchStart={startDecreaseCount}
              onTouchEnd={stopDecreaseCount}
            >
                      -
            </button>
            
                    <div 
                      className="flex-grow text-center"
                      onClick={() => setShowTicketInput(true)}
                    >
            {showTicketInput ? (
              <input
                type="text"
                value={ticketCountInput}
                onChange={handleTicketInputChange}
                onBlur={handleTicketInputBlur}
                          className="w-full text-center p-2 focus:outline-none"
                autoFocus
              />
            ) : (
                        <div className="p-2">{ticketCount}</div>
                      )}
                    </div>
            
            <button 
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none"
              onMouseDown={startIncreaseCount}
              onMouseUp={stopIncreaseCount}
              onMouseLeave={stopIncreaseCount}
              onTouchStart={startIncreaseCount}
              onTouchEnd={stopIncreaseCount}
            >
                      +
            </button>
          </div>
                  <p className="mt-1 text-sm text-gray-500">Price: {parseFloat(ticketPrice) * ticketCount} LYX</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Followers selection form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Followers
                  </label>
                  
                  {/* Takipçi arama alanı */}
                  {!followersLoading && followers.length > 0 && (
                    <div className="mb-2 relative">
                      <input
                        type="text"
                        className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2975] focus:border-transparent"
                        placeholder="Search followers"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                      <span className="absolute left-2.5 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                    </div>
                  )}
                  
                  {followersLoading ? (
                    <div className="p-4 bg-gray-50 rounded-lg flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FF2975]"></div>
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-sm flex items-center gap-2">
                      <InfoCircle size={18} />
                      <p>You don't have any followers yet. Start connecting with others on LUKSO to grow your network!</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-2">
                      {loadingProfiles && searchTerm && (
                        <div className="p-2 text-center text-gray-500 text-sm">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#FF2975] mr-2"></div>
                          Profiller yükleniyor...
                        </div>
                      )}
                      
                      {filteredFollowers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          "{searchTerm}" ile eşleşen takipçi bulunamadı
                        </div>
                      ) : (
                        filteredFollowers.map((follower, index) => {
                          const profile = followerProfiles[follower.toLowerCase()];
                          const displayName = profile?.name || follower.substring(0, 6) + '...' + follower.substring(follower.length - 4);
                          
                          return (
                            <div 
                              key={index}
                              className={`p-2 mb-2 rounded-lg cursor-pointer transition-colors ${
                                selectedFollowers.includes(follower) 
                                  ? 'bg-[#FF2975]/10 border border-[#FF2975]/30' 
                                  : 'bg-white hover:bg-gray-100 border border-gray-200'
                              }`}
                              onClick={() => toggleFollowerSelection(follower)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <ProfileItem 
                                    address={follower} 
                                    size="sm" 
                                    vipTier={getFollowerVipTier(follower)}
                                  />
                                  {profile?.name && profile.name !== displayName && (
                                    <span className="ml-2 text-sm text-gray-600 truncate">
                                      {profile.name}
                                    </span>
                                  )}
                                </div>
                                
                                {selectedFollowers.includes(follower) && (
                                  <div className="bg-[#FF2975] text-white h-5 w-5 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-700">
                    Selected: {selectedFollowers.length} followers
                    {selectedFollowers.length > 0 && ` (Total: ${(parseFloat(ticketPrice) * selectedFollowers.length).toFixed(2)} LYX)`}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
            
            <button
            className="w-full py-2 bg-[#FF2975] text-white rounded-lg hover:bg-[#E82569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={
              !account || 
              (buyMode === 'regular' && !contextAccount) ||
              (buyMode === 'followers' && selectedFollowers.length === 0)
            }
          >
            Continue
            </button>
          </div>
      )}
    </Modal>
  );
}; 
