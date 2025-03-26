import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import Image from 'next/image';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'settings' | 'actions' | 'finance' | 'operators' | 'emergency';

export const AdminPanelModal = ({ isOpen, onClose }: AdminPanelModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [loading, setLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form states
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [newOwnerFee, setNewOwnerFee] = useState('');
  const [newMonthlyPoolFee, setNewMonthlyPoolFee] = useState('');
  const [newDrawInterval, setNewDrawInterval] = useState('');
  const [newMonthlyDrawInterval, setNewMonthlyDrawInterval] = useState('');
  
  // Draw time adjustment
  const [drawTimeAdjustment, setDrawTimeAdjustment] = useState('');
  const [isMonthlyAdjustment, setIsMonthlyAdjustment] = useState(false);
  
  // Operator management
  const [newOperatorAddress, setNewOperatorAddress] = useState('');
  const [removeOperatorAddress, setRemoveOperatorAddress] = useState('');
  const [operatorsList, setOperatorsList] = useState<string[]>([]);
  
  // Pool funding
  const [weeklyPoolAmount, setWeeklyPoolAmount] = useState('');
  const [monthlyPoolAmount, setMonthlyPoolAmount] = useState('');
  
  // Emergency controls
  const [contractPaused, setContractPaused] = useState(false);
  
  // Transaction states
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { 
    getContractInfo, 
    setTicketPrice,
    setFeePercentages,
    setDrawInterval,
    setMonthlyDrawInterval,
    manualDraw,
    manualMonthlyDraw,
    withdrawProfit, 
    withdrawAll,
    adjustDrawTime,
    addOperator,
    removeOperator,
    fundWeeklyPool,
    fundMonthlyPool,
    emergencyToggle,
    isOperator,
    getContractPausedStatus,
    isLoading: isContractLoading,
    error: contractError,
    getOwner
  } = useGridottoContract();
  
  const { account } = useUPProvider();

  // Check admin status when component mounts
  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const ownerAddress = await getOwner();
        if (ownerAddress && account) {
          setIsAdmin(account.toLowerCase() === ownerAddress.toLowerCase());
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };
    
    if (isOpen && account) {
      checkIfAdmin();
    }
  }, [account, getOwner, isOpen]);

  // Watch for contract errors
  useEffect(() => {
    if (contractError) {
      setErrorMessage(contractError);
      setIsProcessing(false);
    }
  }, [contractError]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage(null);
      setErrorMessage(null);
      setIsProcessing(false);
    }
  }, [isOpen]);
  
  // Load contract info when modal opens
  useEffect(() => {
    const loadContractInfo = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      
      try {
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
        
        // Load contract paused status
        const pausedStatus = await getContractPausedStatus();
        setContractPaused(pausedStatus);
        
      } catch (err) {
    
      } finally {
        setLoading(false);
      }
    };
    
    loadContractInfo();
  }, [isOpen, getContractInfo, getContractPausedStatus]);
  
  // Admin operations handlers
  const handleUpdateTicketPrice = async () => {
    if (!newTicketPrice) return;
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await setTicketPrice(newTicketPrice);
      
      if (result) {
        setSuccessMessage('Ticket price updated successfully!');
        
        // Reload contract info
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Ticket price update failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleUpdateFees = async () => {
    if (!newOwnerFee || !newMonthlyPoolFee) return;
    
    const ownerFee = parseInt(newOwnerFee);
    const monthlyFee = parseInt(newMonthlyPoolFee);
    
    if (ownerFee + monthlyFee > 50) {
      setErrorMessage('Total fees cannot exceed 50%');
      return;
    }
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await setFeePercentages(ownerFee, monthlyFee);
      
      if (result) {
        setSuccessMessage('Fees updated successfully!');
        
        // Reload contract info
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Fees update failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAdjustDrawTime = async () => {
    if (!drawTimeAdjustment) return;
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      // Time adjustment in seconds (positive: extend, negative: shorten)
      const timeAdjustment = parseInt(drawTimeAdjustment);
      
      const result = await adjustDrawTime(timeAdjustment, isMonthlyAdjustment);
      
      if (result) {
        const action = timeAdjustment > 0 ? 'extended' : 'shortened';
        const drawType = isMonthlyAdjustment ? 'Monthly' : 'Weekly';
        setSuccessMessage(`${drawType} draw time ${Math.abs(timeAdjustment)} seconds ${action}!`);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Draw time adjustment failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleManualDraw = async () => {
    if (!account) return;
    
    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const result = await manualDraw();
      
      if (result && result.success) {
        setSuccessMessage('Draw completed successfully.');
        
        // Reload page after short delay to update contract info
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setErrorMessage('Draw failed. Please try again.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleManualMonthlyDraw = async () => {
    if (!account) return;
    
    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const result = await manualMonthlyDraw();
      
      if (result && result.success) {
        setSuccessMessage('Monthly draw completed successfully.');
        
        // Reload page after short delay to update contract info
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setErrorMessage('Monthly draw failed. Please try again.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdrawProfit = async () => {
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await withdrawProfit();
      
      if (result) {
        setSuccessMessage('Profit withdrawn successfully!');
        
        // Reload contract info
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Profit withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdrawAll = async () => {
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await withdrawAll();
      
      if (result) {
        setSuccessMessage('All balance withdrawn successfully!');
        
        // Reload contract info
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Balance withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // New handler for adding operator
  const handleAddOperator = async () => {
    if (!newOperatorAddress) return;
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await addOperator(newOperatorAddress);
      
      if (result) {
        setSuccessMessage(`Operator ${newOperatorAddress} added successfully!`);
        setNewOperatorAddress('');
        // Reload operator list
        await loadOperators();
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to add operator');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // New handler for removing operator
  const handleRemoveOperator = async () => {
    if (!removeOperatorAddress) return;
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await removeOperator(removeOperatorAddress);
      
      if (result) {
        setSuccessMessage(`Operator ${removeOperatorAddress} removed successfully!`);
        setRemoveOperatorAddress('');
        // Reload operator list
        await loadOperators();
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to remove operator');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // New handler for funding weekly pool
  const handleFundWeeklyPool = async () => {
    if (!weeklyPoolAmount) return;
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await fundWeeklyPool(weeklyPoolAmount);
      
      if (result) {
        setSuccessMessage(`Weekly pool funded with ${weeklyPoolAmount} LYX successfully!`);
        setWeeklyPoolAmount('');
        // Reload contract info
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to fund weekly pool');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // New handler for funding monthly pool
  const handleFundMonthlyPool = async () => {
    if (!monthlyPoolAmount) return;
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await fundMonthlyPool(monthlyPoolAmount);
      
      if (result) {
        setSuccessMessage(`Monthly pool funded with ${monthlyPoolAmount} LYX successfully!`);
        setMonthlyPoolAmount('');
        // Reload contract info
        const info = await getContractInfo();
        if (info) {
          setContractInfo(info);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to fund monthly pool');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // New handler for emergency toggle
  const handleEmergencyToggle = async () => {
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await emergencyToggle(!contractPaused);
      
      if (result) {
        setSuccessMessage(`Contract ${!contractPaused ? 'paused' : 'resumed'} successfully!`);
        setContractPaused(!contractPaused);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to toggle emergency status');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Load operators list
  const loadOperators = async () => {
    // This is a mock implementation since we don't have a direct way to list all operators
    // In a real implementation, you would have a contract function to list all operators
    // For now, we'll just display a message about this limitation
    setOperatorsList([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Panel">
      {!isAdmin ? (
        <div className="p-4 text-center">
          <p className="text-red-500">This panel is only accessible to administrators.</p>
        </div>
      ) : (
        <div>
          {/* Tab navigation */}
          <div className="flex flex-wrap mb-4 border-b">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 ${activeTab === 'settings' ? 'border-b-2 border-[#FF2975] text-[#FF2975]' : 'text-gray-500'}`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-3 ${activeTab === 'actions' ? 'border-b-2 border-[#FF2975] text-[#FF2975]' : 'text-gray-500'}`}
            >
              Actions
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-3 ${activeTab === 'finance' ? 'border-b-2 border-[#FF2975] text-[#FF2975]' : 'text-gray-500'}`}
            >
              Finance
            </button>
            <button
              onClick={() => setActiveTab('operators')}
              className={`px-4 py-3 ${activeTab === 'operators' ? 'border-b-2 border-[#FF2975] text-[#FF2975]' : 'text-gray-500'}`}
            >
              Operators
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-4 py-3 ${activeTab === 'emergency' ? 'border-b-2 border-[#FF2975] text-[#FF2975]' : 'text-gray-500'}`}
            >
              Emergency
            </button>
          </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF2975]"></div>
            </div>
          )}
          
          {!loading && (
            <>
              {/* Settings Tab Content */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contract Settings</h3>
                  
                  {/* Ticket Price */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Ticket Price</h4>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="flex-1 p-2 border rounded"
                          placeholder="New Ticket Price (LYX)"
                          value={newTicketPrice}
                          onChange={(e) => setNewTicketPrice(e.target.value)}
                        />
                        <button 
                          className="bg-[#FF2975] text-white px-3 py-2 rounded disabled:opacity-50"
                          onClick={handleUpdateTicketPrice}
                          disabled={!newTicketPrice || newTicketPrice === '0' || isProcessing}
                        >
                          {isProcessing ? 'Updating...' : 'Update'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Current price: {contractInfo?.ticketPrice || '0'} LYX
                      </p>
                    </div>
                  </div>
                  
                  {/* Fee Percentages */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Fee Percentages</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">Owner Fee (%)</label>
                        <input
                          type="number"
                          value={newOwnerFee}
                          onChange={(e) => setNewOwnerFee(e.target.value)}
                          placeholder="e.g., 5"
                          className="w-full p-2 bg-white border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Monthly Pool Fee (%)</label>
                        <input
                          type="number"
                          value={newMonthlyPoolFee}
                          onChange={(e) => setNewMonthlyPoolFee(e.target.value)}
                          placeholder="e.g., 20"
                          className="w-full p-2 bg-white border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Total percentage (owner + monthly pool) cannot exceed 50%
                        </p>
                      </div>
                      
                      <button
                        onClick={handleUpdateFees}
                        disabled={isProcessing || !newOwnerFee || !newMonthlyPoolFee}
                        className="w-full bg-[#FF2975] text-white py-2 rounded disabled:opacity-50"
                      >
                        {isProcessing ? 'Updating...' : 'Update Fees'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Contract Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Contract Status</h4>
                    
                    {contractInfo ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ticket Price:</span>
                          <span className="font-medium">{contractInfo?.ticketPrice || '-'} LYX</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Owner Fee:</span>
                          <span>{contractInfo.ownerFeePercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Monthly Pool Fee:</span>
                          <span>{contractInfo.monthlyPoolPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Tickets:</span>
                          <span className="font-medium">{contractInfo?.totalTicketCount || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Contract Balance:</span>
                          <div className="flex items-center gap-1">
                            <span>{contractInfo.contractBalance}</span>
                            <Image src="/assets/luksologo.png" alt="LYX" width={14} height={14} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500">
                        Information could not be loaded
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Actions Tab Content */}
              {activeTab === 'actions' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Manual Operations</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Adjust Draw Time</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">Time Adjustment (seconds)</label>
                        <input
                          type="number"
                          value={drawTimeAdjustment}
                          onChange={(e) => setDrawTimeAdjustment(e.target.value)}
                          placeholder="e.g., 3600 (to extend) or -3600 (to shorten)"
                          className="w-full p-2 bg-white border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Positive value extends time, negative value shortens it
                        </p>
                      </div>
                      
                      {/* Preset time buttons */}
                      <div>
                        <label className="block text-sm mb-2">Quick Time Adjustments</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 mb-1">
                            <span className="text-xs text-gray-600 font-medium">Extend time (+)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("1800")}
                            className="p-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                          >
                            +30 min (1800 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("3600")}
                            className="p-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                          >
                            +1 hour (3600 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("7200")}
                            className="p-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                          >
                            +2 hours (7200 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("14400")}
                            className="p-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                          >
                            +4 hours (14400 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("28800")}
                            className="p-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                          >
                            +8 hours (28800 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("43200")}
                            className="p-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                          >
                            +12 hours (43200 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("86400")}
                            className="p-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                          >
                            +24 hours (86400 sec)
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="col-span-2 mb-1">
                            <span className="text-xs text-gray-600 font-medium">Shorten time (-)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("-1800")}
                            className="p-2 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            -30 min (-1800 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("-3600")}
                            className="p-2 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            -1 hour (-3600 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("-7200")}
                            className="p-2 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            -2 hours (-7200 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("-14400")}
                            className="p-2 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            -4 hours (-14400 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("-28800")}
                            className="p-2 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            -8 hours (-28800 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("-43200")}
                            className="p-2 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            -12 hours (-43200 sec)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawTimeAdjustment("-86400")}
                            className="p-2 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            -24 hours (-86400 sec)
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isMonthlyAdjustment"
                          checked={isMonthlyAdjustment}
                          onChange={(e) => setIsMonthlyAdjustment(e.target.checked)}
                          className="mr-2 h-4 w-4"
                        />
                        <label htmlFor="isMonthlyAdjustment" className="text-sm">
                          Apply for monthly draw
                        </label>
                      </div>
                      
                      <button
                        onClick={handleAdjustDrawTime}
                        disabled={isProcessing || !drawTimeAdjustment}
                        className="w-full bg-[#FF2975] text-white py-2 rounded disabled:opacity-50"
                      >
                        {isProcessing ? 'Adjusting...' : 'Adjust Time'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Manual Draw</h4>
                    <div className="space-y-3">
                      <button
                        onClick={handleManualDraw}
                        disabled={isProcessing}
                        className="w-full bg-amber-500 text-white py-2 rounded disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Start Weekly Draw'}
                      </button>
                      
                      <button
                        onClick={handleManualMonthlyDraw}
                        disabled={isProcessing}
                        className="w-full bg-amber-500 text-white py-2 rounded disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Start Monthly Draw'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Finance Tab Content */}
              {activeTab === 'finance' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Financial Operations</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Withdraw Owner Profit</h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span>Current balance: </span>
                        <div className="inline-flex items-center gap-1">
                          <span>{contractInfo?.contractBalance || '0'}</span>
                          <Image src="/assets/luksologo.png" alt="LYX" width={14} height={14} />
                        </div>
                      </div>
                      
                      <button
                        onClick={handleWithdrawProfit}
                        disabled={isProcessing}
                        className="w-full bg-[#FF2975] text-white py-2 rounded disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Withdraw Profit'}
                      </button>
                      
                      <p className="text-xs text-gray-500">
                        This operation only withdraws unpaid owner fees.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Emergency Withdrawal</h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span>Current balance: </span>
                        <div className="inline-flex items-center gap-1">
                          <span>{contractInfo?.contractBalance || '0'}</span>
                          <Image src="/assets/luksologo.png" alt="LYX" width={14} height={14} />
                        </div>
                      </div>
                      
                      <button
                        onClick={handleWithdrawAll}
                        disabled={isProcessing}
                        className="w-full bg-red-500 text-white py-2 rounded disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Withdraw All Balance'}
                      </button>
                      
                      <p className="text-xs text-red-500">
                        CAUTION: This operation withdraws all contract balance and should only be used in emergencies!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Operators Tab Content */}
              {activeTab === 'operators' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Operator Management</h3>
                  
                  <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg mb-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Note:</strong> Operators have limited admin capabilities. They can perform actions like manual draws and time adjustments, but cannot change critical settings or withdraw funds.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Add Operator</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">Operator Address</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newOperatorAddress}
                            onChange={(e) => setNewOperatorAddress(e.target.value)}
                            placeholder="0x... address"
                            className="flex-1 p-2 bg-white border border-gray-300 rounded-md"
                          />
                          <button
                            onClick={handleAddOperator}
                            disabled={isProcessing || !newOperatorAddress}
                            className="bg-[#FF2975] text-white px-3 py-2 rounded disabled:opacity-50"
                          >
                            {isProcessing ? 'Adding...' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Remove Operator</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">Operator Address</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={removeOperatorAddress}
                            onChange={(e) => setRemoveOperatorAddress(e.target.value)}
                            placeholder="0x... address"
                            className="flex-1 p-2 bg-white border border-gray-300 rounded-md"
                          />
                          <button
                            onClick={handleRemoveOperator}
                            disabled={isProcessing || !removeOperatorAddress}
                            className="bg-red-500 text-white px-3 py-2 rounded disabled:opacity-50"
                          >
                            {isProcessing ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Current Operators</h4>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-500">
                        Use the contract's operators() function directly to check if an address is an operator. The contract doesn't provide a way to list all operators.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Emergency Tab Content */}
              {activeTab === 'emergency' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Emergency Controls</h3>
                  
                  <div className={contractPaused ? "bg-red-50 p-4 rounded-lg" : "bg-green-50 p-4 rounded-lg"}>
                    <h4 className="text-md font-medium mb-2">Contract Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Current Status:</span>
                        <span className={contractPaused ? "font-medium text-red-600" : "font-medium text-green-600"}>
                          {contractPaused ? 'PAUSED' : 'ACTIVE'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {contractPaused 
                          ? 'Contract is currently paused. All transactions except admin functions are disabled.' 
                          : 'Contract is currently active. All functions are enabled.'}
                      </p>
                      
                      <button
                        onClick={handleEmergencyToggle}
                        disabled={isProcessing}
                        className={contractPaused 
                          ? "w-full bg-green-500 text-white py-2 rounded disabled:opacity-50" 
                          : "w-full bg-red-500 text-white py-2 rounded disabled:opacity-50"}
                      >
                        {isProcessing 
                          ? 'Processing...' 
                          : contractPaused 
                            ? 'Resume Contract' 
                            : 'Pause Contract'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium mb-2">Pool Funding</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1">Fund Weekly Pool (LYX)</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={weeklyPoolAmount}
                            onChange={(e) => setWeeklyPoolAmount(e.target.value)}
                            placeholder="Amount in LYX"
                            className="flex-1 p-2 bg-white border border-gray-300 rounded-md"
                          />
                          <button
                            onClick={handleFundWeeklyPool}
                            disabled={isProcessing || !weeklyPoolAmount}
                            className="bg-[#FF2975] text-white px-3 py-2 rounded disabled:opacity-50"
                          >
                            {isProcessing ? 'Funding...' : 'Fund'}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Fund Monthly Pool (LYX)</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={monthlyPoolAmount}
                            onChange={(e) => setMonthlyPoolAmount(e.target.value)}
                            placeholder="Amount in LYX"
                            className="flex-1 p-2 bg-white border border-gray-300 rounded-md"
                          />
                          <button
                            onClick={handleFundMonthlyPool}
                            disabled={isProcessing || !monthlyPoolAmount}
                            className="bg-[#FF2975] text-white px-3 py-2 rounded disabled:opacity-50"
                          >
                            {isProcessing ? 'Funding...' : 'Fund'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message displays */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                  {errorMessage}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}; 