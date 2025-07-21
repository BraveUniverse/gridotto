'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ReceivedAsset } from '@/hooks/useLSP5ReceivedAssets';
import Web3 from 'web3';
import ERC725js from '@erc725/erc725.js';

interface NFTTokenSelectorProps {
  asset: ReceivedAsset;
  selectedTokenIds: string[];
  onTokenIdsChange: (tokenIds: string[]) => void;
  web3Provider: any;
}

interface TokenMetadata {
  tokenId: string;
  name?: string;
  description?: string;
  image?: string;
}

// LSP8 token metadata key for specific tokenId
// keccak256('LSP8MetadataTokenURI') + bytes12(0) + tokenId
const LSP8_METADATA_KEY_PREFIX = '0x1339e76a390b7b9ec9010000';

// LSP8 token metadata key construction
// For LSP8, we need to use keccak256 hash for the mapping
const getLSP8MetadataKey = (tokenId: string, web3Instance: Web3): string => {
  // LSP8MetadataTokenURI key prefix
  const keyPrefix = '0x1339e76a390b7b9ec9010000'; // First 12 bytes of keccak256('LSP8MetadataTokenURI')
  
  // Ensure tokenId is 32 bytes
  const tokenIdBytes32 = '0x' + tokenId.slice(2).padStart(64, '0');
  
  // Concatenate and hash
  const concatenated = keyPrefix + tokenIdBytes32.slice(2);
  const hashedKey = web3Instance.utils.keccak256(concatenated);
  
  return hashedKey;
};

export default function NFTTokenSelector({ 
  asset, 
  selectedTokenIds, 
  onTokenIdsChange,
  web3Provider
}: NFTTokenSelectorProps) {
  const [tokenMetadatas, setTokenMetadatas] = useState<TokenMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenMetadatas = async () => {
      if (!asset.tokenIds || asset.tokenIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const metadatas: TokenMetadata[] = [];

      try {
        const web3Instance = new Web3(web3Provider);
        
        // Create contract instance for LSP8
        const nftContract = new web3Instance.eth.Contract([
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
        ], asset.address);

        // Create ERC725 instance for decoding
        const erc725 = new ERC725js(
          [
            {
              name: 'LSP8MetadataTokenURI:<bytes32>',
              key: '0x1339e76a390b7b9ec9010000<bytes32>',
              keyType: 'Mapping',
              valueType: 'bytes',
              valueContent: 'VerifiableURI'
            }
          ],
          asset.address,
          web3Provider,
          {
            ipfsGateway: 'https://api.universalprofile.cloud/ipfs/'
          }
        );
        
        // For each token, get its metadata
        for (const tokenId of asset.tokenIds) {
          let metadata: TokenMetadata = { 
            tokenId,
            name: `${asset.name} #${parseInt(tokenId, 16)}`
          };

          try {
            // Method 1: Try LSP8MetadataTokenURI with proper key construction
            const metadataKey = getLSP8MetadataKey(tokenId, web3Instance);
            console.log(`Fetching metadata for token ${tokenId} with key ${metadataKey}`);
            
            const metadataBytes = await nftContract.methods.getData(metadataKey).call() as string;
            
            if (metadataBytes && metadataBytes !== '0x' && metadataBytes !== '0x0') {
              try {
                // Decode the VerifiableURI
                const decoded = erc725.decodeData([{
                  keyName: 'LSP8MetadataTokenURI:<bytes32>',
                  dynamicKeyParts: tokenId,
                  value: metadataBytes
                }]);
                
                if (decoded && decoded[0] && decoded[0].value) {
                  const metadataValue = decoded[0].value as any;
                  let metadataUrl = '';
                  
                  if (metadataValue.url) {
                    metadataUrl = metadataValue.url;
                  } else if (typeof metadataValue === 'string') {
                    metadataUrl = metadataValue;
                  }
                  
                  // Handle IPFS URLs
                  if (metadataUrl.startsWith('ipfs://')) {
                    metadataUrl = `https://api.universalprofile.cloud/ipfs/${metadataUrl.slice(7)}`;
                  }
                  
                  console.log(`Fetching metadata from URL: ${metadataUrl}`);
                  
                  // Fetch the metadata JSON
                  if (metadataUrl) {
                    const response = await fetch(metadataUrl);
                    if (response.ok) {
                      const json = await response.json();
                      
                      // Handle both LSP4 and standard NFT metadata formats
                      if (json.LSP4Metadata) {
                        // LSP4 format
                        metadata.name = json.LSP4Metadata.name || metadata.name;
                        metadata.description = json.LSP4Metadata.description;
                        
                        if (json.LSP4Metadata.images && json.LSP4Metadata.images[0]) {
                          metadata.image = json.LSP4Metadata.images[0].url;
                          if (metadata.image && metadata.image.startsWith('ipfs://')) {
                            metadata.image = `https://api.universalprofile.cloud/ipfs/${metadata.image.slice(7)}`;
                          }
                        } else if (json.LSP4Metadata.icon && json.LSP4Metadata.icon[0]) {
                          metadata.image = json.LSP4Metadata.icon[0].url;
                          if (metadata.image && metadata.image.startsWith('ipfs://')) {
                            metadata.image = `https://api.universalprofile.cloud/ipfs/${metadata.image.slice(7)}`;
                          }
                        }
                      } else {
                        // Standard NFT metadata format
                        metadata.name = json.name || metadata.name;
                        metadata.description = json.description;
                        
                        if (json.image) {
                          metadata.image = json.image.startsWith('ipfs://') 
                            ? `https://api.universalprofile.cloud/ipfs/${json.image.slice(7)}`
                            : json.image;
                        }
                      }
                    }
                  }
                }
              } catch (decodeErr) {
                console.log('Error decoding metadata:', decodeErr);
              }
            } else {
              // Method 2: Try standard LSP4Metadata key with getDataForTokenId
              console.log(`Trying getDataForTokenId for token ${tokenId}`);
              const lsp4MetadataKey = '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e';
              
              try {
                const tokenMetadataBytes = await nftContract.methods.getDataForTokenId(tokenId, lsp4MetadataKey).call() as string;
                console.log(`getDataForTokenId returned:`, tokenMetadataBytes);
                
                if (tokenMetadataBytes && tokenMetadataBytes !== '0x' && tokenMetadataBytes !== '0x0') {
                  console.log('Found metadata with getDataForTokenId');
                  
                  try {
                    // Decode using ERC725
                    const decoded = erc725.decodeData([{
                      keyName: 'LSP4Metadata',
                      value: tokenMetadataBytes
                    }]);
                    console.log('Decoded metadata:', decoded);
                    
                    if (decoded && decoded[0] && decoded[0].value) {
                      const metadataValue = decoded[0].value as any;
                      console.log('Metadata value:', metadataValue);
                      
                      let metadataUrl = '';
                      
                      if (metadataValue.url) {
                        metadataUrl = metadataValue.url;
                      } else if (typeof metadataValue === 'string') {
                        metadataUrl = metadataValue;
                      }
                      
                      // Handle IPFS URLs
                      if (metadataUrl.startsWith('ipfs://')) {
                        metadataUrl = `https://api.universalprofile.cloud/ipfs/${metadataUrl.slice(7)}`;
                      }
                      
                      console.log(`Fetching metadata from URL: ${metadataUrl}`);
                      
                      // Fetch the metadata JSON
                      if (metadataUrl) {
                        const response = await fetch(metadataUrl);
                        console.log('Fetch response status:', response.status);
                        
                        if (response.ok) {
                          const json = await response.json();
                          console.log('Fetched JSON metadata:', json);
                          
                          // Handle both LSP4 and standard NFT metadata formats
                          if (json.LSP4Metadata) {
                            // LSP4 format
                            metadata.name = json.LSP4Metadata.name || metadata.name;
                            metadata.description = json.LSP4Metadata.description;
                            
                            if (json.LSP4Metadata.images && json.LSP4Metadata.images[0]) {
                              metadata.image = json.LSP4Metadata.images[0].url;
                              if (metadata.image && metadata.image.startsWith('ipfs://')) {
                                metadata.image = `https://api.universalprofile.cloud/ipfs/${metadata.image.slice(7)}`;
                              }
                              console.log('Found image URL:', metadata.image);
                            } else if (json.LSP4Metadata.icon && json.LSP4Metadata.icon[0]) {
                              metadata.image = json.LSP4Metadata.icon[0].url;
                              if (metadata.image && metadata.image.startsWith('ipfs://')) {
                                metadata.image = `https://api.universalprofile.cloud/ipfs/${metadata.image.slice(7)}`;
                              }
                              console.log('Found icon URL:', metadata.image);
                            }
                          } else {
                            // Standard NFT metadata format
                            metadata.name = json.name || metadata.name;
                            metadata.description = json.description;
                            
                            if (json.image) {
                              metadata.image = json.image.startsWith('ipfs://') 
                                ? `https://api.universalprofile.cloud/ipfs/${json.image.slice(7)}`
                                : json.image;
                              console.log('Found standard image URL:', metadata.image);
                            }
                          }
                        } else {
                          console.log('Failed to fetch metadata JSON:', response.statusText);
                        }
                      }
                    }
                  } catch (decodeErr) {
                    console.log('Error decoding metadata with ERC725:', decodeErr);
                    console.log('Error details:', JSON.stringify(decodeErr, null, 2));
                    
                    // Try manual decoding as fallback
                    try {
                      console.log('Trying manual decode of bytes:', tokenMetadataBytes);
                      
                      // Check if it's a VerifiableURI format (starts with 0x00006f357c6a0020)
                      if (tokenMetadataBytes.startsWith('0x00006f357c6a0020')) {
                        // Skip the VerifiableURI prefix (first 10 bytes = 20 hex chars after 0x)
                        const dataWithoutPrefix = '0x' + tokenMetadataBytes.slice(22);
                        console.log('Data without VerifiableURI prefix:', dataWithoutPrefix);
                        
                        // Decode the remaining hex to string
                        const hexString = dataWithoutPrefix.slice(2); // Remove 0x
                        let decodedString = '';
                        for (let i = 0; i < hexString.length; i += 2) {
                          const hex = hexString.substr(i, 2);
                          const charCode = parseInt(hex, 16);
                          if (charCode > 0) { // Skip null bytes
                            decodedString += String.fromCharCode(charCode);
                          }
                        }
                        
                        console.log('Manually decoded string:', decodedString);
                        
                        // Extract URL from the decoded string
                        const urlMatch = decodedString.match(/(ipfs:\/\/[^\s]+)/);
                        if (urlMatch) {
                          let metadataUrl = urlMatch[1];
                          console.log('Extracted URL:', metadataUrl);
                          
                          // Convert IPFS URL
                          if (metadataUrl.startsWith('ipfs://')) {
                            metadataUrl = `https://api.universalprofile.cloud/ipfs/${metadataUrl.slice(7)}`;
                          }
                          
                          console.log(`Fetching metadata from manually extracted URL: ${metadataUrl}`);
                          
                          // Fetch the metadata JSON
                          const response = await fetch(metadataUrl);
                          console.log('Fetch response status:', response.status);
                          
                          if (response.ok) {
                            const json = await response.json();
                            console.log('Fetched JSON metadata:', json);
                            
                            // Handle both LSP4 and standard NFT metadata formats
                            if (json.LSP4Metadata) {
                              // LSP4 format
                              metadata.name = json.LSP4Metadata.name || metadata.name;
                              metadata.description = json.LSP4Metadata.description;
                              
                              if (json.LSP4Metadata.images && json.LSP4Metadata.images[0]) {
                                metadata.image = json.LSP4Metadata.images[0].url;
                                if (metadata.image && metadata.image.startsWith('ipfs://')) {
                                  metadata.image = `https://api.universalprofile.cloud/ipfs/${metadata.image.slice(7)}`;
                                }
                                console.log('Found image URL from manual decode:', metadata.image);
                              } else if (json.LSP4Metadata.icon && json.LSP4Metadata.icon[0]) {
                                metadata.image = json.LSP4Metadata.icon[0].url;
                                if (metadata.image && metadata.image.startsWith('ipfs://')) {
                                  metadata.image = `https://api.universalprofile.cloud/ipfs/${metadata.image.slice(7)}`;
                                }
                                console.log('Found icon URL from manual decode:', metadata.image);
                              }
                            } else {
                              // Standard NFT metadata format
                              metadata.name = json.name || metadata.name;
                              metadata.description = json.description;
                              
                              if (json.image) {
                                metadata.image = json.image.startsWith('ipfs://') 
                                  ? `https://api.universalprofile.cloud/ipfs/${json.image.slice(7)}`
                                  : json.image;
                                console.log('Found standard image URL from manual decode:', metadata.image);
                              }
                            }
                          }
                        }
                      }
                    } catch (manualErr) {
                      console.log('Manual decode also failed:', manualErr);
                    }
                  }
                }
              } catch (err) {
                console.log('getDataForTokenId failed:', err);
              }
            }
          } catch (err) {
            console.log(`Error fetching metadata for token ${tokenId}:`, err);
          }

          // If no individual metadata found, use collection metadata
          if (!metadata.image && asset.metadata) {
            if (asset.metadata.images?.[0]?.url || asset.metadata.icon?.[0]?.url) {
              const baseImage = asset.metadata.images?.[0]?.url || asset.metadata.icon?.[0]?.url;
              metadata.image = baseImage;
            }
          }

          metadatas.push(metadata);
        }
      } catch (err) {
        console.error('Error fetching NFT token metadatas:', err);
      }

      setTokenMetadatas(metadatas);
      setLoading(false);
    };

    fetchTokenMetadatas();
  }, [asset, web3Provider]);

  const toggleTokenSelection = (tokenId: string) => {
    if (selectedTokenIds.includes(tokenId)) {
      onTokenIdsChange(selectedTokenIds.filter(id => id !== tokenId));
    } else {
      onTokenIdsChange([...selectedTokenIds, tokenId]);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading NFT tokens...</span>
        </div>
      </div>
    );
  }

  if (tokenMetadatas.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="text-center text-muted-foreground">
          <p className="font-semibold">No NFTs found in this collection</p>
          <p className="text-sm mt-2">You don't own any tokens from this NFT collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h4 className="text-sm font-semibold text-muted-foreground mb-4">
          Select NFT Tokens for Prize ({selectedTokenIds.length} selected)
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tokenMetadatas.map((token) => {
            const isSelected = selectedTokenIds.includes(token.tokenId);
            
            return (
              <div
                key={token.tokenId}
                onClick={() => toggleTokenSelection(token.tokenId)}
                className={`
                  relative rounded-lg border-2 cursor-pointer transition-all overflow-hidden
                  ${isSelected 
                    ? 'border-primary ring-2 ring-primary/50' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                {/* NFT Image */}
                <div className="aspect-square relative bg-accent/20">
                  {token.image ? (
                    <Image
                      src={token.image}
                      alt={token.name || 'NFT'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      onError={(e) => {
                        // Hide broken image and show fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 ${token.image ? 'hidden' : ''}`}>
                    <span className="text-4xl font-bold text-primary/50">
                      #{parseInt(token.tokenId, 16)}
                    </span>
                  </div>
                  
                  {/* Selected Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* NFT Info */}
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{token.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {parseInt(token.tokenId, 16)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected Tokens Summary */}
      {selectedTokenIds.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Selected Token IDs:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTokenIds.map(tokenId => (
              <span
                key={tokenId}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-mono"
              >
                #{parseInt(tokenId, 16)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}