'use client';

import { useState, useEffect } from 'react';
import { useGridottoContract } from '@/hooks/useGridottoContract';
import { useUPProvider } from '@/hooks/useUPProvider';
import { 
  ShieldCheckIcon, 
  BanknotesIcon, 
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  CogIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Web3 from 'web3';

const AdminPage = () => {
  const { account } = useUPProvider();
  const { contract } = useGridottoContract();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: '0',
    weeklyPrize: '0',
    monthlyPrize: '0',
    totalUsers: 0,
    totalDraws: 0,
    pendingWithdrawals: '0'
  });
  const [adminActions, setAdminActions] = useState({
    withdrawAmount: '',
    newTicketPrice: '',
    emergencyPause: false
  });
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!contract || !account) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const adminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
        const hasRole = await contract.methods.hasRole(adminRole, account).call();
        setIsAdmin(hasRole);

        if (hasRole) {
          // Load admin stats
          await loadAdminStats();
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [contract, account]);

  const loadAdminStats = async () => {
    if (!contract) return;

    try {
      const [
        balance,
        weeklyPrize,
        monthlyPrize,
        ticketPrice
      ] = await Promise.all([
        contract.methods.getContractBalance().call(),
        contract.methods.getCurrentDrawPrize().call(),
        contract.methods.getMonthlyPrize().call(),
        contract.methods.getTicketPrice().call()
      ]);

      setStats({
        totalBalance: balance,
        weeklyPrize,
        monthlyPrize,
        totalUsers: 0, // This would need a specific method
        totalDraws: 0, // This would need a specific method
        pendingWithdrawals: '0'
      });

      setAdminActions(prev => ({
        ...prev,
        newTicketPrice: Web3.utils.fromWei(ticketPrice, 'ether')
      }));
    } catch (err) {
      console.error('Error loading admin stats:', err);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !account || !adminActions.withdrawAmount) return;

    setProcessing(true);
    setMessage(null);

    try {
      const amount = Web3.utils.toWei(adminActions.withdrawAmount, 'ether');
      await contract.methods.adminWithdraw(amount).send({ from: account });
      
      setMessage({ type: 'success', text: 'Withdrawal successful!' });
      setAdminActions(prev => ({ ...prev, withdrawAmount: '' }));
      await loadAdminStats();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Withdrawal failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateTicketPrice = async () => {
    if (!contract || !account || !adminActions.newTicketPrice) return;

    setProcessing(true);
    setMessage(null);

    try {
      const price = Web3.utils.toWei(adminActions.newTicketPrice, 'ether');
      await contract.methods.setTicketPrice(price).send({ from: account });
      
      setMessage({ type: 'success', text: 'Ticket price updated!' });
      await loadAdminStats();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Update failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleEmergencyPause = async () => {
    if (!contract || !account) return;

    setProcessing(true);
    setMessage(null);

    try {
      if (adminActions.emergencyPause) {
        await contract.methods.unpause().send({ from: account });
        setMessage({ type: 'success', text: 'Contract unpaused!' });
      } else {
        await contract.methods.pause().send({ from: account });
        setMessage({ type: 'success', text: 'Contract paused!' });
      }
      
      setAdminActions(prev => ({ ...prev, emergencyPause: !prev.emergencyPause }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 max-w-md text-center">
          <ShieldCheckIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheckIcon className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <BanknotesIcon className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-400">Contract Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Web3.utils.fromWei(stats.totalBalance, 'ether')} LYX
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-400">Weekly Prize</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Web3.utils.fromWei(stats.weeklyPrize, 'ether')} LYX
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-gray-400">Monthly Prize</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Web3.utils.fromWei(stats.monthlyPrize, 'ether')} LYX
            </p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdraw Funds */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ArrowDownTrayIcon className="w-6 h-6 text-green-400" />
              Withdraw Funds
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (LYX)
                </label>
                <input
                  type="number"
                  value={adminActions.withdrawAmount}
                  onChange={(e) => setAdminActions(prev => ({ ...prev, withdrawAmount: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="0.0"
                  step="0.01"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={processing || !adminActions.withdrawAmount}
                className="w-full btn-primary"
              >
                {processing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>

          {/* Update Settings */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CogIcon className="w-6 h-6 text-blue-400" />
              Update Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ticket Price (LYX)
                </label>
                <input
                  type="number"
                  value={adminActions.newTicketPrice}
                  onChange={(e) => setAdminActions(prev => ({ ...prev, newTicketPrice: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="0.01"
                  step="0.01"
                />
              </div>
              <button
                onClick={handleUpdateTicketPrice}
                disabled={processing || !adminActions.newTicketPrice}
                className="w-full btn-primary"
              >
                {processing ? 'Processing...' : 'Update Price'}
              </button>
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              Emergency Controls
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Pause or unpause all contract operations in case of emergency.
              </p>
              <button
                onClick={handleEmergencyPause}
                disabled={processing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  adminActions.emergencyPause
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {processing ? 'Processing...' : adminActions.emergencyPause ? 'Unpause Contract' : 'Pause Contract'}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-white" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-white" />
            )}
            <span className="text-white">{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;