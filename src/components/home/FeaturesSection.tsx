'use client';

import { 
  CurrencyDollarIcon,
  PhotoIcon,
  UsersIcon,
  TrophyIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: CurrencyDollarIcon,
    title: 'Multi-Asset Support',
    description: 'Create draws with LYX, LSP7 tokens, or LSP8 NFTs. Full flexibility for any asset type.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: PhotoIcon,
    title: 'NFT Lotteries',
    description: 'Run exclusive NFT giveaways. Perfect for artists and collectors on LUKSO.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: UsersIcon,
    title: 'Social Features',
    description: 'Buy tickets for friends, follow creators, and build your lottery community.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: TrophyIcon,
    title: 'Multi-Winner Draws',
    description: 'Configure up to 100 winners with custom tier-based prize distribution.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'VIP Pass Benefits',
    description: 'Exclusive perks for VIP Pass holders including bonus tickets and special access.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: BoltIcon,
    title: 'Instant Settlement',
    description: 'Winners receive prizes immediately after draw execution. No waiting periods.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: ChartBarIcon,
    title: 'Transparent Analytics',
    description: 'Real-time statistics and complete draw history. Full transparency on-chain.',
    gradient: 'from-teal-500 to-blue-500'
  },
  {
    icon: GlobeAltIcon,
    title: 'Decentralized Platform',
    description: 'Fully decentralized on LUKSO blockchain. No central authority or control.',
    gradient: 'from-pink-500 to-rose-500'
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-6">
            <BoltIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Powered by Diamond Contract</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need in <span className="gradient-text">One Platform</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built with the latest Web3 technology to provide the most advanced lottery experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 group hover:scale-105 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a 
            href="/docs" 
            className="inline-flex items-center space-x-2 text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-light))] transition-colors"
          >
            <span>Learn more about our features</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};