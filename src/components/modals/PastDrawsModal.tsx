import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import Image from 'next/image';
import { ProfileItem } from '../ProfileItem';

interface PastDrawsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawResult {
  drawNumber: number;
  winner: string;
  prizeAmount: string;
  isMonthly: boolean;
  isWinner: boolean;
}

export const PastDrawsModal = ({ isOpen, onClose }: PastDrawsModalProps) => {
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weeklyResults, setWeeklyResults] = useState<DrawResult[]>([]);
  const [monthlyResults, setMonthlyResults] = useState<DrawResult[]>([]);
  const [currentDraw, setCurrentDraw] = useState<number>(0);
  const [currentMonthlyDraw, setCurrentMonthlyDraw] = useState<number>(0);
  const [fadeIn, setFadeIn] = useState(false);

  const { 
    getCurrentDrawInfo, 
    getMonthlyDrawInfo, 
    getDrawResults, 
    getMonthlyDrawResults 
  } = useGridottoContract();
  const { account } = useUPProvider();

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setFadeIn(true), 100);
    } else {
      setFadeIn(false);
    }
  }, [isOpen]);

  // Load draw data
  useEffect(() => {
    const loadDrawData = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get current draw numbers
        const weeklyInfo = await getCurrentDrawInfo();
        const monthlyInfo = await getMonthlyDrawInfo();
        
        if (weeklyInfo) {
          setCurrentDraw(Number(weeklyInfo.drawNumber));
        }
        
        if (monthlyInfo) {
          setCurrentMonthlyDraw(Number(monthlyInfo.drawNumber));
        }
        
        // Load past draw results
        const weeklyResultsTemp: DrawResult[] = [];
        const monthlyResultsTemp: DrawResult[] = [];
        
        // Load weekly results (last 10)
        const weeklyStartDraw = Math.max(1, Number(weeklyInfo?.drawNumber || 1) - 10);
        for (let i = Number(weeklyInfo?.drawNumber || 1) - 1; i >= weeklyStartDraw; i--) {
          try {
            const result = await getDrawResults(i);
            if (result && result.winner) {
              weeklyResultsTemp.push({
                drawNumber: i,
                winner: result.winner,
                prizeAmount: result.prizeAmount,
                isMonthly: false,
                isWinner: account?.toLowerCase() === result.winner.toLowerCase()
              });
            }
          } catch (err) {
            // Hata sessizce ele alınıyor
          }
        }
        
        // Load monthly results (last 10)
        const monthlyStartDraw = Math.max(1, Number(monthlyInfo?.drawNumber || 1) - 10);
        for (let i = Number(monthlyInfo?.drawNumber || 1) - 1; i >= monthlyStartDraw; i--) {
          try {
            const result = await getMonthlyDrawResults(i);
            if (result && result.winner) {
              monthlyResultsTemp.push({
                drawNumber: i,
                winner: result.winner,
                prizeAmount: result.prizeAmount,
                isMonthly: true,
                isWinner: account?.toLowerCase() === result.winner.toLowerCase()
              });
            }
          } catch (err) {
            // Hata sessizce ele alınıyor
          }
        }
        
        setWeeklyResults(weeklyResultsTemp);
        setMonthlyResults(monthlyResultsTemp);
        
      } catch (err: any) {
        setError(err.message || 'Failed to load past draw results');
      } finally {
        setLoading(false);
      }
    };
    
    loadDrawData();
  }, [isOpen, getCurrentDrawInfo, getMonthlyDrawInfo, getDrawResults, getMonthlyDrawResults, account]);

  // Format address for display
  const formatAddress = (address: string) => {
    if (account?.toLowerCase() === address.toLowerCase()) {
      return `${address.slice(0, 6)}...${address.slice(-4)} (You)`;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format prize for display 
  const formatPrize = (value: string) => {
    try {
      // Değer zaten küçük bir sayı ise (örn: "0.123"), direkt kullan
      if (value.includes('.')) {
        return parseFloat(value).toFixed(3);
      }
      
      // Değer wei olarak geliyorsa, manuel olarak dönüştür (basit 10^18 bölme işlemi)
      if (value.length > 10) {
        const valueAsNumber = parseFloat(value);
        const etherValue = valueAsNumber / 1e18;
        return etherValue.toFixed(3);
      }
      
      // Bunların hiçbiri değilse, direkt değeri kullan
      return parseFloat(value).toFixed(3);
    } catch (e) {
      // Hata durumunda orijinal değeri döndür
      return value;
    }
  };

  // Render tab content
  const renderTabContent = (results: DrawResult[], currentDrawNumber: number, drawType: string) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF2975]"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-red-400 bg-red-400/10 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      );
    }
    
    return (
      <div>
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{drawType} Draw Results</h3>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800 font-medium">
              Current: #{currentDrawNumber}
            </div>
          </div>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400">No past {drawType.toLowerCase()} draw results available</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Draw #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Winner</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Prize</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr 
                    key={`${drawType.toLowerCase()}-${result.drawNumber}`} 
                    className={`
                      ${result.isWinner ? 'bg-pink-50' : 'hover:bg-gray-50'}
                      transition-colors duration-150 ease-in-out
                    `}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        #{result.drawNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <a 
                          href={`https://universaleverything.io/${result.winner}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group flex items-center hover:opacity-90 transition-opacity duration-150"
                        >
                          <ProfileItem 
                            address={result.winner}
                            size="sm"
                            showAddress={true}
                            isHighlighted={result.isWinner}
                            className="group-hover:opacity-90"
                          />
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-3 w-3 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        {result.isWinner && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                        <Image src="/assets/luksologo.png" alt="LYX" width={14} height={14} className="mr-1" />
                        {formatPrize(result.prizeAmount)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Past Draws">
      <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 text-sm font-medium ${tab === 'weekly' ? 'border-b-2 border-[#FF2975] text-[#FF2975]' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-150 ease-in-out`}
            onClick={() => setTab('weekly')}
          >
            Weekly Draws
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${tab === 'monthly' ? 'border-b-2 border-[#FF2975] text-[#FF2975]' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-150 ease-in-out`}
            onClick={() => setTab('monthly')}
          >
            Monthly Draws
          </button>
        </div>

        {/* Content */}
        <div>
          {tab === 'weekly' 
            ? renderTabContent(weeklyResults, currentDraw, 'Weekly')
            : renderTabContent(monthlyResults, currentMonthlyDraw, 'Monthly')
          }
        </div>
      </div>
    </Modal>
  );
}; 