'use client';

import { Header } from '@/components/Header';
import { 
  SparklesIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  UserGroupIcon,
  TrophyIcon,
  LightBulbIcon,
  ChartBarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: CubeTransparentIcon,
    title: 'Diamond Contract Architecture',
    description: 'Built on the EIP-2535 Diamond Standard for maximum flexibility and upgradeability, ensuring long-term sustainability.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Fully Decentralized',
    description: 'All draws are executed on-chain with verifiable randomness, ensuring complete transparency and fairness.'
  },
  {
    icon: UserGroupIcon,
    title: 'Community-Driven',
    description: 'Anyone can create their own lottery draws with custom prizes, rules, and participation requirements.'
  },
  {
    icon: TrophyIcon,
    title: 'Multi-Winner Support',
    description: 'Flexible prize distribution models including winner-takes-all, tiered prizes, and equal distribution.'
  }
];

const stats = [
  { label: 'Smart Contracts', value: '4+', description: 'Modular facets' },
  { label: 'Draw Types', value: '3', description: 'LYX, Token, NFT' },
  { label: 'Prize Models', value: '4', description: 'Distribution options' },
  { label: 'Network', value: 'LUKSO', description: 'Blockchain platform' }
];

const facets = [
  {
    name: 'GridottoFacet',
    description: 'Core lottery functionality including ticket purchases and draw execution',
    functions: ['buyTicket', 'executeDraw', 'getCurrentDrawInfo']
  },
  {
    name: 'Phase3Facet',
    description: 'User-created draws with token prizes and advanced features',
    functions: ['createTokenDraw', 'createNFTDraw', 'buyTokenDrawTicket']
  },
  {
    name: 'Phase4Facet',
    description: 'Multi-winner draws with flexible prize distribution models',
    functions: ['createAdvancedDraw', 'setPrizeDistribution', 'executeMultiWinnerDraw']
  },
  {
    name: 'AdminFacet',
    description: 'Administrative functions for platform management',
    functions: ['updateFees', 'pauseContract', 'withdrawFees']
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Gridotto</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A next-generation decentralized lottery platform built on LUKSO blockchain, 
            powered by the innovative Diamond Contract architecture.
          </p>
        </div>

        {/* Mission Section */}
        <div className="glass-card p-8 md:p-12 mb-16">
          <div className="flex items-center gap-4 mb-6">
            <LightBulbIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            Gridotto revolutionizes the lottery experience by combining the transparency of blockchain technology 
            with the flexibility of community-driven draws. We believe in creating a fair, transparent, and 
            accessible lottery platform where anyone can participate or create their own draws.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            Built on LUKSO's advanced blockchain infrastructure and utilizing the EIP-2535 Diamond Standard, 
            Gridotto offers unparalleled flexibility, upgradeability, and user experience in the decentralized 
            lottery space.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="text-primary">Gridotto</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-8 hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass-card p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-white font-medium mb-1">{stat.label}</p>
                <p className="text-sm text-gray-400">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diamond Architecture Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-12 justify-center">
            <CodeBracketIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-white">Diamond Contract Architecture</h2>
          </div>
          
          <div className="glass-card p-8 mb-8">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Gridotto is built using the EIP-2535 Diamond Standard, a revolutionary smart contract architecture 
              that allows for modular, upgradeable, and gas-efficient contracts. This architecture enables us to:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Add new features without redeploying the entire system</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Fix bugs and optimize gas costs seamlessly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Maintain a single contract address for all functionality</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Ensure long-term sustainability and adaptability</span>
              </li>
            </ul>
          </div>

          {/* Facets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facets.map((facet, index) => (
              <div key={index} className="glass-card p-6 hover:border-primary/30 transition-all">
                <h3 className="text-xl font-bold text-white mb-3">{facet.name}</h3>
                <p className="text-gray-400 mb-4">{facet.description}</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 mb-2">Key Functions:</p>
                  {facet.functions.map((func, i) => (
                    <code key={i} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded inline-block mr-2 mb-1">
                      {func}()
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="glass-card p-8 md:p-12 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <ChartBarIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-white">How Gridotto Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Choose or Create</h3>
              <p className="text-gray-400">
                Select from platform draws or create your own custom lottery with your preferred prizes and rules.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Buy Tickets</h3>
              <p className="text-gray-400">
                Purchase tickets using LYX or meet specific requirements for exclusive draws.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Win Prizes</h3>
              <p className="text-gray-400">
                Winners are selected transparently on-chain with automatic prize distribution.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users already enjoying fair, transparent, and exciting lottery draws on Gridotto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/draws" className="btn-primary">
              Explore Draws
            </a>
            <a href="/create-draw" className="btn-secondary">
              Create Your Own Draw
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}