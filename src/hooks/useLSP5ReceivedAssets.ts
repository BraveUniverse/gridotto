'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import Web3 from 'web3';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';

// LSP5 ReceivedAssets Schema
const LSP5_SCHEMA: ERC725JSONSchema[] = [
  {
    name: 'LSP5ReceivedAssets[]',
    key: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
    keyType: 'Array',
    valueType: 'address',
    valueContent: 'Address'
  }
];

export interface ReceivedAsset {
  address: string;
  interfaceId?: string;
  name?: string;
  symbol?: string;
  tokenType?: 'LSP7' | 'LSP8';
  balance?: string;
  tokenIds?: string[];
  metadata?: any;
}

export const useLSP5ReceivedAssets = (profileAddress: string | null) => {
  const { web3 } = useUPProvider();
  const [assets, setAssets] = useState<ReceivedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!profileAddress || !web3) {
        setAssets([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create ERC725 instance for the profile
        const erc725 = new ERC725(
          LSP5_SCHEMA,
          profileAddress,
          web3.currentProvider
        );

        // Fetch received assets
        const result = await erc725.fetchData('LSP5ReceivedAssets[]');
        
        if (result && result.value) {
          const assetAddresses = result.value as string[];
          const assetsData: ReceivedAsset[] = [];

          // Fetch details for each asset
          for (const assetAddress of assetAddresses) {
            try {
              // Check if it's LSP7 or LSP8
              const assetContract = new web3.eth.Contract([
                {
                  inputs: [],
                  name: 'supportsInterface',
                  outputs: [{ name: '', type: 'bool' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [],
                  name: 'name',
                  outputs: [{ name: '', type: 'string' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [],
                  name: 'symbol',
                  outputs: [{ name: '', type: 'string' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [{ name: 'account', type: 'address' }],
                  name: 'balanceOf',
                  outputs: [{ name: '', type: 'uint256' }],
                  stateMutability: 'view',
                  type: 'function'
                }
              ], assetAddress);

              // Get basic info
              const [name, symbol] = await Promise.all([
                assetContract.methods.name().call().catch(() => 'Unknown') as Promise<string>,
                assetContract.methods.symbol().call().catch(() => 'UNKNOWN') as Promise<string>
              ]);

              // Check if LSP7 (fungible token)
              const isLSP7 = await assetContract.methods.supportsInterface('0x5fcaac27').call().catch(() => false);
              // Check if LSP8 (NFT)
              const isLSP8 = await assetContract.methods.supportsInterface('0x3be95908').call().catch(() => false);

              const asset: ReceivedAsset = {
                address: assetAddress,
                name,
                symbol,
                tokenType: isLSP7 ? 'LSP7' : isLSP8 ? 'LSP8' : undefined
              };

              // Get balance or token IDs
              if (isLSP7) {
                try {
                  const balance = await assetContract.methods.balanceOf(profileAddress).call();
                  asset.balance = balance ? balance.toString() : '0';
                } catch (err) {
                  asset.balance = '0';
                }
              } else if (isLSP8) {
                // For LSP8, we'd need to get tokenIds owned by the profile
                // This would require additional methods specific to LSP8
                asset.tokenIds = [];
              }

              assetsData.push(asset);
            } catch (err) {
              console.error(`Error fetching asset ${assetAddress}:`, err);
            }
          }

          setAssets(assetsData);
        } else {
          setAssets([]);
        }
      } catch (err: any) {
        console.error('Error fetching LSP5 assets:', err);
        setError(err.message || 'Failed to fetch assets');
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [profileAddress, web3]);

  return { assets, loading, error };
};