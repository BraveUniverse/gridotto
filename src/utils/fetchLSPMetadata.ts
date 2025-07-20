import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

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
    const [tokenNameData, tokenSymbolData, metadataData] = await Promise.all([
      erc725.getData('LSP4TokenName').catch(() => null),
      erc725.getData('LSP4TokenSymbol').catch(() => null),
      erc725.getData('LSP4Metadata').catch(() => null)
    ]);
    
    const metadata: LSP4Metadata = {};
    
    // Name ve Symbol'ü ayarla
    if (tokenNameData?.value) {
      metadata.name = tokenNameData.value as string;
    }
    
    if (tokenSymbolData?.value) {
      metadata.symbol = tokenSymbolData.value as string;
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
            throw new Error(`HTTP error! Status: ${response.status}`);
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
              metadata.icon = lsp4Data.icon.map((img: any) => ({
                ...img,
                url: img.url.startsWith('ipfs://') 
                  ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                  : img.url
              }));
            }
            
            // Images'ları işle
            if (lsp4Data.images && Array.isArray(lsp4Data.images)) {
              metadata.images = lsp4Data.images.map((img: any) => ({
                ...img,
                url: img.url.startsWith('ipfs://') 
                  ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                  : img.url
              }));
            }
            
            // Assets'leri işle
            if (lsp4Data.assets && Array.isArray(lsp4Data.assets)) {
              metadata.assets = lsp4Data.assets.map((asset: any) => ({
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
          console.error('Error fetching metadata JSON:', err);
        }
      }
    }
    
    return metadata;
  } catch (err) {
    console.error('Error fetching LSP4 metadata:', err);
    return null;
  }
}