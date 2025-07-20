'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ReceivedAsset } from '@/hooks/useLSP5ReceivedAssets';
import Web3 from 'web3';

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
        
        // For each token, try to get metadata
        for (const tokenId of asset.tokenIds) {
          let metadata: TokenMetadata = { 
            tokenId,
            name: `${asset.name} #${parseInt(tokenId, 16)}`
          };

          try {
            // Try to get metadata from the asset's general metadata
            // Many LSP8 collections use the same base metadata for all tokens
            if (asset.metadata) {
              // Check if there's a base URI pattern
              if (asset.metadata.description) {
                metadata.description = asset.metadata.description;
              }

              // For images, check if there's a pattern or use collection image
              if (asset.metadata.images?.[0]?.url || asset.metadata.icon?.[0]?.url) {
                const baseImage = asset.metadata.images?.[0]?.url || asset.metadata.icon?.[0]?.url;
                
                // Some NFTs use a pattern like {id} in the URL
                if (baseImage.includes('{id}')) {
                  metadata.image = baseImage.replace('{id}', parseInt(tokenId, 16).toString());
                } else {
                  // Use collection image as fallback
                  metadata.image = baseImage;
                }
              }
            }

            // If the collection has individual metadata per token, we could fetch it here
            // But for now, we'll use the pattern-based approach which is more common
            
          } catch (err) {
            console.log(`Error processing metadata for token ${tokenId}:`, err);
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