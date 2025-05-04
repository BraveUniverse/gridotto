import { useState, useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import { GRIDOTTO_CONTRACT_ADDRESS } from '@/config/contract';
import Image from 'next/image';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
}

export const InfoModal = ({ isOpen, onClose, onOpenAdminPanel }: InfoModalProps) => {
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'security'>('about');
  
  // Redirect lock with better control
  const [redirectLock, setRedirectLock] = useState(false);
  const adminRedirectRef = useRef(false);
  const modalCloseRef = useRef(false);
  
  const { 
    getContractInfo, 
    isLoading: contractLoading, 
    error: contractError,
    getOwner
  } = useGridottoContract();
  const { account } = useUPProvider();

  // Reset flags when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      adminRedirectRef.current = false;
      modalCloseRef.current = false;
      setRedirectLock(false);
    }
  }, [isOpen]);
  
  // Handle admin panel redirect directly
  const handleAdminRedirect = () => {
    if (!onOpenAdminPanel || modalCloseRef.current) return;
    
    // Mark as being redirected
    modalCloseRef.current = true;
    
    // First close this modal completely
    onClose();
    
    // Then open admin panel after a full second delay to ensure complete DOM cleanup
    setTimeout(() => {
      if (onOpenAdminPanel) {
        onOpenAdminPanel();
      }
    }, 1000);
  };
  
  // Admin check - only once
  useEffect(() => {
    if (!isOpen || redirectLock) return;
    
    const checkIfAdmin = async () => {
      if (account) {
        try {
          const ownerAddress = await getOwner();
          if (ownerAddress) {
            const isOwner = account.toLowerCase() === ownerAddress.toLowerCase();
            setIsAdmin(isOwner);
            
            // If admin and not redirected yet, redirect
            if (isOwner && onOpenAdminPanel && !adminRedirectRef.current) {
              adminRedirectRef.current = true;
              setRedirectLock(true);
              
              // Use our dedicated handler for redirection
              handleAdminRedirect();
            }
          }
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkIfAdmin();
  }, [isOpen, account, getOwner, onOpenAdminPanel, onClose, redirectLock]);
  
  // Manual admin button handler
  const handleOpenAdminClick = () => {
    if (modalCloseRef.current) return;
    handleAdminRedirect();
  };
  
  // Load contract info
  useEffect(() => {
    const loadContractInfo = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      
      try {
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
      } catch (err) {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen && !isAdmin) {
      loadContractInfo();
    }
  }, [isOpen, getContractInfo, isAdmin]);

  // Calculate available profit
  const calculateAvailableProfit = (): string => {
    if (!contractInfo?.contractBalance) {
      return '0';
    }
    
    try {
      const balance = parseFloat(contractInfo.contractBalance);
      // Since we don't have direct access to the current pool amounts, we estimate
      const estimatedPrizePoolPercent = 100 - (parseFloat(contractInfo.ownerFeePercent) + parseFloat(contractInfo.monthlyPoolPercent));
      const weeklyPoolPercent = estimatedPrizePoolPercent;
      const monthlyPoolPercent = parseFloat(contractInfo.monthlyPoolPercent);
      
      // Owner fees available
      const ownerFeePercent = parseFloat(contractInfo.ownerFeePercent);
      return ((balance * ownerFeePercent) / 100).toFixed(3);
    } catch (error) {
      return '0';
    }
  };

  // Render about tab content
  const renderAboutTab = () => (
    <div className="grid gap-6">
      {/* About Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">What is Gridotto?</h3>
        </div>
        <div className="p-5">
          <p className="text-gray-700 mb-4">
            Gridotto is a transparent and fair lottery system built on the LUKSO blockchain
            that integrates with Universal Profiles. The unique concept of Gridotto is that 
            users purchase tickets from other profiles (not their own), creating social interactions
            and network effects within the ecosystem.
          </p>
          <p className="text-gray-700">
            The system runs both weekly and monthly draws, with prize pools funded by ticket 
            purchases. All transactions and draws are recorded on the blockchain, ensuring
            complete transparency and fairness with enhanced security in version 2.0.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">How It Works</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center font-semibold mr-3 flex-shrink-0">1</div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Buy Tickets</h4>
                <p className="text-sm text-gray-600">
                  Purchase tickets for <strong>another profile</strong> (not your own). Each ticket costs{' '}
                  <span className="font-medium text-[#FF2975]">
                    {contractInfo?.ticketPrice || '0.1'}
                    <Image src="/assets/luksologo.png" alt="LYX" width={12} height={12} className="inline-block ml-1 mb-0.5" />
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center font-semibold mr-3 flex-shrink-0">2</div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Social Interaction</h4>
                <p className="text-sm text-gray-600">
                  When you buy tickets for other profiles, both you and they receive tickets for the draws.
                  This creates a social network effect where users are incentivized to interact with each other.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center font-semibold mr-3 flex-shrink-0">3</div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Wait for Draw</h4>
                <p className="text-sm text-gray-600">
                  Weekly and monthly draws happen automatically when the timer reaches zero.
                  Your tickets are entered into both draws when you purchase them.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center font-semibold mr-3 flex-shrink-0">4</div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Claim Prizes</h4>
                <p className="text-sm text-gray-600">
                  If you win, your prize will be available to claim from your profile page.
                  Check the Profile tab to view and claim any pending prizes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prize Pools */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Prize Distribution</h3>
        </div>
        <div className="p-5">
          <div className="rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-b from-pink-50 to-white p-4 rounded-xl border border-pink-100">
                <h4 className="font-medium text-gray-800 mb-2">Weekly Draw</h4>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xl font-semibold text-[#FF2975]">
                    {100 - (parseFloat(contractInfo?.ownerFeePercent || '5') + parseFloat(contractInfo?.monthlyPoolPercent || '20'))}%
                  </span>
                  <span className="text-xs text-gray-500">of ticket sales</span>
                </div>
                <p className="text-xs text-gray-600">
                  The largest portion of ticket sales goes to the weekly prize pool, drawn every 7 days.
                </p>
              </div>
              
              <div className="bg-gradient-to-b from-indigo-50 to-white p-4 rounded-xl border border-indigo-100">
                <h4 className="font-medium text-gray-800 mb-2">Monthly Draw</h4>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xl font-semibold text-indigo-600">
                    {contractInfo?.monthlyPoolPercent || '20'}%
                  </span>
                  <span className="text-xs text-gray-500">of ticket sales</span>
                </div>
                <p className="text-xs text-gray-600">
                  A portion goes to the monthly prize pool, creating larger prizes drawn every 30 days.
                </p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Platform Fee</h4>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xl font-semibold text-gray-700">
                    {contractInfo?.ownerFeePercent || '5'}%
                  </span>
                  <span className="text-xs text-gray-500">of ticket sales</span>
                </div>
                <p className="text-xs text-gray-600">
                  A small percentage goes to platform maintenance and future development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Contract Statistics</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1 text-center">Total Tickets Sold</p>
              <p className="text-xl font-semibold text-gray-900 text-center">{contractInfo?.totalTicketCount || '0'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1 text-center">Current Ticket Price</p>
              <div className="flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-900">{contractInfo?.ticketPrice || '0.1'}</span>
                <Image src="/assets/luksologo.png" alt="LYX" width={16} height={16} className="ml-1" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1 text-center">Contract Balance</p>
              <div className="flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-900">{contractInfo?.contractBalance || '0'}</span>
                <Image src="/assets/luksologo.png" alt="LYX" width={16} height={16} className="ml-1" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1 text-center">Platform Fees Collected</p>
              <div className="flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-900">{calculateAvailableProfit()}</span>
                <Image src="/assets/luksologo.png" alt="LYX" width={16} height={16} className="ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render security tab content
  const renderSecurityTab = () => (
    <div className="grid gap-6">
      {/* Security Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Draw Security</h3>
        </div>
        <div className="p-5">
          <p className="text-gray-700 mb-4">
            Gridotto v2.0 employs advanced security measures to ensure that draws are completely fair, transparent, and resistant to manipulation. 
            The lottery's integrity is maintained by a combination of blockchain technology, cryptographic security features, and improved smart contract architecture.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-4">
            <h4 className="font-medium text-blue-700 mb-1">Enhanced Security in Version 2.0</h4>
            <p className="text-sm text-gray-700">
              The new version includes improved prize pool management, secured profit withdrawal mechanisms, and 
              enhanced data cleanup solutions to optimize gas costs while maintaining historical records.
            </p>
          </div>
        </div>
      </div>
      
      {/* Oracle Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Oracle Integration</h3>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-gray-700">
            Gridotto v2.0 integrates with a cryptographically secure random oracle to enhance the fairness and unpredictability of draws.
          </p>
          
          <div className="grid grid-cols-1 gap-4 mt-3">
            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-gray-800 mb-2">External Randomness Source</h4>
              <p className="text-sm text-gray-600">
                The integration with a dedicated oracle service provides an external source of entropy that cannot be
                manipulated by any participant or even the contract owner.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-gray-800 mb-2">Multi-layered Randomness</h4>
              <p className="text-sm text-gray-600">
                Oracle-provided random values are combined with blockchain data (block hash and timestamp) to create a 
                truly random and unpredictable selection process with multiple layers of security.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Security Measures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Additional Security Measures in v2.0</h3>
        </div>
        <div className="p-5 space-y-2">
          <div className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
            <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Secure Profit Withdrawal</h4>
              <p className="text-sm text-gray-600">
                Improved logic ensures that only platform fees can be withdrawn as profit, protecting user prizes.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
            <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Data Cleanup Mechanisms</h4>
              <p className="text-sm text-gray-600">
                Optimized storage with data cleanup functions that preserve historical winners while reducing gas costs.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
            <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">VIP Pass Integration</h4>
              <p className="text-sm text-gray-600">
                Integration with VIP Pass NFTs provides bonus tickets to loyal participants, enhancing community engagement.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
            <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Enhanced Reentracy Protection</h4>
              <p className="text-sm text-gray-600">
                Updated smart contract security measures prevent all forms of reentrancy attacks across all functions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About Gridotto">
      <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF2975]"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Admin Section - Only visible to contract owner */}
            {isAdmin && (
              <div className="bg-gradient-to-r from-pink-50 to-rose-100 rounded-xl overflow-hidden shadow-sm">
                <div className="border-l-4 border-[#FF2975] p-5">
                  <h3 className="text-lg font-semibold text-[#FF2975] mb-2">Admin Access</h3>
                  <p className="text-sm mb-4 text-gray-700">
                    You have administrator access to this contract. You can manage settings, execute draws, and monitor statistics.
                  </p>
                  <button 
                    onClick={handleOpenAdminClick} 
                    className="w-full py-2.5 bg-gradient-to-r from-[#FF2975] to-[#FF6F61] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Open Admin Panel
                  </button>
                </div>
              </div>
            )}
            
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-2">
              <button
                className={`py-3 px-6 text-sm font-medium ${
                  activeTab === 'about' 
                    ? 'border-b-2 border-[#FF2975] text-[#FF2975]' 
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-150 ease-in-out`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              <button
                className={`py-3 px-6 text-sm font-medium ${
                  activeTab === 'security' 
                    ? 'border-b-2 border-[#FF2975] text-[#FF2975]' 
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-150 ease-in-out`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'about' ? renderAboutTab() : renderSecurityTab()}

            {/* Contract Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
                  <div className="flex flex-col items-center sm:items-start">
                    <p className="text-sm text-gray-500">Contract Address</p>
                    <a 
                      href={`https://explorer.mainnet.lukso.network/address/${GRIDOTTO_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF2975] hover:underline flex items-center"
                    >
                      <span>{GRIDOTTO_CONTRACT_ADDRESS.substring(0, 6)}...{GRIDOTTO_CONTRACT_ADDRESS.substring(38)}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <p className="text-xs font-medium text-gray-700">Version 2.0.0</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}; 