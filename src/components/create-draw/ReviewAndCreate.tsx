'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { DrawData } from '@/types';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import Web3 from 'web3';
import { CONTRACTS } from '@/config/contracts';

const DIAMOND_ADDRESS = CONTRACTS.LUKSO_TESTNET.DIAMOND;

interface ReviewAndCreateProps {
  drawData: DrawData;
  onCreate: () => void;
}

export function ReviewAndCreate({ drawData, onCreate }: ReviewAndCreateProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createLYXDraw, createLSP7Draw, createLSP8Draw } = useGridottoContract();
  const { account, web3 } = useUPProvider();

  const handleCreate = async () => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    console.log('=== REVIEW AND CREATE - STARTING ===');
    console.log('Draw Data:', drawData);

    try {
      setIsCreating(true);
      setError(null);

      console.log('=== CREATE DRAW - STARTING ===');
      console.log('Draw Data:', drawData);

      // Common parameters
      const ticketPriceWei = Web3.utils.toWei(drawData.ticketPrice.toString(), 'ether');
      const maxTickets = drawData.maxTickets || 0;
      const duration = drawData.duration * 86400; // Convert days to seconds
      const minParticipants = drawData.minParticipants || 0;
      const platformFeePercent = 500; // 5% = 500 basis points

      if (drawData.drawType === 'LYX') {
        // LYX Draw
        const creatorContribution = drawData.prizeAmount && drawData.prizeAmount > 0 
          ? Web3.utils.toWei(drawData.prizeAmount.toString(), 'ether')
          : '0';
        
        console.log('Creating LYX draw with params:', {
          ticketPrice: ticketPriceWei,
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent,
          creatorContribution
        });

        await createLYXDraw(
          ticketPriceWei,
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent,
          creatorContribution
        );
      } else if (drawData.drawType === 'TOKEN') {
        // Token Draw
        if (!drawData.prizeAsset || !drawData.prizeAmount) {
          throw new Error('Token address and amount are required');
        }

        const tokenAmountWei = Web3.utils.toWei(drawData.prizeAmount.toString(), 'ether');

        console.log('Creating TOKEN draw with params:', {
          ticketPrice: ticketPriceWei,
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent,
          tokenAddress: drawData.prizeAsset,
          tokenAmount: tokenAmountWei
        });

        await createLSP7Draw(
          drawData.prizeAsset,  // tokenAddress first
          ticketPriceWei,
          maxTickets,
          duration,
          minParticipants,
          platformFeePercent,
          tokenAmountWei
        );
      } else if (drawData.drawType === 'NFT') {
        // NFT Draw
        if (!drawData.prizeAsset || !drawData.tokenIds || drawData.tokenIds.length === 0) {
          throw new Error('NFT contract and token IDs are required');
        }

        // First, approve NFTs to the diamond contract
        console.log('Checking NFT approvals...');
        
        if (account && web3) { // Ensure account and web3 are available
          console.log('Checking NFT ownership and approvals for:', {
            nftContract: drawData.prizeAsset,
            tokenIds: drawData.tokenIds,
            account
          });

          const nftContract = new web3.eth.Contract([
            {
              "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
              "name": "approve",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [{"internalType": "address", "name": "operator", "type": "address"}, {"internalType": "bool", "name": "approved", "type": "bool"}],
              "name": "setApprovalForAll", 
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "operator", "type": "address"}],
              "name": "isApprovedForAll",
              "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
              "name": "ownerOf",
              "outputs": [{"internalType": "address", "name": "", "type": "address"}],
              "stateMutability": "view",
              "type": "function"
            }
          ], drawData.prizeAsset);

          // Check ownership of all tokens first
          console.log('Checking NFT ownership...');
          for (const tokenId of drawData.tokenIds) {
            try {
              const owner = await nftContract.methods.ownerOf(tokenId).call();
              console.log(`Token ${tokenId} owner:`, owner);
              
              const ownerStr = String(owner);
              const accountStr = String(account);
              
              if (ownerStr && accountStr && ownerStr.toLowerCase() !== accountStr.toLowerCase()) {
                throw new Error(`You don't own NFT token ${tokenId}. Current owner: ${ownerStr}`);
              }
              
              if (!owner) {
                throw new Error(`Token ${tokenId} has no owner or does not exist`);
              }
            } catch (error: any) {
              console.error(`Error checking ownership of token ${tokenId}:`, error);
              throw new Error(`Failed to verify ownership of token ${tokenId}: ${error.message}`);
            }
          }
          console.log('✅ All tokens are owned by the user');

          // Check if already approved for all
          const isApprovedForAll = await nftContract.methods.isApprovedForAll(account, DIAMOND_ADDRESS).call();
          
          if (!isApprovedForAll) {
            console.log('Setting approval for all NFTs...');
            try {
              await nftContract.methods.setApprovalForAll(DIAMOND_ADDRESS, true).send({ from: account });
              console.log('✅ NFT approval successful');
            } catch (error: any) {
              console.error('NFT approval failed:', error);
              throw new Error(`Failed to approve NFTs: ${error.message}`);
            }
          } else {
            console.log('✅ NFTs already approved');
          }
        }

        console.log('Creating NFT draw with params:', {
          nftContract: drawData.prizeAsset,
          tokenIds: drawData.tokenIds,
          ticketPrice: ticketPriceWei,
          duration,
          maxTickets,
          requirement: drawData.requirementType,
          requiredToken: drawData.requiredToken || '0x0000000000000000000000000000000000000000',
          minTokenAmount: drawData.minTokenAmount || 0
        });

        await createLSP8Draw(
          drawData.prizeAsset,  // nftContract
          drawData.tokenIds,    // tokenIds
          ticketPriceWei,       // ticketPrice
          duration,             // duration
          maxTickets,           // maxTickets
          drawData.requirementType, // requirement
          drawData.requiredToken || '0x0000000000000000000000000000000000000000', // requiredToken
          drawData.minTokenAmount || 0 // minTokenAmount
        );
      }
      
      onCreate();
      router.push('/draws');
    } catch (err: any) {
      console.error('Error creating draw:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        data: err.data
      });
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
            <p className="text-white font-medium">
              {drawData.ticketPrice === 0 ? 'Free' : `${drawData.ticketPrice} LYX`}
            </p>
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
                <p className="text-white font-medium">{drawData.tokenIds?.join(', ') || 'None'}</p>
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