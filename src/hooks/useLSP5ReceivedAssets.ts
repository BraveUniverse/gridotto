'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import { fetchLSP4Metadata } from '@/utils/fetchLSPMetadata';
import ERC725js from '@erc725/erc725.js';
import LSP5ReceivedAssetsSchema from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';
import Web3 from 'web3';

// LSP7/8 Interface IDs
const INTERFACE_IDS = {
  LSP7: '0x5fcaac27',
  LSP8: '0x3be95908'
};

export interface ReceivedAsset {
  address: string;
  interfaceId?: string;
  name?: string;
  symbol?: string;
  tokenType?: 'LSP7' | 'LSP8' | 'Unknown';
  balance?: string;
  decimals?: number;
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
        // ERC725 instance oluştur
        const erc725 = new ERC725js(
          LSP5ReceivedAssetsSchema,
          profileAddress,
          web3.currentProvider
        );

        // LSP5ReceivedAssets[] verilerini çek
        let receivedAssetsData;
        try {
          receivedAssetsData = await erc725.getData('LSP5ReceivedAssets[]');
        } catch (err) {
          console.log('No LSP5 assets found or not a Universal Profile');
          setAssets([]);
          setLoading(false);
          return;
        }
        
        if (receivedAssetsData && receivedAssetsData.value && Array.isArray(receivedAssetsData.value)) {
          const assetAddresses = receivedAssetsData.value as string[];
          const assetsData: ReceivedAsset[] = [];

          // Her asset için detayları çek
          for (const assetAddress of assetAddresses) {
            try {
              // Skip if invalid address
              if (!assetAddress || assetAddress === '0x0000000000000000000000000000000000000000') {
                continue;
              }

              // Fetch LSP4 metadata
              const metadata = await fetchLSP4Metadata(assetAddress, web3.currentProvider);
              
              // Asset contract instance oluştur
              const assetContract = new web3.eth.Contract([
                {
                  inputs: [{ name: 'interfaceId', type: 'bytes4' }],
                  name: 'supportsInterface',
                  outputs: [{ name: '', type: 'bool' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [{ name: 'account', type: 'address' }],
                  name: 'balanceOf',
                  outputs: [{ name: '', type: 'uint256' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [],
                  name: 'decimals',
                  outputs: [{ name: '', type: 'uint8' }],
                  stateMutability: 'view',
                  type: 'function'
                }
              ], assetAddress);

              // Interface kontrolü - try/catch ile sarmalayalım
              let isLSP7 = false;
              let isLSP8 = false;
              
              try {
                isLSP7 = await assetContract.methods.supportsInterface(INTERFACE_IDS.LSP7).call();
              } catch (err) {
                // Interface check failed, skip
              }
              
              try {
                isLSP8 = await assetContract.methods.supportsInterface(INTERFACE_IDS.LSP8).call();
              } catch (err) {
                // Interface check failed, skip
              }

              const asset: ReceivedAsset = {
                address: assetAddress,
                name: metadata?.name || 'Unknown Asset',
                symbol: metadata?.symbol || 'UNKNOWN',
                tokenType: isLSP7 ? 'LSP7' : isLSP8 ? 'LSP8' : 'Unknown',
                metadata
              };

              // LSP7 için balance ve decimals bilgisini çek
              if (isLSP7) {
                try {
                  const [balance, decimals] = await Promise.all([
                    assetContract.methods.balanceOf(profileAddress).call().catch(() => '0'),
                    assetContract.methods.decimals().call().catch(() => 18)
                  ]);
                  asset.balance = balance ? balance.toString() : '0';
                  asset.decimals = Number(decimals);
                } catch (err) {
                  asset.balance = '0';
                  asset.decimals = 18;
                }
              }

              // LSP8 için tokenIds çek (ileride eklenebilir)
              if (isLSP8) {
                asset.tokenIds = [];
                // TODO: Implement tokenIds fetching for LSP8
              }

              assetsData.push(asset);
            } catch (err) {
              console.error(`Error fetching asset ${assetAddress}:`, err);
              // Continue with next asset
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