'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import ERC725js from '@erc725/erc725.js';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  loading: boolean;
  error?: string;
}

// LSP4 Metadata key for LSP8 contracts
const LSP4_METADATA_KEY = '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e';

export function useNFTMetadata(contractAddress: string, tokenIds: string[] = []): NFTMetadata {
  const [metadata, setMetadata] = useState<NFTMetadata>({ loading: true });

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      if (!contractAddress) {
        setMetadata({ loading: false, error: 'No contract address' });
        return;
      }

      try {
        setMetadata({ loading: true });

        // Create Web3 instance
        const web3 = new Web3('https://rpc.testnet.lukso.network');
        
        // Create contract instance for LSP8
        const nftContract = new web3.eth.Contract([
          {
            inputs: [{ name: 'dataKey', type: 'bytes32' }],
            name: 'getData',
            outputs: [{ name: '', type: 'bytes' }],
            stateMutability: 'view',
            type: 'function'
          },
          {
            inputs: [
              { name: 'tokenId', type: 'bytes32' },
              { name: 'dataKey', type: 'bytes32' }
            ],
            name: 'getDataForTokenId',
            outputs: [{ name: '', type: 'bytes' }],
            stateMutability: 'view',
            type: 'function'
          }
        ], contractAddress);

        // Create ERC725 instance for decoding
        const erc725 = new ERC725js(
          [
            {
              name: 'LSP4Metadata',
              key: '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
              keyType: 'Singleton',
              valueType: 'bytes',
              valueContent: 'VerifiableURI'
            }
          ],
          contractAddress,
          'https://rpc.testnet.lukso.network',
          {
            ipfsGateway: 'https://api.universalprofile.cloud/ipfs/'
          }
        );

        // Try to get individual token metadata first (if tokenIds provided)
        if (tokenIds.length > 0) {
          for (const tokenId of tokenIds) {
            try {
              // Convert tokenId to bytes32
              const tokenIdBytes32 = '0x' + tokenId.slice(2).padStart(64, '0');
              
              // Try getDataForTokenId with LSP4Metadata key
              const tokenMetadataBytes = await nftContract.methods.getDataForTokenId(
                tokenIdBytes32, 
                LSP4_METADATA_KEY
              ).call() as string;

              if (tokenMetadataBytes && tokenMetadataBytes !== '0x') {
                const decodedMetadata = erc725.decodeData([{
                  keyName: 'LSP4Metadata',
                  value: tokenMetadataBytes
                }]);

                if (decodedMetadata?.[0]?.value?.url) {
                  const response = await fetch(decodedMetadata[0].value.url);
                  const jsonMetadata = await response.json();
                  
                  setMetadata({
                    loading: false,
                    name: jsonMetadata.LSP4Metadata?.name || jsonMetadata.name,
                    description: jsonMetadata.LSP4Metadata?.description || jsonMetadata.description,
                    image: jsonMetadata.LSP4Metadata?.images?.[0]?.url || jsonMetadata.image
                  });
                  return;
                }
              }
            } catch (error) {
              console.log(`Token ${tokenId} metadata not found, trying collection metadata...`);
            }
          }
        }

        // Fallback: Get collection metadata
        try {
          const collectionMetadata = await erc725.fetchData('LSP4Metadata') as any;
          
          if (collectionMetadata?.value?.url) {
            const response = await fetch(collectionMetadata.value.url);
            const jsonMetadata = await response.json();
            
            setMetadata({
              loading: false,
              name: jsonMetadata.LSP4Metadata?.name || jsonMetadata.name,
              description: jsonMetadata.LSP4Metadata?.description || jsonMetadata.description,
              image: jsonMetadata.LSP4Metadata?.images?.[0]?.url || jsonMetadata.image
            });
            return;
          }
        } catch (error) {
          console.log('Collection metadata not found');
        }

        // No metadata found
        setMetadata({
          loading: false,
          name: 'Unknown NFT',
          description: 'No metadata available',
          image: undefined
        });

      } catch (error: any) {
        console.error('Error fetching NFT metadata:', error);
        setMetadata({
          loading: false,
          error: error.message,
          name: 'Error loading NFT',
          description: 'Failed to load metadata'
        });
      }
    };

    fetchNFTMetadata();
  }, [contractAddress, tokenIds.join(',')]);

  return metadata;
}