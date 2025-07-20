'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import Web3 from 'web3';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';

// LSP3 Profile Metadata Schema
const LSP3_SCHEMA: ERC725JSONSchema[] = [
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    keyType: 'Mapping',
    valueType: 'bytes4',
    valueContent: '0x5ef83ad9'
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI'
  }
];

// IPFS Gateway
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

export interface LSP3ProfileData {
  name?: string;
  description?: string;
  profileImage?: Array<{
    url: string;
    width?: number;
    height?: number;
    verification?: {
      method: string;
      data: string;
    };
  }>;
  backgroundImage?: Array<{
    url: string;
    width?: number;
    height?: number;
    verification?: {
      method: string;
      data: string;
    };
  }>;
  tags?: string[];
  links?: Array<{
    title: string;
    url: string;
  }>;
}

export const useLSP3Profile = (address: string | null) => {
  const { web3 } = useUPProvider();
  const [profileData, setProfileData] = useState<LSP3ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!address || !web3) {
        setProfileData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create ERC725 instance
        const erc725 = new ERC725(
          LSP3_SCHEMA,
          address,
          web3.currentProvider,
          {
            ipfsGateway: IPFS_GATEWAY
          }
        );

        // Fetch LSP3 Profile data
        const result = await erc725.fetchData('LSP3Profile');
        
        if (result && result.value) {
          const profileDataValue = result.value as any;
          
          // If it's a VerifiableURI, fetch the JSON
          if (profileDataValue.url) {
            let jsonUrl = profileDataValue.url;
            
            // Convert IPFS URL to HTTP
            if (jsonUrl.startsWith('ipfs://')) {
              jsonUrl = `${IPFS_GATEWAY}${jsonUrl.slice(7)}`;
            }
            
            try {
              const response = await fetch(jsonUrl);
              const metadata = await response.json();
              
              if (metadata.LSP3Profile) {
                const profile = metadata.LSP3Profile;
                
                // Process profile images
                if (profile.profileImage) {
                  profile.profileImage = profile.profileImage.map((img: any) => ({
                    ...img,
                    url: img.url.startsWith('ipfs://') 
                      ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                      : img.url
                  }));
                }
                
                // Process background images
                if (profile.backgroundImage) {
                  profile.backgroundImage = profile.backgroundImage.map((img: any) => ({
                    ...img,
                    url: img.url.startsWith('ipfs://') 
                      ? `${IPFS_GATEWAY}${img.url.slice(7)}` 
                      : img.url
                  }));
                }
                
                setProfileData(profile);
              }
            } catch (err) {
              console.error('Error fetching profile metadata:', err);
              // Set fallback data
              setProfileData({
                name: `${address.slice(0, 6)}...${address.slice(-4)}`,
                description: 'LUKSO Profile'
              });
            }
          }
        } else {
          // No profile data, set fallback
          setProfileData({
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            description: 'LUKSO Profile'
          });
        }
      } catch (err: any) {
        console.error('Error fetching LSP3 profile:', err);
        setError(err.message || 'Failed to fetch profile');
        // Set fallback data
        setProfileData({
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          description: 'LUKSO Profile'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address, web3]);

  return { profileData, loading, error };
}; 