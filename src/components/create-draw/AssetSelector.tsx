'use client';

import { useState, useEffect } from 'react';
import { useLSP5ReceivedAssets } from '@/hooks/useLSP5ReceivedAssets';
import { ReceivedAsset } from '@/hooks/useLSP5ReceivedAssets';
import Web3 from 'web3';

interface AssetSelectorProps {
  address: string | null;
  onSelect: (asset: ReceivedAsset | null) => void;
  selectedAsset?: ReceivedAsset | null;
  assetType?: 'all' | 'LSP7' | 'LSP8';
}

export default function AssetSelector({ 
  address, 
  onSelect, 
  selectedAsset,
  assetType = 'all'
}: AssetSelectorProps) {
  const { assets, loading, error } = useLSP5ReceivedAssets(address);
  const [filteredAssets, setFilteredAssets] = useState<ReceivedAsset[]>([]);

  useEffect(() => {
    if (assets) {
      let filtered = assets;
      
      // Filter by asset type if specified
      if (assetType !== 'all') {
        filtered = assets.filter(asset => asset.tokenType === assetType);
      }
      
      setFilteredAssets(filtered);
    }
  }, [assets, assetType]);

  const formatBalance = (balance: string | undefined, decimals: number | undefined) => {
    if (!balance || balance === '0') return '0';
    try {
      const dec = decimals || 18;
      const web3 = new Web3();
      // Convert balance to decimal format
      const balanceNum = parseFloat(balance);
      const divisor = Math.pow(10, dec);
      const formatted = (balanceNum / divisor).toFixed(4);
      // Remove trailing zeros
      return formatted.replace(/\.?0+$/, '');
    } catch {
      return balance || '0';
    }
  };

  const getAssetImage = (asset: ReceivedAsset) => {
    if (asset.metadata?.icon?.[0]?.url) {
      return asset.metadata.icon[0].url;
    }
    if (asset.metadata?.images?.[0]?.url) {
      return asset.metadata.images[0].url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading assets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="text-center text-red-500">
          <p className="font-semibold">Error loading assets</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="text-center text-muted-foreground">
          <p className="font-semibold">
            {assetType === 'LSP7' ? 'No tokens found' : 
             assetType === 'LSP8' ? 'No NFTs found' : 
             'No assets found'} in your profile
          </p>
          <p className="text-sm mt-2">
            Make sure you have {assetType === 'all' ? 'LSP7 tokens or LSP8 NFTs' : assetType} in your Universal Profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-4">
          Select {assetType === 'LSP7' ? 'Token' : 
                  assetType === 'LSP8' ? 'NFT' : 
                  'Asset'} for Prize
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssets.map((asset) => {
            const isSelected = selectedAsset?.address === asset.address;
            const image = getAssetImage(asset);
            
            return (
              <div
                key={asset.address}
                onClick={() => onSelect(isSelected ? null : asset)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }
                `}
              >
                <div className="flex items-start space-x-4">
                  {/* Asset Image */}
                  <div className="flex-shrink-0">
                    {image ? (
                      <img 
                        src={image} 
                        alt={asset.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ${image ? 'hidden' : ''}`}>
                      <span className="text-2xl font-bold text-primary">
                        {asset.symbol?.charAt(0) || asset.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Asset Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{asset.name}</h4>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: <span className="font-mono">{asset.tokenType}</span>
                    </p>
                    {asset.tokenType === 'LSP7' && asset.balance && (
                      <p className="text-sm mt-2">
                        Balance: <span className="font-mono">
                          {formatBalance(asset.balance, asset.decimals)}
                        </span>
                      </p>
                    )}
                    {asset.tokenType === 'LSP8' && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        NFT Collection
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected Asset Preview */}
      {selectedAsset && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Selected Prize:</h4>
          <div className="flex items-center space-x-3">
            {getAssetImage(selectedAsset) ? (
              <img 
                src={getAssetImage(selectedAsset)!} 
                alt={selectedAsset.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {selectedAsset.symbol?.charAt(0) || selectedAsset.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold">{selectedAsset.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedAsset.symbol} • {selectedAsset.tokenType}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}