'use client';

import { useState, useEffect } from 'react';
import { useUPProvider } from '@/hooks/useUPProvider';
import { useGridottoAdmin } from '@/hooks/useGridottoAdmin';
import { 
  ShieldCheckIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { account, isConnected } = useUPProvider();
  const { 
    pauseSystem,
    unpauseSystem,
    withdrawPlatformFees,
    setFeePercentages,
    getSystemStats,
    checkIsAdmin,
    loading: contractLoading
  } = useGridottoAdmin();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDrawsCreated: '0',
    totalTicketsSold: '0',
    totalPrizesDistributed: '0',
    totalExecutions: '0'
  });
  const [isPaused, setIsPaused] = useState(false);
  const [fees, setFees] = useState({
    defaultPlatformFee: 500, // 5%
    executorFeePercent: 500, // 5%
    monthlyPoolPercent: 200, // 2%
    weeklyMonthlyPercent: 2000 // 20%
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!account || contractLoading) {
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await checkIsAdmin(account);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          await loadAdminStats();
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [account, contractLoading]);

  const loadAdminStats = async () => {
    try {
      const systemStats = await getSystemStats();
      if (systemStats) {
        setStats({
          totalDrawsCreated: systemStats.totalDrawsCreated.toString(),
          totalTicketsSold: systemStats.totalTicketsSold.toString(),
          totalPrizesDistributed: Web3.utils.fromWei(systemStats.totalPrizesDistributed.toString(), 'ether'),
          totalExecutions: systemStats.totalExecutions.toString()
        });
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
    }
  };

  const handlePauseToggle = async () => {
    try {
      if (isPaused) {
        await unpauseSystem();
        setIsPaused(false);
        toast.success('System unpaused successfully');
      } else {
        await pauseSystem();
        setIsPaused(true);
        toast.success('System paused successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle pause state');
    }
  };

  const handleWithdrawFees = async () => {
    try {
      await withdrawPlatformFees();
      toast.success('Platform fees withdrawn successfully');
      await loadAdminStats();
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw fees');
    }
  };

  const handleUpdateFees = async () => {
    try {
      await setFeePercentages(
        fees.defaultPlatformFee,
        fees.executorFeePercent,
        fees.monthlyPoolPercent,
        fees.weeklyMonthlyPercent
      );
      toast.success('Fee percentages updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update fees');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-400">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading || contractLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You do not have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-3">
            <ShieldCheckIcon className="w-12 h-12 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-400">Manage the Gridotto platform</p>
        </div>

        {/* System Status */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CogIcon className="w-6 h-6" />
            System Status
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-2">Current Status</p>
              <div className="flex items-center gap-2">
                {isPaused ? (
                  <>
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">System Paused</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">System Active</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handlePauseToggle}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isPaused
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isPaused ? 'Unpause System' : 'Pause System'}
            </button>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <ChartBarIcon className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-gray-400 text-sm">Total Draws</p>
            <p className="text-2xl font-bold text-white">{stats.totalDrawsCreated}</p>
          </div>
          <div className="glass-card p-6">
            <ChartBarIcon className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-gray-400 text-sm">Tickets Sold</p>
            <p className="text-2xl font-bold text-white">{stats.totalTicketsSold}</p>
          </div>
          <div className="glass-card p-6">
            <CurrencyDollarIcon className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-gray-400 text-sm">Prizes Distributed</p>
            <p className="text-2xl font-bold text-white">{stats.totalPrizesDistributed} LYX</p>
          </div>
          <div className="glass-card p-6">
            <ChartBarIcon className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-gray-400 text-sm">Total Executions</p>
            <p className="text-2xl font-bold text-white">{stats.totalExecutions}</p>
          </div>
        </div>

        {/* Fee Management */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6" />
            Fee Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 mb-2">Default Platform Fee (%)</label>
              <input
                type="number"
                value={fees.defaultPlatformFee / 100}
                onChange={(e) => setFees({ ...fees, defaultPlatformFee: Number(e.target.value) * 100 })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                min="0"
                max="20"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Executor Fee (%)</label>
              <input
                type="number"
                value={fees.executorFeePercent / 100}
                onChange={(e) => setFees({ ...fees, executorFeePercent: Number(e.target.value) * 100 })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Monthly Pool (%)</label>
              <input
                type="number"
                value={fees.monthlyPoolPercent / 100}
                onChange={(e) => setFees({ ...fees, monthlyPoolPercent: Number(e.target.value) * 100 })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Weekly to Monthly (%)</label>
              <input
                type="number"
                value={fees.weeklyMonthlyPercent / 100}
                onChange={(e) => setFees({ ...fees, weeklyMonthlyPercent: Number(e.target.value) * 100 })}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white"
                min="0"
                max="30"
                step="0.1"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateFees}
            className="mt-6 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-all"
          >
            Update Fee Percentages
          </button>
        </div>

        {/* Withdraw Fees */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6" />
            Platform Fees
          </h2>
          <p className="text-gray-400 mb-4">
            Withdraw accumulated platform fees to the admin wallet.
          </p>
          <button
            onClick={handleWithdrawFees}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all"
          >
            Withdraw Platform Fees
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;