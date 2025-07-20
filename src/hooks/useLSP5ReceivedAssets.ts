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
        // Check if it's a valid contract
        const code = await web3.eth.getCode(profileAddress);
        if (code === '0x' || code === '0x0') {
          console.log('Not a contract address');
          setAssets([]);
          setLoading(false);
          return;
        }

        // ERC725 instance oluştur
        const erc725 = new ERC725js(
          LSP5ReceivedAssetsSchema,
          profileAddress,
          web3.currentProvider,
          {
            ipfsGateway: 'https://api.universalprofile.cloud/ipfs/'
          }
        );

        // Try multiple approaches to get assets
        let assetAddresses: string[] = [];
        
        try {
          // Method 1: Try with full key
          const result = await erc725.getData('LSP5ReceivedAssets[]');
          if (result && result.value) {
            assetAddresses = result.value as string[];
          }
        } catch (err) {
          console.log('Method 1 failed, trying alternative method');
          
          try {
            // Method 2: Get all data and filter
            const allData = await erc725.getData() as Record<string, any>;
            
            // Find LSP5ReceivedAssets entries
            const lsp5Keys = Object.keys(allData).filter(key => 
              key.startsWith('0x6460ee3c0aac563ccbf76d6e1d07bada')
            );
            
            if (lsp5Keys.length > 0) {
              // Extract addresses from the data
              for (const key of lsp5Keys) {
                const value = allData[key];
                if (value && typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
                  assetAddresses.push(value);
                }
              }
            }
          } catch (err2) {
            console.log('Method 2 failed, trying direct call');
            
            try {
              // Method 3: Direct contract call
              const contract = new web3.eth.Contract([
                {
                  inputs: [{ name: 'dataKey', type: 'bytes32' }],
                  name: 'getData',
                  outputs: [{ name: '', type: 'bytes' }],
                  stateMutability: 'view',
                  type: 'function'
                },
                {
                  inputs: [{ name: 'dataKeys', type: 'bytes32[]' }],
                  name: 'getDataBatch',
                  outputs: [{ name: '', type: 'bytes[]' }],
                  stateMutability: 'view',
                  type: 'function'
                }
              ], profileAddress);
              
              // Get array length first
              const lengthKey = '0x6460ee3c0aac563ccbf76d6e1d07bada78e00500e6331e6584e24248846242e0';
              const lengthData = await contract.methods.getData(lengthKey).call() as string;
              
              if (lengthData && lengthData !== '0x' && lengthData !== '0x0') {
                const length = parseInt(lengthData, 16);
                
                // Get each asset
                for (let i = 0; i < length; i++) {
                  const indexKey = web3.utils.keccak256(
                    web3.utils.encodePacked(
                      { value: '0x6460ee3c0aac563ccbf76d6e1d07bada78e00500e6331e6584e24248846242e0', type: 'bytes32' },
                      { value: i.toString(), type: 'uint256' }
                    ) || ''
                  );
                  
                  const assetData = await contract.methods.getData(indexKey).call() as string;
                  if (assetData && assetData !== '0x' && assetData.length === 42) {
                    assetAddresses.push(assetData);
                  }
                }
              }
            } catch (err3) {
              console.log('All methods failed to get LSP5 assets');
            }
          }
        }
        
        console.log('Found asset addresses:', assetAddresses);
        
        if (assetAddresses.length > 0) {
          const assetsData: ReceivedAsset[] = [];

          // Her asset için detayları çek
          for (const assetAddress of assetAddresses) {
            try {
              // Skip if invalid address
              if (!assetAddress || assetAddress === '0x0000000000000000000000000000000000000000' || !web3.utils.isAddress(assetAddress)) {
                continue;
              }

              // Fetch LSP4 metadata
              console.log(`Fetching metadata for asset: ${assetAddress}`);
              const metadata = await fetchLSP4Metadata(assetAddress, web3.currentProvider);
              console.log(`Metadata for ${assetAddress}:`, metadata);
              
              // Determine token type from metadata and contract data
              let tokenType: 'LSP7' | 'LSP8' | 'Unknown' = 'Unknown';
              
              // First, try to determine from metadata
              if (metadata) {
                if (metadata.name && (metadata.name.includes('#') || metadata.name.includes('NFT'))) {
                  // Names with # (like "GloryMint #5") are typically NFTs
                  tokenType = 'LSP8';
                  console.log(`Asset ${assetAddress} identified as LSP8 based on name: ${metadata.name}`);
                }
              }
              
              // If still unknown, try contract methods
              if (tokenType === 'Unknown') {
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
                  },
                  {
                    inputs: [{ name: 'tokenId', type: 'bytes32' }],
                    name: 'getDataForTokenId',
                    outputs: [{ name: '', type: 'bytes' }],
                    stateMutability: 'view',
                    type: 'function'
                  }
                ], assetAddress);

                // Try to call decimals - if it works, it's likely LSP7
                try {
                  const decimals = await assetContract.methods.decimals().call();
                  if (decimals !== undefined) {
                    tokenType = 'LSP7';
                    console.log(`Asset ${assetAddress} identified as LSP7 based on decimals method`);
                  }
                } catch (err) {
                  // decimals failed, might be LSP8
                }
                
                // Try to call getDataForTokenId - if it exists, it's likely LSP8
                if (tokenType === 'Unknown') {
                  try {
                    // Try with a dummy tokenId
                    await assetContract.methods.getDataForTokenId('0x0000000000000000000000000000000000000000000000000000000000000001').call();
                    tokenType = 'LSP8';
                    console.log(`Asset ${assetAddress} identified as LSP8 based on getDataForTokenId method`);
                  } catch (err) {
                    // getDataForTokenId failed
                  }
                }
                
                // Final fallback - check if we can get balance
                if (tokenType === 'Unknown') {
                  try {
                    const balance = await assetContract.methods.balanceOf(profileAddress).call();
                    // If balanceOf works, assume it's a token (LSP7)
                    tokenType = 'LSP7';
                    console.log(`Asset ${assetAddress} identified as LSP7 based on balanceOf method`);
                  } catch (err) {
                    // If all else fails, check metadata patterns
                    if (metadata?.symbol && metadata.symbol.length <= 5) {
                      tokenType = 'LSP7'; // Short symbols are usually tokens
                    } else {
                      tokenType = 'LSP8'; // Default to NFT
                    }
                  }
                }
              }

              const asset: ReceivedAsset = {
                address: assetAddress,
                name: metadata?.name || 'Unknown Asset',
                symbol: metadata?.symbol || 'UNKNOWN',
                tokenType: tokenType,
                metadata
              };
              
              console.log(`Asset created:`, asset);

              // LSP7 için balance ve decimals bilgisini çek
              if (tokenType === 'LSP7') {
                try {
                  const assetContract = new web3.eth.Contract([
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
              if (tokenType === 'LSP8') {
                asset.tokenIds = [];
                // TODO: Implement tokenIds fetching for LSP8
              }

              assetsData.push(asset);
            } catch (err) {
              console.error(`Error fetching asset ${assetAddress}:`, err);
              // Continue with next asset
            }
          }

          console.log('Final assets array:', assetsData);
          console.log('Setting assets state with:', assetsData);
          setAssets(assetsData);
        } else {
          console.log('No asset addresses found, setting empty array');
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