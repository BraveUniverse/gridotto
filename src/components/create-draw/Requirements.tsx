'use client';

import { DrawData } from '@/types/create-draw';
import { 
  ShieldCheckIcon,
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface RequirementsProps {
  drawData: DrawData;
  updateDrawData: (data: Partial<DrawData>) => void;
}

const requirementTypes = [
  {
    type: 0,
    name: 'No Requirements',
    description: 'Anyone can participate in this draw',
    icon: ShieldCheckIcon
  },
  {
    type: 1,
    name: 'Token Holder',
    description: 'Participants must hold a specific token',
    icon: CurrencyDollarIcon
  },
  {
    type: 2,
    name: 'Minimum Token Amount',
    description: 'Participants must hold a minimum amount of tokens',
    icon: CurrencyDollarIcon
  }
];

export const Requirements = ({ drawData, updateDrawData }: RequirementsProps) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Participation Requirements</h3>
        <p className="text-sm text-gray-400 mb-6">
          Set requirements that participants must meet to enter your draw
        </p>

        <div className="space-y-4">
          {requirementTypes.map((req) => (
            <label
              key={req.type}
              className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                drawData.requirementType === req.type
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="requirementType"
                value={req.type}
                checked={drawData.requirementType === req.type}
                onChange={() => updateDrawData({ requirementType: req.type })}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <req.icon className="w-5 h-5 text-pink-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-white">{req.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">{req.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Token Configuration */}
        {(drawData.requirementType === 1 || drawData.requirementType === 2) && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token Contract Address
              </label>
              <input
                type="text"
                value={drawData.requiredToken || ''}
                onChange={(e) => updateDrawData({ requiredToken: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
              />
            </div>

            {drawData.requirementType === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Token Amount
                </label>
                <input
                  type="number"
                  value={drawData.minTokenAmount || ''}
                  onChange={(e) => updateDrawData({ minTokenAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="glass-card p-4 border border-yellow-500/30">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">About Requirements</h4>
            <p className="text-xs text-gray-400">
              Requirements help you control who can participate in your draw. Token requirements 
              are checked at the time of ticket purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};