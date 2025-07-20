'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { DrawData } from '@/types/create-draw';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import Web3 from 'web3';

interface ReviewAndCreateProps {
  drawData: DrawData;
  onCreate: () => void;
}

export const ReviewAndCreate = ({ drawData, onCreate }: ReviewAndCreateProps) => {
  const { account } = useUPProvider();
  const { createDraw } = useGridottoContract();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async () => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Prepare parameters based on draw type
      const params: any = {
        drawType: drawData.drawType,
        ticketPrice: Web3.utils.toWei(drawData.ticketPrice.toString(), 'ether'),
        duration: drawData.duration * 86400, // Convert days to seconds
        maxTickets: drawData.maxTickets,
        requirement: drawData.requirementType,
        requiredToken: drawData.requiredToken,
        minTokenAmount: drawData.minTokenAmount ? Web3.utils.toWei(drawData.minTokenAmount.toString(), 'ether') : undefined,
        prizeModel: 0, // CREATOR_FUNDED
        totalWinners: drawData.winnerCount || 1
      };

      // Add type-specific parameters
      if (drawData.drawType === 'LYX') {
        params.initialPrize = drawData.prizeAmount ? Web3.utils.toWei(drawData.prizeAmount.toString(), 'ether') : '0';
      } else if (drawData.drawType === 'TOKEN') {
        params.tokenAddress = drawData.tokenAddress;
        params.initialPrize = drawData.prizeAmount ? Web3.utils.toWei(drawData.prizeAmount.toString(), 'ether') : '0';
      } else if (drawData.drawType === 'NFT') {
        params.nftContract = drawData.nftContract;
        params.nftTokenIds = drawData.tokenIds;
      }

      await createDraw(params);
      
      onCreate();
      router.push('/draws');
    } catch (err: any) {
      console.error('Error creating draw:', err);
      setError(err.message || 'Failed to create draw');
    } finally {
      setIsCreating(false);
    }
  };

  const formatRequirement = () => {
    switch (drawData.requirementType) {
      case 0:
        return 'No requirements';
      case 1:
        return `Must hold ${drawData.requiredToken} token`;
      case 2:
        return `Must hold at least ${drawData.minTokenAmount} ${drawData.requiredToken}`;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white/5 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Draw Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Draw Type</p>
            <p className="text-white font-medium">{drawData.drawType} Draw</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Duration</p>
            <p className="text-white font-medium">{drawData.duration} days</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Ticket Price</p>
            <p className="text-white font-medium">{drawData.ticketPrice} LYX</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Max Tickets</p>
            <p className="text-white font-medium">{drawData.maxTickets}</p>
          </div>
          
          {drawData.drawType === 'TOKEN' && (
            <>
              <div>
                <p className="text-sm text-gray-400">Token Address</p>
                <p className="text-white font-mono text-sm">{drawData.tokenAddress}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Prize Amount</p>
                <p className="text-white font-medium">{drawData.prizeAmount} tokens</p>
              </div>
            </>
          )}
          
          {drawData.drawType === 'NFT' && (
            <>
              <div>
                <p className="text-sm text-gray-400">NFT Contract</p>
                <p className="text-white font-mono text-sm">{drawData.nftContract}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Token IDs</p>
                <p className="text-white font-medium">{drawData.tokenIds.join(', ')}</p>
              </div>
            </>
          )}
          
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400">Requirements</p>
            <p className="text-white font-medium">{formatRequirement()}</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ExclamationCircleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-500 font-semibold mb-1">Important</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• The draw will start immediately after creation</li>
              <li>• You cannot modify or cancel the draw once created</li>
              <li>• Make sure all details are correct before proceeding</li>
              {drawData.drawType !== 'LYX' && (
                <li>• Ensure you have approved the required tokens/NFTs</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Creating Draw...
          </>
        ) : (
          <>
            <CheckCircleIcon className="w-5 h-5" />
            Create Draw
          </>
        )}
      </button>
    </div>
  );
};