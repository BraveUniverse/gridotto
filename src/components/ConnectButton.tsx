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
import toast from 'react-hot-toast';

export const ConnectButton = () => {
  const { isConnected, account, connect, disconnect, isCorrectChain, switchNetwork } = useUPProvider();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
      
      // Check if on correct chain
      if (!isCorrectChain) {
        toast.error('Please switch to LUKSO Testnet');
        try {
          await switchNetwork(4201);
        } catch (err) {
          console.error('Failed to switch network:', err);
        }
      } else {
        toast.success('Wallet connected successfully');
      }
    } catch (error: any) {
      console.error('Failed to connect:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        {!isCorrectChain && (
          <button
            onClick={() => switchNetwork(4201)}
            className="flex items-center gap-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all text-sm"
          >
            <ExclamationCircleIcon className="w-4 h-4" />
            Wrong Network
          </button>
        )}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
          <ProfileDisplay address={account} size="sm" showName={true} />
          <button
            onClick={handleDisconnect}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
            title="Disconnect"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
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