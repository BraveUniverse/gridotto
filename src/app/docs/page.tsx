'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Coins, 
  Gift, 
  Users, 
  TrendingUp, 
  Shield,
  Sparkles,
  Trophy,
  Wallet,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
  Target,
  Zap,
  Heart,
  Star,
  Ticket,
  Timer,
  DollarSign,
  Percent,
  Award,
  Gem
} from 'lucide-react';

const sections = [
  { id: 'intro', title: 'Introduction', icon: BookOpen },
  { id: 'how-it-works', title: 'How It Works', icon: Sparkles },
  { id: 'draw-types', title: 'Draw Types', icon: Gift },
  { id: 'earning', title: 'Earning Model', icon: Coins },
  { id: 'vip-benefits', title: 'VIP Benefits', icon: Gem },
  { id: 'security', title: 'Security', icon: Shield },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-background via-background-secondary to-background-tertiary overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-purple">
              Gridotto Documentation
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
              The next-generation lottery platform on LUKSO blockchain. 
              Fair, transparent, and rewarding for everyone.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-24 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-primary/20 to-accent-purple/20 text-white border border-primary/30'
                        : 'text-text-tertiary hover:bg-surface hover:text-text-secondary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.title}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <AnimatePresence mode="wait">
              {activeSection === 'intro' && <IntroSection key="intro" />}
              {activeSection === 'how-it-works' && <HowItWorksSection key="how-it-works" />}
              {activeSection === 'draw-types' && <DrawTypesSection key="draw-types" />}
              {activeSection === 'earning' && <EarningSection key="earning" />}
              {activeSection === 'vip-benefits' && <VIPBenefitsSection key="vip-benefits" />}
              {activeSection === 'security' && <SecuritySection key="security" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">What is Gridotto?</h2>
        <div className="prose prose-invert max-w-none text-text-secondary">
          <p className="text-lg">
            Gridotto is a revolutionary lottery platform built on the LUKSO blockchain using the Diamond Standard (EIP-2535). 
            Unlike traditional lotteries, Gridotto ensures that everyone wins through its innovative reward distribution system.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-card p-6"
        >
          <Users className="w-12 h-12 text-accent-blue mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-text-primary">Community Driven</h3>
          <p className="text-text-tertiary">
            Users can create and manage their own draws with custom prizes
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-card p-6"
        >
          <Shield className="w-12 h-12 text-accent-green mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-text-primary">100% Secure</h3>
          <p className="text-text-tertiary">
            Built with audited smart contracts on LUKSO blockchain
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-card p-6"
        >
          <Sparkles className="w-12 h-12 text-accent-purple mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-text-primary">Everyone Wins</h3>
          <p className="text-text-tertiary">
            Unique reward model where all participants benefit
          </p>
        </motion.div>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold mb-4 text-text-primary">Why Choose Gridotto?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0 mt-0.5" />
            <p className="text-text-secondary">
              <strong className="text-text-primary">Fair Distribution:</strong> Prize pool is distributed fairly among all participants
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0 mt-0.5" />
            <p className="text-text-secondary">
              <strong className="text-text-primary">Low Entry Cost:</strong> Affordable ticket prices for everyone
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0 mt-0.5" />
            <p className="text-text-secondary">
              <strong className="text-text-primary">Multi-Asset Support:</strong> LYX, LSP7 tokens, and LSP8 NFTs supported
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Buy Tickets",
      description: "Purchase tickets for active draws using LYX",
      icon: Ticket,
      color: "accent-blue"
    },
    {
      title: "Wait for Draw",
      description: "Draws execute automatically at scheduled times",
      icon: Timer,
      color: "accent-green"
    },
    {
      title: "Win Prizes",
      description: "Multiple winners selected with fair distribution",
      icon: Trophy,
      color: "accent-purple"
    },
    {
      title: "Claim Rewards",
      description: "Winners can claim their prizes instantly",
      icon: Wallet,
      color: "accent-amber"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">How It Works</h2>
        <p className="text-lg text-text-secondary mb-8">
          Participating in Gridotto draws is simple and transparent!
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full bg-${step.color}/20 flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 text-${step.color}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-24 bg-surface-hover mx-auto mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold mb-2 text-text-primary">{step.title}</h3>
                  <p className="text-text-tertiary">{step.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-accent-blue flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Important Note</h4>
            <p className="text-text-secondary">
              All operations are executed through smart contracts automatically. 
              No human intervention, completely transparent and secure!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DrawTypesSection() {
  const drawTypes = [
    {
      title: "Weekly Draws",
      interval: "Every 7 days",
      description: "Regular draws with standard prize pools",
      features: ["Fixed schedule", "Multiple winners", "Instant payouts"],
      icon: Timer,
      color: "accent-blue"
    },
    {
      title: "Monthly Draws",
      interval: "Every 30 days",
      description: "Special draws with accumulated prize pools",
      features: ["Higher prizes", "More winners", "Bonus rewards"],
      icon: Award,
      color: "accent-purple"
    },
    {
      title: "User-Created Draws",
      interval: "Custom timing",
      description: "Create your own draws with NFTs or tokens as prizes",
      features: ["Custom prizes", "Set your rules", "Earn commissions"],
      icon: Gift,
      color: "accent-green"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">Draw Types</h2>
        <p className="text-lg text-text-secondary mb-8">
          Gridotto offers multiple draw types to suit different preferences
        </p>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        {drawTypes.map((draw, index) => {
          const Icon = draw.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 bg-${draw.color}/20 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-8 h-8 text-${draw.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-text-primary">{draw.title}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full bg-${draw.color}/20 text-${draw.color}`}>
                      {draw.interval}
                    </span>
                  </div>
                  <p className="text-text-secondary mb-4">{draw.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {draw.features.map((feature, idx) => (
                      <span key={idx} className="text-sm px-3 py-1 rounded-lg bg-surface text-text-tertiary">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-8 border border-primary/30">
        <h3 className="text-2xl font-bold mb-4 text-text-primary">Prize Types Supported</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <DollarSign className="w-12 h-12 text-accent-green mx-auto mb-2" />
            <h4 className="font-semibold text-text-primary">LYX Tokens</h4>
            <p className="text-sm text-text-tertiary">Native LUKSO currency</p>
          </div>
          <div className="text-center p-4">
            <Coins className="w-12 h-12 text-accent-blue mx-auto mb-2" />
            <h4 className="font-semibold text-text-primary">LSP7 Tokens</h4>
            <p className="text-sm text-text-tertiary">Fungible tokens</p>
          </div>
          <div className="text-center p-4">
            <Gem className="w-12 h-12 text-accent-purple mx-auto mb-2" />
            <h4 className="font-semibold text-text-primary">LSP8 NFTs</h4>
            <p className="text-sm text-text-tertiary">Unique digital assets</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EarningSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">Earning Model</h2>
        <p className="text-lg text-text-secondary mb-8">
          In Gridotto, everyone wins! Here's how the prize distribution works:
        </p>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold mb-6 text-text-primary">Prize Distribution</h3>
        
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-accent-amber" />
                <h4 className="text-lg font-semibold text-text-primary">Main Winners</h4>
              </div>
              <span className="text-2xl font-bold text-accent-amber">60%</span>
            </div>
            <p className="text-text-secondary">
              The majority of the prize pool goes to the main draw winners
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-accent-blue" />
                <h4 className="text-lg font-semibold text-text-primary">All Participants</h4>
              </div>
              <span className="text-2xl font-bold text-accent-blue">15%</span>
            </div>
            <p className="text-text-secondary">
              Distributed among all ticket holders through random selection
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-accent-purple" />
                <h4 className="text-lg font-semibold text-text-primary">Monthly Pool</h4>
              </div>
              <span className="text-2xl font-bold text-accent-purple">20%</span>
            </div>
            <p className="text-text-secondary">
              Accumulated for special monthly draws with bigger prizes
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                <h4 className="text-lg font-semibold text-text-primary">Platform Fee</h4>
              </div>
              <span className="text-2xl font-bold text-primary">5%</span>
            </div>
            <p className="text-text-secondary">
              Supports platform development and operations
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <Percent className="w-10 h-10 text-accent-purple mb-4" />
          <h4 className="text-xl font-semibold mb-2 text-text-primary">Multiple Winning Chances</h4>
          <p className="text-text-secondary">
            Even if you don't win the main prize, you still have chances in the participant pool
          </p>
        </div>

        <div className="glass-card p-6">
          <TrendingUp className="w-10 h-10 text-accent-green mb-4" />
          <h4 className="text-xl font-semibold mb-2 text-text-primary">Value Appreciation</h4>
          <p className="text-text-secondary">
            NFT prizes can increase in value over time, multiplying your winnings
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function VIPBenefitsSection() {
  const tiers = [
    {
      name: "Silver",
      level: 1,
      color: "gray",
      benefits: ["5% ticket discount", "Priority support", "Exclusive draws access"]
    },
    {
      name: "Gold",
      level: 2,
      color: "yellow",
      benefits: ["10% ticket discount", "2x reward multiplier", "Early access to new features"]
    },
    {
      name: "Diamond",
      level: 3,
      color: "blue",
      benefits: ["15% ticket discount", "3x reward multiplier", "Governance voting rights"]
    },
    {
      name: "Universe",
      level: 4,
      color: "purple",
      benefits: ["20% ticket discount", "5x reward multiplier", "Revenue sharing", "Custom draws"]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">VIP Benefits</h2>
        <p className="text-lg text-text-secondary mb-8">
          Hold BraveUniverse VIP Pass NFTs to unlock exclusive benefits
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tiers.map((tier, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-6 border border-${tier.color}-500/30`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-text-primary">{tier.name}</h3>
              <span className={`text-sm px-3 py-1 rounded-full bg-${tier.color}-500/20 text-${tier.color}-400`}>
                Tier {tier.level}
              </span>
            </div>
            <ul className="space-y-2">
              {tier.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-8 border border-primary/30">
        <div className="flex items-start gap-3">
          <Gem className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">How to Get VIP Status</h4>
            <p className="text-text-secondary">
              Purchase BraveUniverse VIP Pass NFTs from the official collection on LUKSO. 
              Higher tier passes unlock better benefits and rewards.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SecuritySection() {
  const features = [
    {
      title: "Diamond Standard",
      description: "Built with EIP-2535 for upgradeable and modular smart contracts",
      icon: Gem
    },
    {
      title: "Transparent Operations",
      description: "All transactions are recorded on-chain and publicly verifiable",
      icon: Target
    },
    {
      title: "Automated Distribution",
      description: "Prizes are distributed automatically without human intervention",
      icon: Zap
    },
    {
      title: "LUKSO Security",
      description: "Protected by LUKSO blockchain's security standards",
      icon: Shield
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">Security</h2>
        <p className="text-lg text-text-secondary mb-8">
          Your security is our top priority at Gridotto
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <Icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-text-primary">{feature.title}</h3>
              <p className="text-text-secondary">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6 border border-error/30">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Security Tip</h4>
            <p className="text-text-secondary">
              Never share your private keys with anyone. Gridotto will never ask for your private keys.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-purple text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          Start Playing Now
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}