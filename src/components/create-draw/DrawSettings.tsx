'use client';

import { DrawData } from '@/types';

interface DrawSettingsProps {
  drawData: DrawData;
  updateDrawData: (data: Partial<DrawData>) => void;
}

export function DrawSettings({ drawData, updateDrawData }: DrawSettingsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Draw Settings</h2>
        <p className="text-gray-400 mb-8">Configure the basic parameters for your draw</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ticket Price (LYX)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={drawData.ticketPrice || ''}
            onChange={(e) => updateDrawData({ ticketPrice: parseFloat(e.target.value) || 0.01 })}
            className="input-glass w-full"
            placeholder="0.01"
          />
          <p className="text-xs text-gray-400 mt-1">
            Minimum 0.01 LYX per ticket
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duration (days)
          </label>
          <select
            value={drawData.duration}
            onChange={(e) => updateDrawData({ duration: parseInt(e.target.value) })}
            className="input-glass w-full"
          >
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        {/* Max Tickets */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximum Tickets
          </label>
          <input
            type="number"
            min="0"
            value={drawData.maxTickets || ''}
            onChange={(e) => {
              const value = e.target.value;
              updateDrawData({ maxTickets: value === '' ? 0 : parseInt(value) });
            }}
            className="input-glass w-full"
            placeholder="0"
          />
          <p className="text-xs text-gray-400 mt-1">
            Leave as 0 for unlimited tickets
          </p>
        </div>

        {/* Winner Count - Only for NFT draws with multiple tokens */}
        {drawData.drawType === 'NFT' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Winners
            </label>
            <input
              type="number"
              min="1"
              max={drawData.tokenIds?.length || 1}
              value={drawData.winnerCount || 1}
              onChange={(e) => updateDrawData({ winnerCount: parseInt(e.target.value) || 1 })}
              className="input-glass w-full"
              disabled={!drawData.tokenIds || drawData.tokenIds.length <= 1}
            />
            <p className="text-xs text-gray-400 mt-1">
              {drawData.tokenIds && drawData.tokenIds.length > 1 
                ? `You have ${drawData.tokenIds.length} NFTs. Each winner gets one NFT.`
                : 'Add multiple NFTs to have multiple winners'}
            </p>
          </div>
        )}

        {/* Winner Count - For other draw types */}
        {drawData.drawType !== 'NFT' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Winners
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={drawData.winnerCount || 1}
              onChange={(e) => updateDrawData({ winnerCount: parseInt(e.target.value) || 1 })}
              className="input-glass w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Prize will be split equally among winners
            </p>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings (Optional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Min Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Participants
            </label>
            <input
              type="number"
              min="0"
              value={drawData.minParticipants || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateDrawData({ minParticipants: value === '' ? 0 : parseInt(value) });
              }}
              className="input-glass w-full"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">
              Draw will only execute if this many people join (0 = no minimum)
            </p>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Participants
            </label>
            <input
              type="number"
              min="0"
              value={drawData.maxParticipants || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateDrawData({ maxParticipants: value === '' ? 0 : parseInt(value) });
              }}
              className="input-glass w-full"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">
              Limit the number of unique participants (0 = unlimited)
            </p>
          </div>

          {/* Max Tickets Per User */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Tickets Per User
            </label>
            <input
              type="number"
              min="0"
              value={drawData.maxTicketsPerUser || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateDrawData({ maxTicketsPerUser: value === '' ? 0 : parseInt(value) });
              }}
              className="input-glass w-full"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">
              Limit tickets per participant (0 = unlimited)
            </p>
          </div>

          {/* Platform Fee Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform Fee
            </label>
            <div className="input-glass w-full bg-gray-800 cursor-not-allowed">
              <span className="text-gray-400">5% (Fixed)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Automatically deducted from ticket sales
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          <strong>Fee Structure:</strong> 
          <br />• Platform Fee: 5% (goes to platform)
          <br />• Executor Fee: 5% (reward for executing the draw)
          <br />• Monthly Pool: 2% (for user draws) or 20% (for weekly draws)
          <br />• Prize Pool: Remaining amount after fees
        </p>
      </div>
    </div>
  );
}