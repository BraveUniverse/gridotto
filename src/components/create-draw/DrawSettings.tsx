'use client';

import { useState } from 'react';
import { DrawData } from '@/types/create-draw';
import { Switch } from '@headlessui/react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DrawSettingsProps {
  drawData: DrawData;
  updateDrawData: (data: Partial<DrawData>) => void;
}

export const DrawSettings = ({ drawData, updateDrawData }: DrawSettingsProps) => {
  const [newTier, setNewTier] = useState({ position: 1, percentage: 100 });

  const handleAddTier = () => {
    const currentTiers = drawData.tiers || [];
    if (currentTiers.length < (drawData.winnerCount || 1)) {
      updateDrawData({
        tiers: [...currentTiers, { ...newTier }]
      });
      setNewTier({ position: currentTiers.length + 2, percentage: 0 });
    }
  };

  const handleRemoveTier = (index: number) => {
    const currentTiers = drawData.tiers || [];
    updateDrawData({
      tiers: currentTiers.filter((_, i) => i !== index)
    });
  };

  const totalPercentage = (drawData.tiers || []).reduce((sum, tier) => sum + tier.percentage, 0);

  return (
    <div className="space-y-6">
      {/* Ticket Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ticket Price (LYX)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={drawData.ticketPrice}
            onChange={(e) => updateDrawData({ ticketPrice: parseFloat(e.target.value) || 0.01 })}
            className="input-glass w-full pr-16"
            placeholder="0.1"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            LYX
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Lower prices attract more participants
        </p>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Draw Duration
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 3, 7, 14].map((days) => (
            <button
              key={days}
              onClick={() => updateDrawData({ duration: days })}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                drawData.duration === days
                  ? 'bg-[rgb(var(--primary))] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {days} {days === 1 ? 'Day' : 'Days'}
            </button>
          ))}
        </div>
        <div className="mt-2">
          <input
            type="number"
            min="1"
            max="30"
            value={drawData.duration}
            onChange={(e) => updateDrawData({ duration: parseInt(e.target.value) || 1 })}
            className="input-glass w-full"
            placeholder="Custom duration in days"
          />
        </div>
      </div>

      {/* Max Tickets */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Maximum Tickets
        </label>
        <input
          type="number"
          min="10"
          value={drawData.maxTickets}
          onChange={(e) => updateDrawData({ maxTickets: parseInt(e.target.value) || 10 })}
          className="input-glass w-full"
          placeholder="10000"
        />
        <p className="text-xs text-gray-400 mt-1">
          Limit the total number of tickets that can be sold
        </p>
      </div>

      {/* Multi-Winner Toggle */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white">Multi-Winner Draw</h3>
            <p className="text-xs text-gray-400 mt-1">
              Enable to have multiple winners with tiered prizes
            </p>
          </div>
          <Switch
            checked={drawData.isMultiWinner}
            onChange={(checked) => updateDrawData({ 
              isMultiWinner: checked,
              winnerCount: checked ? 3 : 1,
              tiers: checked ? [
                { position: 1, percentage: 50 },
                { position: 2, percentage: 30 },
                { position: 3, percentage: 20 }
              ] : undefined
            })}
            className={`${
              drawData.isMultiWinner ? 'bg-[rgb(var(--primary))]' : 'bg-white/20'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Enable multi-winner</span>
            <span
              className={`${
                drawData.isMultiWinner ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {/* Winner Configuration */}
        {drawData.isMultiWinner && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Winners
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={drawData.winnerCount}
                onChange={(e) => updateDrawData({ winnerCount: parseInt(e.target.value) || 2 })}
                className="input-glass w-full"
              />
            </div>

            {/* Prize Distribution */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prize Distribution
              </label>
              <div className="space-y-2">
                {(drawData.tiers || []).map((tier, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400 w-20">
                      Position {tier.position}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tier.percentage}
                      onChange={(e) => {
                        const newTiers = [...(drawData.tiers || [])];
                        newTiers[index] = { ...tier, percentage: parseInt(e.target.value) || 0 };
                        updateDrawData({ tiers: newTiers });
                      }}
                      className="input-glass flex-1"
                    />
                    <span className="text-sm text-gray-400 w-8">%</span>
                    <button
                      onClick={() => handleRemoveTier(index)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {(drawData.tiers || []).length < (drawData.winnerCount || 1) && (
                  <button
                    onClick={handleAddTier}
                    className="w-full py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Tier</span>
                  </button>
                )}

                {/* Total Percentage */}
                <div className={`text-sm ${totalPercentage === 100 ? 'text-green-400' : 'text-red-400'}`}>
                  Total: {totalPercentage}% {totalPercentage !== 100 && '(must equal 100%)'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};