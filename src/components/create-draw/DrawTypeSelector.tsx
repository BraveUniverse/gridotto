'use client';

import { 
  CurrencyDollarIcon,
  PhotoIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import { DrawData } from '@/types';

interface DrawTypeSelectorProps {
  drawData: DrawData;
  updateDrawData: (data: Partial<DrawData>) => void;
}

const drawTypes = [
  {
    type: 'LYX' as const,
    name: 'LYX Draw',
    description: 'Create a lottery with native LYX tokens as prizes',
    icon: CurrencyDollarIcon,
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Native LYX prizes', 'Automatic pool growth', 'Instant payouts']
  },
  {
    type: 'TOKEN' as const,
    name: 'Token Draw',
    description: 'Use any LSP7 token as prize for your lottery',
    icon: CircleStackIcon,
    gradient: 'from-purple-500 to-pink-500',
    features: ['LSP7 token support', 'Custom token prizes', 'ERC20 compatible']
  },
  {
    type: 'NFT' as const,
    name: 'NFT Draw',
    description: 'Give away NFTs through lottery system',
    icon: PhotoIcon,
    gradient: 'from-orange-500 to-red-500',
    features: ['LSP8 NFT support', 'Multiple NFT prizes', 'Collectible giveaways']
  }
];

export const DrawTypeSelector = ({ drawData, updateDrawData }: DrawTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drawTypes.map((drawType) => (
          <button
            key={drawType.type}
            onClick={() => updateDrawData({ drawType: drawType.type })}
            className={`
              relative group text-left transition-all duration-300
              ${drawData.drawType === drawType.type 
                ? 'scale-105' 
                : 'hover:scale-105'
              }
            `}
          >
            <div className={`
              glass-card p-6 h-full
              ${drawData.drawType === drawType.type 
                ? 'border-2 border-[rgb(var(--primary))]' 
                : 'border border-white/10'
              }
            `}>
              {/* Selected Indicator */}
              {drawData.drawType === drawType.type && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[rgb(var(--primary))] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${drawType.gradient} p-4 mb-4 group-hover:scale-110 transition-transform`}>
                <drawType.icon className="w-full h-full text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">{drawType.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{drawType.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {drawType.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>

      {/* Additional Info */}
      {drawData.drawType && (
        <div className="glass-card p-4 border border-[rgb(var(--primary))/30]">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary))/20] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-1">What happens next?</h4>
              <p className="text-xs text-gray-400">
                {drawData.drawType === 'LYX' && 'You\'ll set the initial prize pool amount. The pool will grow as participants buy tickets.'}
                {drawData.drawType === 'TOKEN' && 'You\'ll need to specify the token contract address and the prize amount.'}
                {drawData.drawType === 'NFT' && 'You\'ll need to provide the NFT contract address and select which NFTs to give away.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};