'use client';

import { useState, useEffect } from 'react';
import { useEthers } from '@/contexts/EthersContext';
import { useLSP5ReceivedAssets } from '@/hooks/useLSP5ReceivedAssets';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { 
  CurrencyDollarIcon, 
  PhotoIcon,
  CheckCircleIcon,
  SparklesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { ethers } from 'ethers';

interface Asset {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  tokenType: 'LSP7' | 'LSP8' | 'Unknown';
  image?: string;
}

interface AssetSelectorProps {
  selectedAsset: string | null;
  onSelectAsset: (asset: Asset) => void;
  assetType?: 'LSP7' | 'LSP8' | 'all';
  className?: string;
}

export const AssetSelector = ({ 
  selectedAsset, 
  onSelectAsset, 
  assetType = 'all',
  className = '' 
}: AssetSelectorProps) => {
  const { account, provider } = useEthers();
  const { assets: lsp5Assets, loading: lsp5Loading, error: lsp5Error } = useLSP5ReceivedAssets(account || '');
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState<Asset | null>(null);

  useEffect(() => {
    if (lsp5Assets) {
      // Convert ReceivedAsset to Asset format
      const converted: Asset[] = lsp5Assets.map(asset => ({
        address: asset.address,
        name: asset.name || 'Unknown Asset',
        symbol: asset.symbol || 'UNKNOWN',
        balance: asset.balance || '0',
        decimals: asset.decimals || 18,
        tokenType: asset.tokenType as 'LSP7' | 'LSP8' | 'Unknown',
        image: asset.metadata?.LSP4Metadata?.images?.[0]?.[0]?.url || asset.metadata?.LSP4Metadata?.icon?.[0]?.url
      }));
      
      // Filter assets based on type
      const filtered = assetType === 'all' 
        ? converted 
        : converted.filter(asset => asset.tokenType === assetType);
      
      setFilteredAssets(filtered);
      
      // Update selected asset details
      if (selectedAsset) {
        const selected = filtered.find(a => a.address === selectedAsset);
        setSelectedAssetDetails(selected || null);
      }
    }
  }, [lsp5Assets, assetType, selectedAsset]);

  const formatBalance = (balance: string, decimals: number) => {
    try {
      return ethers.formatUnits(balance, decimals);
    } catch {
      return '0';
    }
  };

  if (lsp5Loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <SparklesIcon className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading assets...</span>
      </div>
    );
  }

  if (lsp5Error) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="w-5 h-5" />
          <span>Error loading assets: {lsp5Error}</span>
        </div>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <PhotoIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">
          No {assetType === 'all' ? 'assets' : assetType + ' tokens'} found in your wallet
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Make sure you have {assetType === 'LSP7' ? 'tokens' : assetType === 'LSP8' ? 'NFTs' : 'assets'} in your LUKSO wallet
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {selectedAssetDetails ? (
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Selected Asset</h3>
          <div className="flex items-center gap-4">
            {selectedAssetDetails.image ? (
              <img 
                src={selectedAssetDetails.image} 
                alt={selectedAssetDetails.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-white">{selectedAssetDetails.name}</p>
              <p className="text-sm text-gray-400">
                Balance: {formatBalance(selectedAssetDetails.balance, selectedAssetDetails.decimals)} {selectedAssetDetails.symbol}
              </p>
            </div>
            <button
              onClick={() => onSelectAsset({ ...selectedAssetDetails, address: '', balance: '0' })}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-medium text-white mb-4">
            Select {assetType === 'LSP7' ? 'Token' : assetType === 'LSP8' ? 'NFT' : 'Asset'}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAssets.map((asset) => (
              <button
                key={asset.address}
                onClick={() => onSelectAsset(asset)}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  selectedAsset === asset.address
                    ? 'bg-primary/20 border-primary'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  {asset.image ? (
                    <img 
                      src={asset.image} 
                      alt={asset.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{asset.name}</p>
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                        {asset.tokenType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {asset.symbol} • Balance: {formatBalance(asset.balance, asset.decimals)}
                    </p>
                  </div>
                  
                  {selectedAsset === asset.address && (
                    <CheckCircleIcon className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};