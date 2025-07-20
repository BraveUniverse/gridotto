'use client';

import { useState } from 'react';
import { DrawData } from '@/types';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import AssetSelector from './AssetSelector';
import { useUPProvider } from '@/hooks/useUPProvider';
import Image from 'next/image';

interface PrizeConfigurationProps {
  drawData: DrawData;
  updateDrawData: (data: Partial<DrawData>) => void;
}

export const PrizeConfiguration = ({ drawData, updateDrawData }: PrizeConfigurationProps) => {
  const { account } = useUPProvider();
  const [nftTokenIdInput, setNftTokenIdInput] = useState('');

  const handleAddNFTTokenId = () => {
    if (nftTokenIdInput.trim()) {
      const currentIds = drawData.tokenIds || [];
      updateDrawData({ 
        tokenIds: [...currentIds, nftTokenIdInput.trim()] 
      });
      setNftTokenIdInput('');
    }
  };

  const handleRemoveNFTTokenId = (index: number) => {
    const currentIds = drawData.tokenIds || [];
    updateDrawData({ 
      tokenIds: currentIds.filter((_, i) => i !== index) 
    });
  };

  const handleSelectAsset = (asset: any) => {
    updateDrawData({ 
      prizeAsset: asset.address,
      selectedAsset: asset,
      tokenAddress: asset.address, // For backward compatibility
      nftContract: asset.address   // For backward compatibility
    });
  };

  return (
    <div className="space-y-6">
      {/* LYX Prize Configuration */}
      {drawData.drawType === 'LYX' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initial Prize Pool (LYX)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={drawData.prizeAmount || ''}
                onChange={(e) => updateDrawData({ prizeAmount: parseFloat(e.target.value) || 0 })}
                className="input-glass w-full pr-16"
                placeholder="Enter initial prize amount"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                LYX
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              The prize pool will grow as participants buy tickets
            </p>
          </div>
        </div>
      )}

      {/* Token Prize Configuration */}
      {drawData.drawType === 'TOKEN' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Token Prize
            </label>
            
            {/* Show selected asset if any */}
            {drawData.selectedAsset && (
              <div className="glass-card p-4 mb-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                  {drawData.selectedAsset.metadata?.icon?.[0]?.url ? (
                    <Image
                      src={drawData.selectedAsset.metadata.icon[0].url}
                      alt={drawData.selectedAsset.name || 'Token'}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : drawData.selectedAsset.metadata?.images?.[0]?.url ? (
                    <Image
                      src={drawData.selectedAsset.metadata.images[0].url}
                      alt={drawData.selectedAsset.name || 'Token'}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {drawData.selectedAsset.symbol?.charAt(0) || drawData.selectedAsset.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{drawData.selectedAsset.name || 'Unknown Token'}</h4>
                  <p className="text-sm text-gray-400">{drawData.selectedAsset.symbol || 'TOKEN'}</p>
                  <p className="text-xs text-gray-500 font-mono">{drawData.selectedAsset.address}</p>
                </div>
                <button
                  onClick={() => updateDrawData({ prizeAsset: '', selectedAsset: undefined })}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Change
                </button>
              </div>
            )}

            {/* Asset Selector */}
            {!drawData.selectedAsset && (
              <AssetSelector
                address={account}
                onSelect={(asset) => {
                  updateDrawData({ 
                    prizeAsset: asset?.address || '',
                    selectedAsset: asset || undefined
                  });
                }}
                selectedAsset={drawData.selectedAsset}
                assetType="LSP7"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prize Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={drawData.prizeAmount || ''}
                onChange={(e) => updateDrawData({ prizeAmount: parseFloat(e.target.value) || 0 })}
                className="input-glass w-full pr-16"
                placeholder="Enter prize amount"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {drawData.selectedAsset?.symbol || 'TOKEN'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NFT Prize Configuration */}
      {drawData.drawType === 'NFT' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select NFT Prize
            </label>
            
            {/* Show selected asset if any */}
            {drawData.selectedAsset && (
              <div className="glass-card p-4 mb-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                  {drawData.selectedAsset.metadata?.images?.[0]?.url ? (
                    <Image
                      src={drawData.selectedAsset.metadata.images[0].url}
                      alt={drawData.selectedAsset.name || 'NFT'}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : drawData.selectedAsset.metadata?.icon?.[0]?.url ? (
                    <Image
                      src={drawData.selectedAsset.metadata.icon[0].url}
                      alt={drawData.selectedAsset.name || 'NFT'}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {drawData.selectedAsset.symbol?.charAt(0) || drawData.selectedAsset.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{drawData.selectedAsset.name || 'Unknown NFT'}</h4>
                  <p className="text-sm text-gray-400">{drawData.selectedAsset.symbol || 'NFT'}</p>
                  <p className="text-xs text-gray-500 font-mono">{drawData.selectedAsset.address}</p>
                </div>
                <button
                  onClick={() => updateDrawData({ prizeAsset: '', selectedAsset: undefined })}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Change
                </button>
              </div>
            )}

            {/* Asset Selector */}
            {!drawData.selectedAsset && (
              <AssetSelector
                address={account}
                onSelect={(asset) => {
                  updateDrawData({ 
                    prizeAsset: asset?.address || '',
                    selectedAsset: asset || undefined
                  });
                }}
                selectedAsset={drawData.selectedAsset}
                assetType="LSP8"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              NFT Token IDs
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={nftTokenIdInput}
                  onChange={(e) => setNftTokenIdInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNFTTokenId()}
                  className="input-glass flex-1"
                  placeholder="Enter token ID"
                />
                <button
                  onClick={handleAddNFTTokenId}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>

              {/* Token ID List */}
              {drawData.tokenIds && drawData.tokenIds.length > 0 && (
                <div className="glass-card p-4 space-y-2">
                  {drawData.tokenIds.map((tokenId, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-gray-300">Token ID: {tokenId}</span>
                      <button
                        onClick={() => handleRemoveNFTTokenId(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 mt-2">
                    {drawData.tokenIds.length} NFT{drawData.tokenIds.length > 1 ? 's' : ''} will be given away
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="glass-card p-4 border border-blue-500/30">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Important Information</h4>
            <p className="text-xs text-gray-400">
              {drawData.drawType === 'LYX' && 'The initial prize pool will be funded from your wallet when creating the draw. Make sure you have sufficient LYX balance.'}
              {drawData.drawType === 'TOKEN' && 'You must approve the token transfer before creating the draw. The tokens will be transferred from your wallet to the contract.'}
              {drawData.drawType === 'NFT' && 'You must own the NFTs and approve the transfer before creating the draw. Each NFT will be given to a different winner.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};