'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUPProvider } from '@/hooks/useUPProvider';

interface LSP3Profile {
  name?: string;
  description?: string;
  profileImage?: Array<{
    url: string;
    width: number;
    height: number;
    verification?: {
      method: string;
      data: string;
    };
  }>;
  backgroundImage?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  tags?: string[];
  links?: Array<{
    title: string;
    url: string;
  }>;
}

interface ProfileDisplayProps {
  address: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  showTags?: boolean;
  className?: string;
}

export const ProfileDisplay = ({ 
  address, 
  size = 'medium', 
  showName = true, 
  showTags = false,
  className = '' 
}: ProfileDisplayProps) => {
  const { web3 } = useUPProvider();
  const [profile, setProfile] = useState<LSP3Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sizeMap = {
    small: { image: 40, text: 'text-sm' },
    medium: { image: 60, text: 'text-base' },
    large: { image: 100, text: 'text-lg' }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!web3 || !address) return;

      try {
        setLoading(true);
        setError(null);

        // Import ERC725 dynamically
        const { ERC725 } = await import('@erc725/erc725.js');
        
        // LSP3 Profile Schema
        const LSP3Schema = [
          {
            name: 'LSP3Profile',
            key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
            keyType: 'Singleton',
            valueType: 'bytes',
            valueContent: 'VerifiableURI'
          }
        ];

        const erc725 = new ERC725(LSP3Schema, address, web3.currentProvider);
        const profileData = await erc725.fetchData('LSP3Profile');

        if (profileData?.value) {
          // Decode the VerifiableURI
          const url = profileData.value as string;
          
          // Fetch metadata from IPFS or URL
          if (url.startsWith('ipfs://')) {
            const ipfsUrl = url.replace('ipfs://', 'https://api.universalprofile.cloud/ipfs/');
            const response = await fetch(ipfsUrl);
            const metadata = await response.json();
            setProfile(metadata.LSP3Profile || metadata);
          } else {
            const response = await fetch(url);
            const metadata = await response.json();
            setProfile(metadata.LSP3Profile || metadata);
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [web3, address]);

  const getImageUrl = (image: any) => {
    if (!image?.url) return null;
    if (image.url.startsWith('ipfs://')) {
      return image.url.replace('ipfs://', 'https://api.universalprofile.cloud/ipfs/');
    }
    return image.url;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div 
          className="rounded-full bg-white/10 animate-pulse"
          style={{ 
            width: sizeMap[size].image, 
            height: sizeMap[size].image 
          }}
        />
        {showName && (
          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
        )}
      </div>
    );
  }

  const profileImage = profile?.profileImage?.[0];
  const imageUrl = profileImage ? getImageUrl(profileImage) : null;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Profile Image */}
      <div 
        className="relative rounded-full overflow-hidden bg-gradient-to-br from-[#FF2975] to-[#FF2975]/50"
        style={{ 
          width: sizeMap[size].image, 
          height: sizeMap[size].image 
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={profile?.name || 'Profile'}
            width={sizeMap[size].image}
            height={sizeMap[size].image}
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {profile?.name?.[0]?.toUpperCase() || address[2].toUpperCase()}
          </div>
        )}
      </div>

      {/* Profile Info */}
      {showName && (
        <div className="flex flex-col">
          <span className={`font-semibold text-white ${sizeMap[size].text}`}>
            {profile?.name || formatAddress(address)}
          </span>
          {profile?.description && size !== 'small' && (
            <span className="text-gray-400 text-sm line-clamp-1">
              {profile.description}
            </span>
          )}
          {showTags && profile?.tags && profile.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {profile.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 bg-[#FF2975]/20 text-[#FF2975] text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};