'use client';

import { useUPProvider } from '@/hooks/useUPProvider';
import { useState } from 'react';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { 
  WalletIcon, 
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export const ConnectButton = () => {
  const { isConnected, account, contextAccount, refreshConnection } = useUPProvider();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await refreshConnection();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
        <ProfileDisplay address={account} size="sm" showName={true} />
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:from-primary/80 hover:to-purple-600/80 transition-all disabled:opacity-50"
    >
      {connecting ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-sm font-medium">Connecting...</span>
        </>
      ) : (
        <>
          <WalletIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Connect</span>
        </>
      )}
    </button>
  );
};