'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import Web3 from 'web3';

const LSP3_PROFILE_SCHEMA = {
  name: '0x671caf3e0f41041a3ac18b71cf7a8e3686c85b063b1db9e11c35c8a62e7c1aed',
  description: '0x9afb723e3b0a7b9c420fb7e730c72ce5580fb045c9dd427752740a5bdb0b5e7f',
  profileImage: '0x4f28c8aff2c48c3f8f2eab036e5e3e4b1b3a6e4e8b5a5f5e5e5e5e5e5e5e5e5e',
  backgroundImage: '0x2c5629cd8b5b1e3b7e4d7f4e8b5a5f5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e',
  tags: '0x3a47ab5bd3a594c3a8995f8fa58d0876cc96461e4e4d7f4e8b5a5f5e5e5e5e5e'
};

interface LSP3ProfileData {
  name?: string;
  description?: string;
  profileImage?: string;
  backgroundImage?: string;
  tags?: string[];
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
        // ERC725 contract ABI for getData
        const erc725ABI = [
          {
            inputs: [{ name: 'dataKey', type: 'bytes32' }],
            name: 'getData',
            outputs: [{ name: '', type: 'bytes' }],
            stateMutability: 'view',
            type: 'function'
          }
        ];

        const contract = new web3.eth.Contract(erc725ABI, address);
        
        // Fetch profile data
        const [nameData, descriptionData] = await Promise.all([
          contract.methods.getData(LSP3_PROFILE_SCHEMA.name).call().catch(() => '0x'),
          contract.methods.getData(LSP3_PROFILE_SCHEMA.description).call().catch(() => '0x')
        ]);

        const profile: LSP3ProfileData = {};

        // Decode name
        if (nameData && nameData !== '0x' && typeof nameData === 'string') {
          try {
            profile.name = web3.utils.hexToUtf8(nameData);
          } catch (e) {
            console.error('Error decoding name:', e);
          }
        }

        // Decode description
        if (descriptionData && descriptionData !== '0x' && typeof descriptionData === 'string') {
          try {
            profile.description = web3.utils.hexToUtf8(descriptionData);
          } catch (e) {
            console.error('Error decoding description:', e);
          }
        }

        setProfileData(profile);
      } catch (err: any) {
        console.error('Error fetching LSP3 profile:', err);
        setError(err.message || 'Failed to fetch profile');
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address, web3]);

  return { profileData, loading, error };
}; 