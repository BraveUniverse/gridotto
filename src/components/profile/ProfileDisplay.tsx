'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUPProvider } from '@/hooks/useUPProvider';
import ERC725 from '@erc725/erc725.js';
import LSP3Schema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';

// IPFS Gateway
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

interface ProfileDisplayProps {
  address: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

interface LSP3Profile {
  name?: string;
  description?: string;
  profileImage?: Array<{
    url: string;
    width?: number;
    height?: number;
  }>;
}

export function ProfileDisplay({ address, size = 'md', showName = true }: ProfileDisplayProps) {
  const [profile, setProfile] = useState<LSP3Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { web3 } = useUPProvider();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!address || !web3) {
        setLoading(false);
        return;
      }

      try {
        const config = {
          ipfsGateway: IPFS_GATEWAY
        };
        
        const erc725 = new ERC725(LSP3Schema, address, web3.currentProvider, config);
        const profileData = await erc725.getData('LSP3Profile');

        if (profileData?.value) {
          try {
            // ERC725.js'den gelen veri yapısı:
            // value: { url: "ipfs://...", verification: {...} }
            const profileValue = profileData.value as any;
            
            if (profileValue.url) {
              // IPFS URL'sini düzelt
              let jsonUrl = profileValue.url;
              if (jsonUrl.startsWith('ipfs://')) {
                jsonUrl = `${IPFS_GATEWAY}${jsonUrl.slice(7)}`;
              }
              
              // JSON içeriğini çek
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
              
              const responseText = await response.text();
              const metadata = JSON.parse(responseText);
              
              if (metadata.LSP3Profile) {
                // Profil resimlerini işle
                const processedProfileImages = metadata.LSP3Profile.profileImage?.map((img: any) => {
                  const processedImg = { ...img };
                  
                  // IPFS URL'lerini düzelt
                  if (processedImg.url && processedImg.url.startsWith('ipfs://')) {
                    processedImg.url = `${IPFS_GATEWAY}${processedImg.url.slice(7)}`;
                  }
                  
                  return processedImg;
                }) || [];
                
                // Profil verilerini ayarla
                setProfile({
                  name: metadata.LSP3Profile.name,
                  description: metadata.LSP3Profile.description,
                  profileImage: processedProfileImages
                });
              } else {
                setFallbackProfile(address);
              }
            } else {
              setFallbackProfile(address);
            }
          } catch (fetchError: any) {
            console.error('Metadata fetch error:', fetchError);
            setFallbackProfile(address);
          }
        } else {
          setFallbackProfile(address);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setFallbackProfile(address);
      } finally {
        setLoading(false);
      }
    };

    // Fallback profil verisi ayarla
    const setFallbackProfile = (addr: string) => {
      setProfile({
        name: addr.slice(0, 6) + '...' + addr.slice(-4),
        description: 'LUKSO Profile',
        profileImage: []
      });
    };

    fetchProfile();
  }, [address, web3]);

  const displayName = profile?.name || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const profileImage = profile?.profileImage?.[0]?.url;

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-pink-500/20`}>
        {profileImage ? (
          <Image
            src={profileImage}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-pink-400">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {showName && (
        <span className="text-sm text-gray-300">{displayName}</span>
      )}
    </div>
  );
}