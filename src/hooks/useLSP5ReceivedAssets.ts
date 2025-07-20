'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
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
        const receivedAssetsData = await erc725.getData('LSP5ReceivedAssets[]');
        
        if (receivedAssetsData && receivedAssetsData.value) {
          const assetAddresses = receivedAssetsData.value as string[];
          const assetsData: ReceivedAsset[] = [];

          // Her asset için detayları çek
          for (const assetAddress of assetAddresses) {
            try {
              // Asset contract instance oluştur
              const assetContract = new web3.eth.Contract([
                {
                  inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
                  name: 'supportsInterface',
                  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [],
                  name: 'name',
                  outputs: [{ internalType: 'string', name: '', type: 'string' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [],
                  name: 'symbol',
                  outputs: [{ internalType: 'string', name: '', type: 'string' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [],
                  name: 'decimals',
                  outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
                  name: 'balanceOf',
                  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
                  stateMutability: 'view',
                  type: 'function'
                }
              ], assetAddress);

              // Interface kontrolü
              const [isLSP7, isLSP8] = await Promise.all([
                assetContract.methods.supportsInterface(INTERFACE_IDS.LSP7).call().catch(() => false),
                assetContract.methods.supportsInterface(INTERFACE_IDS.LSP8).call().catch(() => false)
              ]);

              // Temel bilgileri çek
              const [name, symbol] = await Promise.all([
                assetContract.methods.name().call().catch(() => 'Unknown Asset') as Promise<string>,
                assetContract.methods.symbol().call().catch(() => 'UNKNOWN') as Promise<string>
              ]);

              const asset: ReceivedAsset = {
                address: assetAddress,
                name,
                symbol,
                tokenType: isLSP7 ? 'LSP7' : isLSP8 ? 'LSP8' : 'Unknown'
              };

              // LSP7 için balance ve decimals bilgisini çek
              if (isLSP7) {
                try {
                  const [balance, decimals] = await Promise.all([
                    assetContract.methods.balanceOf(profileAddress).call() as Promise<any>,
                    assetContract.methods.decimals().call().catch(() => 18) as Promise<number>
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