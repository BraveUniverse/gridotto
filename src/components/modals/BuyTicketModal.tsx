import { useState, useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import { useUPProvider } from '@/hooks/useUPProvider';
import { DiceIcon } from '@/components/icons/DiceIcon';
import { ProfileItem } from '@/components/ProfileItem';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import Image from 'next/image';

interface BuyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice?: string;
}

export const BuyTicketModal = ({ 
  isOpen, 
  onClose, 
  ticketPrice = '0.1' 
}: BuyTicketModalProps) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [ticketCountInput, setTicketCountInput] = useState('1');
  const [luckyNumber, setLuckyNumber] = useState('');
  const { contextAccount, account } = useUPProvider();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showTicketInput, setShowTicketInput] = useState(false);
  
  // Refs for button press handling
  const decreaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const increaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { buyTicket, getContractInfo, isLoading: isContractLoading, error: contractError } = useGridottoContract();

  // Initialize random number and fetch contract info when modal opens
  useEffect(() => {
   
    
    if (isOpen) {
   
      
      // Reset form states
      setTransactionStatus(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Generate a random security number
      generateRandomNumber();
      
      // Fetch contract info immediately
      fetchContractInfo();
      
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
  
  // Debug transaction status
  useEffect(() => {
    if (transactionStatus) {
   
    }
  }, [transactionStatus]);
  
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

  const generateRandomNumber = () => {
    const random = Math.floor(Math.random() * 999) + 1; // Random number between 1-999
    setLuckyNumber(random.toString());
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value);
    
    if (!value) {
      setLuckyNumber('');
      return;
    }
    
    if (numValue >= 1 && numValue <= 999) {
      setLuckyNumber(numValue.toString());
    }
  };
  
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

  // Equity check helper function
  const isSameAccount = (addr1?: string | null, addr2?: string | null): boolean => {
    if (!addr1 || !addr2) return false;
    return addr1.toLowerCase() === addr2.toLowerCase();
  };

  const handleContinue = () => {

    setErrorMessage(null);
    
    // Validation checks
    if (!contextAccount) {
      setErrorMessage('No grid profile selected');
      return;
    }
    
    if (!account) {
      setErrorMessage('Not connected');
      return;
    }
    
    if (isSameAccount(contextAccount, account)) {
      setErrorMessage('You cannot buy from your own profile');
      return;
    }
    
    if (!luckyNumber || parseInt(luckyNumber) < 1 || parseInt(luckyNumber) > 999) {
      setErrorMessage('Please enter a valid security number (1-999)');
      return;
    }
    
    // Show confirmation screen
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
 
    
    if (!contextAccount || !account || !luckyNumber) {
     
      return;
    }
    
    try {
      setTransactionStatus('pending');
      setIsProcessing(true);
      setErrorMessage(null);
      
     
      // Use the updated buyTicket function
      const result = await buyTicket(
        contextAccount,
        ticketCount,
        parseInt(luckyNumber)
      );
      
      if (result) {

        setTransactionStatus('success');
        setSuccessMessage('Ticket purchased successfully!');
        setTxHash(result.txHash);
        
        // Close modal after 3 seconds on success
        setTimeout(() => {
      
          onClose();
        }, 5000);
      } else {
     
        setTransactionStatus('error');
        setErrorMessage('Transaction failed. Please try again.');
      }
    } catch (error: any) {
 
      setTransactionStatus('error');
      setErrorMessage(error.message || 'An error occurred during the transaction.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {

    setShowConfirmation(false);
    setTransactionStatus(null);
    setErrorMessage(null);
  };

  // Render confirmation screen
  if (showConfirmation) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={isProcessing || transactionStatus === 'success' ? () => {
    
        } : onClose} 
        title="Confirm Purchase"
      >
        <div className="space-y-6 text-gray-700">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-[#FF2975] mb-3">Purchase Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="font-medium">Grid Owner:</span>
                <div className="flex items-center">
                  <ProfileItem 
                    address={contextAccount || ''} 
                    size="sm" 
                    showAddress={true}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="font-medium">Your Profile:</span>
                <div className="flex items-center">
                  <ProfileItem 
                    address={account || ''} 
                    size="sm" 
                    showAddress={true}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="font-medium">Number of Tickets:</span>
                <span className="text-lg font-bold">{ticketCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="font-medium">Security Number:</span>
                <span className="text-lg font-bold">{luckyNumber}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="font-medium">Total Cost:</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-[#FF2975]">{(ticketCount * parseFloat(ticketPrice)).toFixed(3)}</span>
                  <Image src="/assets/luksologo.png" alt="LYX" width={16} height={16} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={isProcessing || transactionStatus === 'success'}
            >
              Back
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isProcessing || transactionStatus === 'success'}
              className="flex-1 py-3 bg-gradient-to-r from-[#FF2975] to-[#FF9F80] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Confirm Purchase'
              )}
            </button>
          </div>
          
          {/* Transaction Status */}
          {transactionStatus && (
            <div className={`p-3 rounded ${
              transactionStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
              transactionStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <p className="text-sm">{
                transactionStatus === 'success' ? successMessage : 
                transactionStatus === 'error' ? errorMessage : 
                'Processing transaction...'
              }</p>
              
              {txHash && (
                <p className="text-xs mt-1 break-all">
                  Transaction: {txHash}
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // Render main form
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Buy Ticket"
    >
      <div className="space-y-6 text-gray-700">
        {/* Profile Selection */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-[#FF2975] mb-3">Profiles</h3>
          
          <div className="space-y-4">
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-white">
              <div className="flex justify-between items-center">
                <span className="font-medium">Grid Owner:</span>
                {contextAccount ? (
                  <div className="flex items-center">
                    <ProfileItem 
                      address={contextAccount} 
                      size="sm" 
                      showAddress={true}
                    />
                  </div>
                ) : (
                  <div className="text-gray-400">No grid profile selected</div>
                )}
              </div>
            </div>
            
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-white">
              <div className="flex justify-between items-center">
                <span className="font-medium">Your Profile:</span>
                {account ? (
                  <div className="flex items-center">
                    <ProfileItem 
                      address={account} 
                      size="sm" 
                      showAddress={true}
                    />
                  </div>
                ) : (
                  <div className="text-gray-400">Not connected</div>
                )}
              </div>
            </div>
          </div>
          
          {account && contextAccount && isSameAccount(account, contextAccount) && (
            <div className="mt-4 p-3 rounded bg-yellow-50 text-yellow-800 border border-yellow-200">
              <p className="text-sm font-medium">You can't buy tickets on your own grid!</p>
              <p className="text-xs mt-1">Please select a different grid.</p>
            </div>
          )}
        </div>
        
        {/* Ticket Selection */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-[#FF2975] mb-3">Number of Tickets</h3>
          <p className="text-sm mb-4">
            Select the number of tickets you want to purchase. Each ticket costs {ticketPrice} 
            <Image src="/assets/luksologo.png" alt="LYX" width={14} height={14} className="inline-block ml-1 mb-0.5" />
          </p>
          
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-300">
            <button 
              onMouseDown={startDecreaseCount}
              onMouseUp={stopDecreaseCount}
              onMouseLeave={stopDecreaseCount}
              onTouchStart={startDecreaseCount}
              onTouchEnd={stopDecreaseCount}
              disabled={ticketCount <= 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showTicketInput ? (
              <input
                type="text"
                value={ticketCountInput}
                onChange={handleTicketInputChange}
                onBlur={handleTicketInputBlur}
                autoFocus
                className="w-16 text-center text-xl font-bold border-0 focus:outline-none focus:ring-0"
              />
            ) : (
              <span 
                className="text-xl font-bold cursor-pointer"
                onClick={() => setShowTicketInput(true)}
              >
                {ticketCount}
              </span>
            )}
            
            <button 
              onMouseDown={startIncreaseCount}
              onMouseUp={stopIncreaseCount}
              onMouseLeave={stopIncreaseCount}
              onTouchStart={startIncreaseCount}
              onTouchEnd={stopIncreaseCount}
              disabled={ticketCount >= 100}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
            <span className="font-medium">Total Cost:</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-[#FF2975]">{(ticketCount * parseFloat(ticketPrice)).toFixed(3)}</span>
              <Image src="/assets/luksologo.png" alt="LYX" width={16} height={16} />
            </div>
          </div>
        </div>
        
        {/* Security Number */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-[#FF2975] mb-3">Security Number</h3>
          <p className="text-sm mb-4">
            Enter a security number (1-999) for added randomness. This helps ensure fair draw results.
          </p>
          
          <div className="flex items-center">
            <input
              type="text"
              value={luckyNumber}
              onChange={handleNumberChange}
              placeholder="Enter number (1-999)"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#FF2975] focus:border-transparent"
            />
            
            <button
              onClick={generateRandomNumber}
              className="p-3 bg-[#FF2975] text-white rounded-r-lg hover:bg-[#e02769] transition-colors"
              title="Generate Random Number"
            >
              <DiceIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Purchase Button - Only content changes based on condition */}
        <button
          onClick={handleContinue}
          disabled={!contextAccount || ticketCount <= 0 || !luckyNumber || isSameAccount(contextAccount, account)}
          className="w-full py-3 bg-gradient-to-r from-[#FF2975] to-[#FF9F80] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSameAccount(contextAccount, account) ? 'You can\'t buy tickets on your own grid' : 'Continue'}
        </button>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded bg-red-50 text-red-800 border border-red-200">
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}; 