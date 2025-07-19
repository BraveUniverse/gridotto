'use client';

import { useState } from 'react';
import { DrawData } from '@/app/create-draw/page';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface ReviewAndCreateProps {
  drawData: DrawData;
  onCreate: () => void;
}

export const ReviewAndCreate = ({ drawData, onCreate }: ReviewAndCreateProps) => {
  const { account } = useUPProvider();
  const { createTokenDraw, createNFTDraw } = useGridottoContract();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Determine requirement type
      let requirement = 0; // NONE
      if (drawData.requireVIP) requirement = 1; // VIP_REQUIRED
      else if (drawData.requireFollowing) requirement = 2; // FOLLOWING_REQUIRED
      else if (drawData.requireToken) requirement = 3; // TOKEN_REQUIRED

      if (drawData.type === 'TOKEN' && drawData.tokenAddress) {
        await createTokenDraw({
          tokenAddress: drawData.tokenAddress,
          prizeAmount: drawData.prizeAmount?.toString() || '0',
          ticketPrice: drawData.ticketPrice.toString(),
          duration: drawData.duration,
          maxTickets: drawData.maxTickets,
          requirement,
          requiredToken: drawData.requiredToken,
          minTokenAmount: drawData.minTokenAmount?.toString()
        });
      } else if (drawData.type === 'NFT' && drawData.nftContract && drawData.nftTokenIds) {
        await createNFTDraw({
          nftContract: drawData.nftContract,
          tokenIds: drawData.nftTokenIds,
          ticketPrice: drawData.ticketPrice.toString(),
          duration: drawData.duration,
          maxTickets: drawData.maxTickets,
          requirement,
          requiredToken: drawData.requiredToken,
          minTokenAmount: drawData.minTokenAmount?.toString()
        });
      } else if (drawData.type === 'LYX') {
        // For LYX draws, we'll use Phase4 advanced draw creation
        // This is a placeholder - implement when Phase4 ABI is ready
        setError('LYX draw creation coming soon');
        return;
      }

      // Success - call parent onCreate
      onCreate();
    } catch (err: any) {
      console.error('Error creating draw:', err);
      setError(err.message || 'Failed to create draw');
    } finally {
      setIsCreating(false);
    }
  };

  const getRequirementSummary = () => {
    const requirements = [];
    if (drawData.requireVIP) {
      requirements.push(`VIP Pass Tier ${drawData.vipTier || 1}+`);
    }
    if (drawData.requireFollowing) {
      requirements.push(`Must follow creator${drawData.minFollowers ? ` (${drawData.minFollowers}+ followers)` : ''}`);
    }
    if (drawData.requireToken) {
      requirements.push(`Hold ${drawData.minTokenAmount || 0} tokens`);
    }
    return requirements.length > 0 ? requirements : ['None'];
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Draw Type */}
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Draw Type</h4>
          <p className="text-lg font-semibold text-white">{drawData.type} Draw</p>
        </div>

        {/* Prize */}
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Prize</h4>
          <p className="text-lg font-semibold text-white">
            {drawData.type === 'LYX' && `${drawData.prizeAmount || 0} LYX`}
            {drawData.type === 'TOKEN' && `${drawData.prizeAmount || 0} ${drawData.tokenSymbol || 'Tokens'}`}
            {drawData.type === 'NFT' && `${drawData.nftTokenIds?.length || 0} NFTs`}
          </p>
        </div>

        {/* Ticket Price */}
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Ticket Price</h4>
          <p className="text-lg font-semibold text-white">{drawData.ticketPrice} LYX</p>
        </div>

        {/* Duration */}
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Duration</h4>
          <p className="text-lg font-semibold text-white">{drawData.duration} Days</p>
        </div>

        {/* Max Tickets */}
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Max Tickets</h4>
          <p className="text-lg font-semibold text-white">{drawData.maxTickets.toLocaleString()}</p>
        </div>

        {/* Winners */}
        <div className="glass-card p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Winners</h4>
          <p className="text-lg font-semibold text-white">
            {drawData.isMultiWinner ? `${drawData.winnerCount} Winners` : 'Single Winner'}
          </p>
        </div>
      </div>

      {/* Requirements Summary */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Participation Requirements</h3>
        <ul className="space-y-2">
          {getRequirementSummary().map((req, index) => (
            <li key={index} className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prize Distribution (if multi-winner) */}
      {drawData.isMultiWinner && drawData.tiers && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Prize Distribution</h3>
          <div className="space-y-2">
            {drawData.tiers.map((tier, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Position {tier.position}</span>
                <span className="text-white font-medium">{tier.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Cost */}
      <div className="glass-card p-6 border border-yellow-500/30">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Estimated Costs</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              {drawData.type === 'LYX' && (
                <li>• Initial prize pool: {drawData.prizeAmount || 0} LYX</li>
              )}
              <li>• Gas fees for creation: ~0.5 LYX</li>
              <li>• Platform fee: 2% of ticket sales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 border border-red-500/30">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          By creating this draw, you agree to the platform terms and conditions.
        </p>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            isCreating
              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {isCreating ? (
            <>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create Draw</span>
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};