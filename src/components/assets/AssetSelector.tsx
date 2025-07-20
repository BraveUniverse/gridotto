'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUPProvider } from '@/hooks/useUPProvider';
import { CheckIcon } from '@heroicons/react/24/solid';

interface LSP4Metadata {
  name?: string;
  symbol?: string;
  description?: string;
  icon?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  images?: Array<Array<{
    url: string;
    width: number;
    height: number;
    verification?: {
      method: string;
      data: string;
    };
  }>>;
  assets?: Array<{
    url: string;
    fileType: string;
  }>;
}

interface Asset {
  address: string;
  interfaceId: string; // LSP7 or LSP8
  metadata?: LSP4Metadata;
  balance?: string;
  tokenIds?: string[];
}

interface AssetSelectorProps {
  onSelect: (asset: Asset) => void;
  selectedAsset?: Asset | null;
  assetType?: 'all' | 'LSP7' | 'LSP8';
  className?: string;
}

export const AssetSelector = ({ 
  onSelect, 
  selectedAsset,
  assetType = 'all',
  className = '' 
}: AssetSelectorProps) => {
  const { web3, account } = useUPProvider();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!web3 || !account) return;

      try {
        setLoading(true);
        setError(null);

        // Import ERC725 dynamically
        const { ERC725 } = await import('@erc725/erc725.js');
        
        // LSP5 ReceivedAssets Schema
        const LSP5Schema = [
          {
            name: 'LSP5ReceivedAssets[]',
            key: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
            keyType: 'Array',
            valueType: 'address',
            valueContent: 'Address'
          },
          {
            name: 'LSP5ReceivedAssetsMap:<address>',
            key: '0x812c4334633eb816c80d0000<address>',
            keyType: 'Mapping',
            valueType: '(bytes4,bytes8)',
            valueContent: '(Bytes4,Number)'
          }
        ];

        const erc725 = new ERC725(LSP5Schema, account, web3.currentProvider);
        const receivedAssets = await erc725.fetchData('LSP5ReceivedAssets[]');

        if (!receivedAssets?.value || !Array.isArray(receivedAssets.value)) {
          setAssets([]);
          return;
        }

        // Fetch metadata for each asset
        const assetPromises = receivedAssets.value.map(async (assetAddress: string) => {
          try {
            // Get asset interface and metadata
            const assetInfo = await erc725.fetchData({
              keyName: 'LSP5ReceivedAssetsMap:<address>',
              dynamicKeyParts: assetAddress
            });

            let interfaceId = 'LSP7'; // Default
            if (assetInfo?.value) {
              const [iface] = assetInfo.value as [string, string];
              interfaceId = iface === '0xb3c4928f' ? 'LSP8' : 'LSP7';
            }

            // Skip if filtering by type
            if (assetType !== 'all' && assetType !== interfaceId) {
              return null;
            }

            // Fetch LSP4 metadata
            const LSP4Schema = [
              {
                name: 'LSP4Metadata',
                key: '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
                keyType: 'Singleton',
                valueType: 'bytes',
                valueContent: 'VerifiableURI'
              }
            ];

            const assetERC725 = new ERC725(LSP4Schema, assetAddress, web3.currentProvider);
            const metadataData = await assetERC725.fetchData('LSP4Metadata');

            let metadata: LSP4Metadata = {};
            if (metadataData?.value) {
              const url = metadataData.value as string;
              
              // Fetch metadata from IPFS or URL
              if (url.startsWith('ipfs://')) {
                const ipfsUrl = url.replace('ipfs://', 'https://api.universalprofile.cloud/ipfs/');
                const response = await fetch(ipfsUrl);
                metadata = await response.json();
              } else {
                const response = await fetch(url);
                metadata = await response.json();
              }
            }

            // Get balance or token IDs
            let balance = '0';
            let tokenIds: string[] = [];

            if (interfaceId === 'LSP7') {
              // Get LSP7 balance
              const contract = new web3.eth.Contract([
                {
                  name: 'balanceOf',
                  type: 'function',
                  inputs: [{ name: 'account', type: 'address' }],
                  outputs: [{ name: '', type: 'uint256' }]
                }
              ], assetAddress);

              balance = await contract.methods.balanceOf(account).call();
            } else {
              // Get LSP8 token IDs
              const contract = new web3.eth.Contract([
                {
                  name: 'tokenIdsOf',
                  type: 'function',
                  inputs: [{ name: 'owner', type: 'address' }],
                  outputs: [{ name: '', type: 'bytes32[]' }]
                }
              ], assetAddress);

              tokenIds = await contract.methods.tokenIdsOf(account).call();
            }

            return {
              address: assetAddress,
              interfaceId,
              metadata,
              balance,
              tokenIds
            };
          } catch (err) {
            console.error(`Error fetching asset ${assetAddress}:`, err);
            return null;
          }
        });

        const fetchedAssets = await Promise.all(assetPromises);
        setAssets(fetchedAssets.filter(Boolean) as Asset[]);
      } catch (err: any) {
        console.error('Error fetching assets:', err);
        setError('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [web3, account, assetType]);

  const getImageUrl = (image: any) => {
    if (!image?.url) return null;
    if (image.url.startsWith('ipfs://')) {
      return image.url.replace('ipfs://', 'https://api.universalprofile.cloud/ipfs/');
    }
    return image.url;
  };

  const formatBalance = (balance: string, decimals: number = 18) => {
    const value = parseFloat(balance) / Math.pow(10, decimals);
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-2" />
                <div className="h-3 bg-white/10 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass-card p-4 text-center text-red-400 ${className}`}>
        {error}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={`glass-card p-8 text-center ${className}`}>
        <p className="text-gray-400">No assets found</p>
        <p className="text-sm text-gray-500 mt-2">
          {assetType === 'LSP7' ? 'No tokens in your Universal Profile' : 
           assetType === 'LSP8' ? 'No NFTs in your Universal Profile' :
           'No assets in your Universal Profile'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {assets.map((asset) => {
        const isSelected = selectedAsset?.address === asset.address;
        const icon = asset.metadata?.icon?.[0];
        const iconUrl = icon ? getImageUrl(icon) : null;

        return (
          <button
            key={asset.address}
            onClick={() => onSelect(asset)}
            className={`glass-card p-4 w-full text-left transition-all ${
              isSelected 
                ? 'border-[#FF2975] bg-[#FF2975]/10' 
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Asset Icon */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#FF2975]/20 to-[#FF2975]/10">
                  {iconUrl ? (
                    <Image
                      src={iconUrl}
                      alt={asset.metadata?.name || 'Asset'}
                      width={48}
                      height={48}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#FF2975] font-bold">
                      {asset.metadata?.symbol?.[0] || '?'}
                    </div>
                  )}
                </div>

                {/* Asset Info */}
                <div>
                  <h4 className="font-semibold text-white">
                    {asset.metadata?.name || 'Unknown Asset'}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">
                      {asset.metadata?.symbol || asset.address.slice(0, 6) + '...' + asset.address.slice(-4)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-[#FF2975]/20 text-[#FF2975] rounded-full">
                      {asset.interfaceId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance/Count */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  {asset.interfaceId === 'LSP7' ? (
                    <p className="font-semibold text-white">
                      {formatBalance(asset.balance || '0')}
                    </p>
                  ) : (
                    <p className="font-semibold text-white">
                      {asset.tokenIds?.length || 0} NFTs
                    </p>
                  )}
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="w-6 h-6 bg-[#FF2975] rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {asset.metadata?.description && (
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {asset.metadata.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};