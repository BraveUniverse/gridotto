'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Header } from '@/components/layout/Header';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoCoreV2 } from '@/hooks/useGridottoCoreV2';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { 
  TicketIcon, 
  TrophyIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  GiftIcon,
  UserIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfilePage() {
  const { account, isConnected } = useUPProvider();
  const { getUserDrawHistory, getDrawDetails } = useGridottoCoreV2();
  const { getUnclaimedPrizes, getClaimableExecutorFees, claimPrize, claimExecutorFees } = useGridottoContract();
  const [userDraws, setUserDraws] = useState<any[]>([]);
  const [unclaimedPrizes, setUnclaimedPrizes] = useState<any[]>([]);
  const [claimableExecutorFee, setClaimableExecutorFee] = useState('0');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [claimingFees, setClaimingFees] = useState(false);

  useEffect(() => {
    if (account && isConnected) {
      loadUserData();
    }
  }, [account, isConnected]);

  const loadUserData = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      
      // Load user draws
      const drawIds = await getUserDrawHistory(account);
      const drawPromises = drawIds.map(async (drawId: number) => {
        const details = await getDrawDetails(drawId);
        return details ? { ...details, drawId } : null;
      });
      
      const draws = await Promise.all(drawPromises);
      setUserDraws(draws.filter(d => d !== null));
      
      // Load unclaimed prizes
      const prizes = await getUnclaimedPrizes(account);
      setUnclaimedPrizes(prizes);
      
      // Load claimable executor fees
      const fees = await getClaimableExecutorFees(account);
      setClaimableExecutorFee(fees);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPrize = async (drawId: number) => {
    try {
      setClaiming(drawId);
      await claimPrize(drawId);
      // Reload data after claiming
      await loadUserData();
    } catch (error) {
      console.error('Error claiming prize:', error);
    } finally {
      setClaiming(null);
    }
  };

  const handleClaimExecutorFees = async () => {
    try {
      setClaimingFees(true);
      await claimExecutorFees();
      // Reload data after claiming
      await loadUserData();
    } catch (error) {
      console.error('Error claiming executor fees:', error);
    } finally {
      setClaimingFees(false);
    }
  };

  if (!isConnected || !account) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your draws and track your activity</p>
        </div>

        {/* Profile Overview */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <ProfileDisplay address={account} size="lg" />
            <div>
              <p className="text-sm text-gray-400">Wallet Address</p>
              <p className="font-mono text-lg">{account}</p>
            </div>
          </div>
        </div>

        {/* Unclaimed Prizes */}
        {unclaimedPrizes.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <GiftIcon className="w-8 h-8 mr-3 text-yellow-400" />
              Unclaimed Prizes
            </h2>
            <div className="space-y-3">
              {unclaimedPrizes.map((prize) => (
                <div key={prize.drawId} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Draw #{prize.drawId}</p>
                    <p className="text-sm text-gray-400">
                      {prize.isNFT ? 'NFT Prize' : `${Web3.utils.fromWei(prize.amount, 'ether')} LYX`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClaimPrize(prize.drawId)}
                    disabled={claiming === prize.drawId}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      claiming === prize.drawId
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg'
                    }`}
                  >
                    {claiming === prize.drawId ? 'Claiming...' : 'Claim Prize'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claimable Executor Fees */}
        {claimableExecutorFee !== '0' && (
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <BanknotesIcon className="w-8 h-8 mr-3 text-purple-400" />
              Claimable Executor Fees
            </h2>
            <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Total Fees Earned</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Web3.utils.fromWei(claimableExecutorFee, 'ether')} LYX
                </p>
              </div>
              <button
                onClick={handleClaimExecutorFees}
                disabled={claimingFees}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  claimingFees
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg'
                }`}
              >
                {claimingFees ? 'Claiming...' : 'Claim All Fees'}
              </button>
            </div>
          </div>
        )}

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TicketIcon className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{userDraws.length}</span>
            </div>
            <p className="text-gray-400 text-sm">Draws Created</p>
            <p className="text-xl font-bold">Total Draws</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                {userDraws.filter(d => d.isCompleted).length}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Completed Draws</p>
            <p className="text-xl font-bold">Successfully Executed</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">
                {Web3.utils.fromWei(
                  userDraws.reduce((sum, d) => sum + BigInt(d.prizePool || 0), BigInt(0)),
                  'ether'
                )}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Total Prize Pools</p>
            <p className="text-xl font-bold">LYX Distributed</p>
          </div>
        </div>

        {/* Draw History */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <ClockIcon className="w-6 h-6 mr-2" />
            Draw History
          </h2>
          
          {userDraws.length > 0 ? (
            <div className="space-y-4">
              {userDraws.map((draw) => (
                <Link
                  key={draw.drawId}
                  href={`/draws/${draw.drawId}`}
                  className="block bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Draw #{draw.drawId}</p>
                      <p className="text-sm text-gray-400">
                        {draw.isCompleted ? 'Completed' : draw.isCancelled ? 'Cancelled' : 'Active'}
                        {' • '}
                        {new Date(Number(draw.endTime) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Prize Pool</p>
                      <p className="font-semibold">
                        {Web3.utils.fromWei(draw.prizePool || '0', 'ether')} LYX
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No draws created yet</p>
              <Link
                href="/create-draw"
                className="mt-4 inline-block text-primary hover:text-primary-light"
              >
                Create your first draw →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};