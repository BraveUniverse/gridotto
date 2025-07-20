'use client';

import { useState, useEffect } from 'react';
import { useLSP5ReceivedAssets } from '@/hooks/useLSP5ReceivedAssets';
import { useLSP4DigitalAsset } from '@/hooks/useLSP4DigitalAsset';
import Image from 'next/image';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { PhotoIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface AssetSelectorProps {
  profileAddress: string | null;
  onSelectAsset: (asset: any) => void;
  selectedAsset?: string;
  assetType?: 'LSP7' | 'LSP8' | 'all';
}

interface AssetCardProps {
  asset: any;
  isSelected: boolean;
  onSelect: () => void;
}

const AssetCard = ({ asset, isSelected, onSelect }: AssetCardProps) => {
  const { metadata, loading } = useLSP4DigitalAsset(asset.address);
  
  const displayImage = metadata?.icon?.[0]?.url || metadata?.images?.[0]?.url;
  
  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected 
          ? 'border-primary bg-primary/10' 
          : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
      }`}
    >
      {isSelected && (
        <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-primary" />
      )}
      
      <div className="flex flex-col items-center gap-3">
        {/* Asset Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={metadata?.name || asset.name || 'Asset'}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {asset.tokenType === 'LSP7' ? (
                <CurrencyDollarIcon className="w-10 h-10 text-white" />
              ) : (
                <PhotoIcon className="w-10 h-10 text-white" />
              )}
            </div>
          )}
        </div>
        
        {/* Asset Info */}
        <div className="text-center">
          <h4 className="font-medium text-white">
            {metadata?.name || asset.name || 'Unknown Asset'}
          </h4>
          <p className="text-xs text-gray-400">
            {metadata?.symbol || asset.symbol || asset.tokenType || 'Token'}
          </p>
          {asset.balance && (
            <p className="text-xs text-primary mt-1">
              Balance: {asset.balance}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const AssetSelector = ({ 
  profileAddress, 
  onSelectAsset, 
  selectedAsset,
  assetType = 'all'
}: AssetSelectorProps) => {
  const { assets, loading, error } = useLSP5ReceivedAssets(profileAddress);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);

  useEffect(() => {
    if (assetType === 'all') {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(assets.filter(asset => asset.tokenType === assetType));
    }
  }, [assets, assetType]);

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-400">Loading your assets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8">
        <div className="text-center">
          <PhotoIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Unable to load assets</p>
          <p className="text-sm text-gray-400 mt-2">Please make sure you're connected with a Universal Profile</p>
        </div>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="glass-card p-8">
        <div className="text-center">
          <PhotoIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            {assetType === 'LSP7' 
              ? 'No tokens found in your profile' 
              : assetType === 'LSP8'
              ? 'No NFTs found in your profile'
              : 'No assets found in your profile'}
          </p>
          <p className="text-sm text-gray-500">
            Make sure you have {assetType === 'LSP7' ? 'LSP7 tokens' : assetType === 'LSP8' ? 'LSP8 NFTs' : 'digital assets'} in your Universal Profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Select Prize Asset</h3>
        <span className="text-sm text-gray-400">
          {filteredAssets.length} {assetType === 'all' ? 'assets' : assetType === 'LSP7' ? 'tokens' : 'NFTs'} found
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.address}
            asset={asset}
            isSelected={selectedAsset === asset.address}
            onSelect={() => onSelectAsset(asset)}
          />
        ))}
      </div>
    </div>
  );
};