import { useState, useEffect } from 'react';
import { ERC725 } from '@erc725/erc725.js';
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';

const RPC_ENDPOINT = 'https://rpc.mainnet.lukso.network';
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs';

export interface ProfileData {
  name?: string;
  description?: string;
  profileImage?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  backgroundImage?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  tags?: string[];
}

export function useProfile(address: string | undefined) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[useProfile] Fetching profile for address:', address);

        const erc725 = new ERC725(
          lsp3ProfileSchema,
          address,
          RPC_ENDPOINT,
          {
            ipfsGateway: IPFS_GATEWAY,
          }
        );

        const profileData = await erc725.fetchData('LSP3Profile');
        console.log('[useProfile] Profile data received:', profileData);
        
        if (profileData && profileData.value) {
          const profile = profileData.value as ProfileData;
          console.log('[useProfile] Profile name:', profile.name);
          setProfile(profile);
        } else {
          console.log('[useProfile] No profile data found');
          setProfile(null);
        }
      } catch (err) {
        console.error('[useProfile] Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  return { profile, loading, error };
}

// Helper function to get profile image URL
export function getProfileImageUrl(profile: ProfileData | null): string | null {
  if (!profile?.profileImage?.[0]?.url) return null;
  
  const imageUrl = profile.profileImage[0].url;
  
  // Handle IPFS URLs
  if (imageUrl.startsWith('ipfs://')) {
    return imageUrl.replace('ipfs://', `${IPFS_GATEWAY}/`);
  }
  
  return imageUrl;
}