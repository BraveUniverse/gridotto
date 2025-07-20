'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import Web3 from 'web3';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';

// LSP4 DigitalAsset Metadata Schema
const LSP4_SCHEMA: ERC725JSONSchema[] = [
  {
    name: 'LSP4TokenName',
    key: '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1',
    keyType: 'Singleton',
    valueType: 'string',
    valueContent: 'String'
  },
  {
    name: 'LSP4TokenSymbol',
    key: '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756',
    keyType: 'Singleton',
    valueType: 'string',
    valueContent: 'String'
  },
  {
    name: 'LSP4Metadata',
    key: '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI'
  },
  {
    name: 'LSP4Creators[]',
    key: '0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7',
    keyType: 'Array',
    valueType: 'address',
    valueContent: 'Address'
  }
];

// IPFS Gateway
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

export interface LSP4Metadata {
  name?: string;
  symbol?: string;
  description?: string;
  icon?: Array<{
    url: string;
    width?: number;
    height?: number;
    verification?: {
      method: string;
      data: string;
    };
  }>;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    verification?: {
      method: string;
      data: string;
    };
  }>;
  assets?: Array<{
    url: string;
    fileType: string;
    verification?: {
      method: string;
      data: string;
    };
  }>;
  attributes?: Array<{
    key: string;
    value: string | number;
    type?: string;
  }>;
}

export const useLSP4DigitalAsset = (assetAddress: string | null) => {
  const { web3 } = useUPProvider();
  const [metadata, setMetadata] = useState<LSP4Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!assetAddress || !web3) {
        setMetadata(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create ERC725 instance for the asset
        const erc725 = new ERC725(
          LSP4_SCHEMA,
          assetAddress,
          web3.currentProvider,
          {
            ipfsGateway: IPFS_GATEWAY
          }
        );

        // Fetch all LSP4 data
        const [nameResult, symbolResult, metadataResult] = await Promise.all([
          erc725.fetchData('LSP4TokenName').catch(() => null),
          erc725.fetchData('LSP4TokenSymbol').catch(() => null),
          erc725.fetchData('LSP4Metadata').catch(() => null)
        ]);

        const assetMetadata: LSP4Metadata = {};

        // Set name and symbol
        if (nameResult?.value) {
          assetMetadata.name = nameResult.value as string;
        }
        if (symbolResult?.value) {
          assetMetadata.symbol = symbolResult.value as string;
        }

        // Fetch and process metadata JSON
        if (metadataResult?.value) {
          const metadataValue = metadataResult.value as any;
          
          if (metadataValue.url) {
            let jsonUrl = metadataValue.url;
            
            // Convert IPFS URL to HTTP
            if (jsonUrl.startsWith('ipfs://')) {
              jsonUrl = `${IPFS_GATEWAY}${jsonUrl.slice(7)}`;
            }
            
            try {
              const response = await fetch(jsonUrl);
              const metadata = await response.json();
              
              if (metadata.LSP4Metadata) {
                const lsp4Data = metadata.LSP4Metadata;
                
                // Process description
                if (lsp4Data.description) {
                  assetMetadata.description = lsp4Data.description;
                }
                
                // Process icons
                if (lsp4Data.icon) {
                  assetMetadata.icon = lsp4Data.icon.map((img: any) => ({
                    ...img,
                    url: img.url.startsWith('ipfs://') 
                      ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                      : img.url
                  }));
                }
                
                // Process images
                if (lsp4Data.images) {
                  assetMetadata.images = lsp4Data.images.map((img: any) => ({
                    ...img,
                    url: img.url.startsWith('ipfs://') 
                      ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                      : img.url
                  }));
                }
                
                // Process assets
                if (lsp4Data.assets) {
                  assetMetadata.assets = lsp4Data.assets.map((asset: any) => ({
                    ...asset,
                    url: asset.url.startsWith('ipfs://') 
                      ? `${IPFS_GATEWAY}${asset.url.slice(7)}` 
                      : asset.url
                  }));
                }
                
                // Process attributes
                if (lsp4Data.attributes) {
                  assetMetadata.attributes = lsp4Data.attributes;
                }
              }
            } catch (err) {
              console.error('Error fetching asset metadata JSON:', err);
            }
          }
        }

        setMetadata(assetMetadata);
      } catch (err: any) {
        console.error('Error fetching LSP4 metadata:', err);
        setError(err.message || 'Failed to fetch metadata');
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [assetAddress, web3]);

  return { metadata, loading, error };
};