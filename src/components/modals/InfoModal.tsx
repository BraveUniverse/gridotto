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
            complete transparency and fairness.
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
              <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center font-semibold mr-3 flex-shrink-0">3</div>
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
            Gridotto employs several security measures to ensure that draws are completely fair, transparent, and resistant to manipulation. 
            The lottery's integrity is maintained by a combination of blockchain technology and cryptographic security features.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-4">
            <h4 className="font-medium text-blue-700 mb-1">Blockchain Transparency</h4>
            <p className="text-sm text-gray-700">
              Every transaction, ticket purchase, and draw result is permanently recorded on the LUKSO blockchain, 
              creating an immutable record that can be independently verified at any time.
            </p>
          </div>
        </div>
      </div>
      
      {/* Security Number Importance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Security Number</h3>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-gray-700">
            When purchasing tickets, each player provides a <strong>Security Number</strong> (1-999). 
            This number plays a critical role in the fairness of draws and protection against manipulation.
          </p>
          
          <div className="grid grid-cols-1 gap-4 mt-3">
            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-gray-800 mb-2">Unpredictable Winner Selection</h4>
              <p className="text-sm text-gray-600">
                Security numbers from all participants are combined with blockchain data (block hash and timestamp) to create a 
                truly random and unpredictable selection process that cannot be influenced even by the contract owner.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-gray-800 mb-2">Front-Running Protection</h4>
              <p className="text-sm text-gray-600">
                Security numbers make it impossible for observers to predict or manipulate draw results by analyzing 
                pending transactions. This prevents "front-running" attacks common in blockchain applications.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-gray-800 mb-2">Multi-Source Entropy</h4>
              <p className="text-sm text-gray-600">
                By combining player-provided security numbers with blockchain data, Gridotto creates multiple 
                sources of randomness (entropy), making the system significantly more secure than single-source 
                random number generators.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Technical Implementation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Technical Implementation</h3>
        </div>
        <div className="p-5">
          <p className="text-gray-700 mb-4">
            The winner selection algorithm uses cryptographic hashing to combine multiple inputs, creating 
            a secure and verifiable random selection process:
          </p>
          
          <div className="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-sm overflow-auto">
            <pre>
{`// Simplified representation of the winner selection algorithm
bytes32 combinedHash;

// Step 1: Combine all ticket data with security numbers
for (uint i = 0; i < tickets.length; i++) {
    combinedHash = keccak256(abi.encodePacked(
        combinedHash,                  // Previous hash
        tickets[i],                    // Ticket holder address
        securityNumbers[tickets[i]]    // Player's security number
    ));
}

// Step 2: Add blockchain data for additional randomness
bytes32 finalHash = keccak256(abi.encodePacked(
    combinedHash,              // Combined ticket data & security numbers
    blockhash(block.number-1), // Hash of the previous block
    block.timestamp            // Current block timestamp
));

// Step 3: Select winner using the final hash as index
return tickets[uint(finalHash) % tickets.length];`}
            </pre>
          </div>
          
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <h4 className="font-medium text-yellow-800 mb-1">Important Note</h4>
            <p className="text-sm text-gray-700">
              This algorithm ensures that even if someone could predict the exact block time and hash 
              (which is practically impossible), they would still need to know every participant's security 
              number to manipulate the result – making the system effectively impossible to cheat.
            </p>
          </div>
        </div>
      </div>
      
      {/* Additional Security Measures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Additional Security Measures</h3>
        </div>
        <div className="p-5 space-y-2">
          <div className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
            <div className="bg-[#FF2975] text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Draw Lock Period</h4>
              <p className="text-sm text-gray-600">
                Ticket sales are locked shortly before each draw to prevent last-moment manipulation attempts.
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
              <h4 className="font-medium text-gray-800">Ticket Limits</h4>
              <p className="text-sm text-gray-600">
                Maximum ticket limits per draw prevent a single entity from dominating the pool and manipulating odds.
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
              <h4 className="font-medium text-gray-800">Non-Custodial Prize Pool</h4>
              <p className="text-sm text-gray-600">
                Prize pools are managed entirely on-chain with automatic distribution, eliminating human interference.
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
              <h4 className="font-medium text-gray-800">Reentracy Protection</h4>
              <p className="text-sm text-gray-600">
                Smart contract security measures prevent malicious contracts from exploiting the draw or prize claiming process.
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
                    <p className="text-xs font-medium text-gray-700">Version 1.0.0</p>
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