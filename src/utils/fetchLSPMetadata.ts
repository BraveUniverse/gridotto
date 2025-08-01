import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

export interface LSP4Metadata {
  name?: string;
  symbol?: string;
  description?: string;
  tokenType?: number; // 0: Token, 1: NFT, 2: Collection
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

export async function fetchLSP4Metadata(
  assetAddress: string,
  provider: any
): Promise<LSP4Metadata | null> {
  try {
    // ERC725 instance oluştur
    const config = {
      ipfsGateway: IPFS_GATEWAY
    };
    
    const erc725 = new ERC725js(
      LSP4DigitalAssetSchema,
      assetAddress,
      provider,
      config
    );
    
    // LSP4 verilerini çek
    let tokenNameData, tokenSymbolData, metadataData;
    
    try {
      [tokenNameData, tokenSymbolData, metadataData] = await Promise.all([
        erc725.getData('LSP4TokenName').catch(() => null),
        erc725.getData('LSP4TokenSymbol').catch(() => null),
        erc725.getData('LSP4Metadata').catch(() => null)
      ]);
    } catch (err) {
      console.log('Error fetching LSP4 data:', err);
      return null;
    }
    
    const metadata: LSP4Metadata = {};
    
    // Name ve Symbol'ü ayarla
    if (tokenNameData?.value) {
      metadata.name = tokenNameData.value as string;
    }
    
    if (tokenSymbolData?.value) {
      metadata.symbol = tokenSymbolData.value as string;
    }
    
    // TokenType'ı çek
    try {
      const tokenTypeData = await erc725.getData('LSP4TokenType').catch(() => null);
      if (tokenTypeData?.value !== undefined) {
        metadata.tokenType = Number(tokenTypeData.value);
      }
    } catch (err) {
      console.log('Error fetching token type:', err);
    }
    
    // Metadata JSON'ı çek ve işle
    if (metadataData?.value) {
      const metadataValue = metadataData.value as any;
      
      if (metadataValue.url) {
        let jsonUrl = metadataValue.url;
        
        // IPFS URL'sini HTTP'ye çevir
        if (jsonUrl.startsWith('ipfs://')) {
          jsonUrl = `${IPFS_GATEWAY}${jsonUrl.slice(7)}`;
        }
        
        try {
          const response = await fetch(jsonUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
          });
          
          if (!response.ok) {
            console.log(`HTTP error! Status: ${response.status}`);
            return metadata;
          }
          
          const jsonData = await response.json();
          
          if (jsonData.LSP4Metadata) {
            const lsp4Data = jsonData.LSP4Metadata;
            
            // Description
            if (lsp4Data.description) {
              metadata.description = lsp4Data.description;
            }
            
            // Icon'ları işle
            if (lsp4Data.icon && Array.isArray(lsp4Data.icon)) {
              metadata.icon = lsp4Data.icon
                .filter((img: any) => img && img.url) // null/undefined kontrolü
                .map((img: any) => ({
                  ...img,
                  url: img.url.startsWith('ipfs://') 
                    ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                    : img.url
                }));
            }
            
            // Images'ları işle
            if (lsp4Data.images && Array.isArray(lsp4Data.images)) {
              metadata.images = lsp4Data.images
                .filter((img: any) => img && img.url) // null/undefined kontrolü
                .map((img: any) => ({
                  ...img,
                  url: img.url.startsWith('ipfs://') 
                    ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                    : img.url
                }));
            }
            
            // Assets'leri işle
            if (lsp4Data.assets && Array.isArray(lsp4Data.assets)) {
              metadata.assets = lsp4Data.assets
                .filter((asset: any) => asset && asset.url) // null/undefined kontrolü
                .map((asset: any) => ({
                  ...asset,
                  url: asset.url.startsWith('ipfs://') 
                    ? `${IPFS_GATEWAY}${asset.url.slice(7)}` 
                    : asset.url
                }));
            }
            
            // Attributes
            if (lsp4Data.attributes) {
              metadata.attributes = lsp4Data.attributes;
            }
          }
        } catch (err) {
          console.log('Error fetching metadata JSON:', err);
          // Return what we have so far
          return metadata;
        }
      }
    }
    
    return metadata;
  } catch (err) {
    console.log('Error in fetchLSP4Metadata:', err);
    return null;
  }
}