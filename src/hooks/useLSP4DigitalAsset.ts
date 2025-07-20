'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from './useUPProvider';
import { fetchLSP4Metadata, LSP4Metadata } from '@/utils/fetchLSPMetadata';

export const useLSP4DigitalAsset = (assetAddress: string | null) => {
  const { web3 } = useUPProvider();
  const [metadata, setMetadata] = useState<LSP4Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      if (!assetAddress || !web3) {
        setMetadata(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const assetMetadata = await fetchLSP4Metadata(assetAddress, web3.currentProvider);
        setMetadata(assetMetadata);
      } catch (err: any) {
        console.error('Error fetching LSP4 metadata:', err);
        setError(err.message || 'Failed to fetch metadata');
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [assetAddress, web3]);

  return { metadata, loading, error };
};