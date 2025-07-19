'use client';

import { DrawData } from '@/app/create-draw/page';
import { Switch } from '@headlessui/react';
import { 
  StarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface RequirementsProps {
  drawData: DrawData;
  updateDrawData: (data: Partial<DrawData>) => void;
}

export const Requirements = ({ drawData, updateDrawData }: RequirementsProps) => {
  return (
    <div className="space-y-6">
      {/* VIP Requirement */}
      <div className="glass-card p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 p-3 flex-shrink-0">
            <StarIcon className="w-full h-full text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-white">VIP Pass Requirement</h3>
              <Switch
                checked={drawData.requireVIP}
                onChange={(checked) => updateDrawData({ requireVIP: checked })}
                className={`${
                  drawData.requireVIP ? 'bg-[rgb(var(--primary))]' : 'bg-white/20'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Require VIP Pass</span>
                <span
                  className={`${
                    drawData.requireVIP ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Only VIP Pass holders can participate in this draw
            </p>
            
            {drawData.requireVIP && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum VIP Tier
                </label>
                <select
                  value={drawData.vipTier || 1}
                  onChange={(e) => updateDrawData({ vipTier: parseInt(e.target.value) })}
                  className="input-glass w-full"
                >
                  <option value={1}>Tier 1 (Bronze)</option>
                  <option value={2}>Tier 2 (Silver)</option>
                  <option value={3}>Tier 3 (Gold)</option>
                  <option value={4}>Tier 4 (Platinum)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Following Requirement */}
      <div className="glass-card p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-3 flex-shrink-0">
            <UserGroupIcon className="w-full h-full text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-white">Following Requirement</h3>
              <Switch
                checked={drawData.requireFollowing}
                onChange={(checked) => updateDrawData({ requireFollowing: checked })}
                className={`${
                  drawData.requireFollowing ? 'bg-[rgb(var(--primary))]' : 'bg-white/20'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Require Following</span>
                <span
                  className={`${
                    drawData.requireFollowing ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Participants must follow you to enter the draw
            </p>
            
            {drawData.requireFollowing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Follower Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={drawData.minFollowers || 0}
                  onChange={(e) => updateDrawData({ minFollowers: parseInt(e.target.value) || 0 })}
                  className="input-glass w-full"
                  placeholder="0 (no minimum)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Set to 0 for no minimum follower requirement
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Token Holding Requirement */}
      <div className="glass-card p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-3 flex-shrink-0">
            <CurrencyDollarIcon className="w-full h-full text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-white">Token Holding Requirement</h3>
              <Switch
                checked={drawData.requireToken}
                onChange={(checked) => updateDrawData({ requireToken: checked })}
                className={`${
                  drawData.requireToken ? 'bg-[rgb(var(--primary))]' : 'bg-white/20'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Require Token Holding</span>
                <span
                  className={`${
                    drawData.requireToken ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Participants must hold a specific token to enter
            </p>
            
            {drawData.requireToken && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Required Token Address
                  </label>
                  <input
                    type="text"
                    value={drawData.requiredToken || ''}
                    onChange={(e) => updateDrawData({ requiredToken: e.target.value })}
                    className="input-glass w-full"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Token Amount
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={drawData.minTokenAmount || ''}
                    onChange={(e) => updateDrawData({ minTokenAmount: parseFloat(e.target.value) || 0 })}
                    className="input-glass w-full"
                    placeholder="Enter minimum amount"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="glass-card p-4 border border-blue-500/30">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">About Requirements</h4>
            <p className="text-xs text-gray-400">
              Requirements help you create exclusive draws for specific communities. 
              Participants must meet all enabled requirements to buy tickets. 
              This is great for rewarding loyal followers or token holders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};