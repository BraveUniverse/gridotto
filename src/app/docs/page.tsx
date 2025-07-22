'use client';

import { useState, useEffect } from 'react';
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
  Gem,
  Rocket,
  Crown
} from 'lucide-react';

const sections = [
  { id: 'intro', title: 'Introduction', icon: BookOpen },
  { id: 'how-to-earn', title: 'How to Earn', icon: DollarSign },
  { id: 'how-it-works', title: 'How It Works', icon: Sparkles },
  { id: 'draw-types', title: 'Draw Types', icon: Gift },
  { id: 'earning', title: 'Fee Structure', icon: Coins },
  { id: 'vip-benefits', title: 'VIP Benefits', icon: Gem },
  { id: 'security', title: 'Security', icon: Shield },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro');

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              Multiple ways to earn, transparent draws, and VIP benefits!
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
                    onClick={() => scrollToSection(section.id)}
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
          <div className="lg:col-span-3 mt-8 lg:mt-0 space-y-16">
            <section id="intro">
              <IntroSection />
            </section>
            <section id="how-to-earn">
              <HowToEarnSection />
            </section>
            <section id="how-it-works">
              <HowItWorksSection />
            </section>
            <section id="draw-types">
              <DrawTypesSection />
            </section>
            <section id="earning">
              <EarningSection />
            </section>
            <section id="vip-benefits">
              <VIPBenefitsSection />
            </section>
            <section id="security">
              <SecuritySection />
            </section>
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
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">What is Gridotto?</h2>
        <div className="prose prose-invert max-w-none text-text-secondary">
          <p className="text-lg">
            Gridotto is a decentralized lottery platform built on the LUKSO blockchain using the Diamond Standard (EIP-2535). 
            It offers multiple ways to earn money through participating in draws, creating draws, or executing draws!
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-card p-6 border border-accent-blue/30 hover:border-accent-blue/50"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6 text-accent-blue" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-text-primary">Win Big Prizes</h3>
          <p className="text-text-tertiary">
            Participate in draws for a chance to win LYX, tokens, or valuable NFTs
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-card p-6 border border-accent-green/30 hover:border-accent-green/50"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-green/10 flex items-center justify-center mb-4">
            <Rocket className="w-6 h-6 text-accent-green" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-text-primary">Create & Earn</h3>
          <p className="text-text-tertiary">
            Create your own draws and earn from participation fees
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-card p-6 border border-accent-purple/30 hover:border-accent-purple/50"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-purple/10 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-accent-purple" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-text-primary">Execute & Earn</h3>
          <p className="text-text-tertiary">
            Execute draws and earn 5% of the prize pool as reward
          </p>
        </motion.div>
      </div>

      <div className="glass-card p-8 bg-gradient-to-br from-primary/5 to-accent-purple/5 border border-primary/20">
        <h3 className="text-2xl font-bold mb-4 text-text-primary">Why Choose Gridotto?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-text-secondary">
              <strong className="text-text-primary">Multiple Earning Opportunities:</strong> Win prizes, create draws, or execute draws to earn
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-text-secondary">
              <strong className="text-text-primary">Transparent & Fair:</strong> All draws use blockchain oracle for true randomness
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-text-secondary">
              <strong className="text-text-primary">VIP Benefits:</strong> Get up to 80% discount with VIP Pass NFTs
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HowToEarnSection() {
  const earningMethods = [
    {
      title: "🍀 Get Lucky - Win Draws",
      description: "The most exciting way to earn big!",
      details: [
        "Buy tickets for official weekly/monthly draws",
        "Participate in user-created draws",
        "Win LYX, LSP7 tokens, or rare LSP8 NFTs",
        "Some NFTs can be worth thousands!"
      ],
      potential: "1 LYX → 1000+ LYX",
      color: "accent-amber",
      icon: Trophy
    },
    {
      title: "🎯 Be Smart - Create Draws",
      description: "Earn from your own lottery business!",
      details: [
        "Create draws with your NFTs or tokens",
        "Set your own ticket prices",
        "Earn from participation fees",
        "Build a following for regular draws"
      ],
      potential: "Passive Income Stream",
      color: "accent-blue",
      icon: Crown
    },
    {
      title: "⚡ Be Fast - Execute Draws",
      description: "Earn guaranteed rewards!",
      details: [
        "Monitor draws ready for execution",
        "Call the execute function first",
        "Earn 5% of the prize pool instantly",
        "No risk, guaranteed profit"
      ],
      potential: "5% of Prize Pool",
      color: "accent-green",
      icon: Zap
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          💰 How to Earn Money on Gridotto
        </h2>
        <p className="text-lg text-text-secondary mb-8">
          Three different ways to make money - choose your strategy or do all three!
        </p>
      </div>

      <div className="space-y-6">
        {earningMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-8 border border-${method.color}/30 hover:border-${method.color}/50 transition-all`}
            >
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${method.color}/20 to-${method.color}/10 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-8 h-8 text-${method.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{method.title}</h3>
                  <p className={`text-lg text-${method.color} mb-4`}>{method.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">How it works:</h4>
                      <ul className="space-y-1">
                        {method.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className={`text-${method.color} mt-1`}>•</span>
                            <span className="text-text-secondary text-sm">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className={`bg-gradient-to-br from-${method.color}/20 to-${method.color}/10 rounded-xl p-4 text-center`}>
                        <p className="text-sm text-text-tertiary mb-1">Earning Potential</p>
                        <p className={`text-xl font-bold text-${method.color}`}>{method.potential}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6 bg-gradient-to-r from-accent-amber/10 to-accent-purple/10 border border-accent-amber/30">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-accent-amber flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Pro Tip: Combine All Three!</h4>
            <p className="text-text-secondary">
              Buy tickets when you feel lucky, create draws with your spare NFTs, and always be ready to execute draws for guaranteed profits. 
              The most successful Gridotto users do all three!
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
      description: "Purchase tickets for official or user-created draws",
      icon: Ticket,
      color: "accent-blue"
    },
    {
      title: "Wait for Draw",
      description: "Draws execute automatically when conditions are met",
      icon: Timer,
      color: "accent-green"
    },
    {
      title: "Winners Selected",
      description: "Random selection using blockchain oracle",
      icon: Trophy,
      color: "accent-purple"
    },
    {
      title: "Claim Prizes",
      description: "Winners can claim their prizes from the contract",
      icon: Wallet,
      color: "accent-amber"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
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
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${step.color}/30 to-${step.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 text-${step.color}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-24 bg-gradient-to-b from-surface-hover to-transparent mx-auto mt-2" />
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

      <div className="glass-card p-6 bg-gradient-to-r from-accent-blue/5 to-accent-purple/5 border border-accent-blue/20">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-accent-blue flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Important Note</h4>
            <p className="text-text-secondary">
              All operations are executed through smart contracts automatically. 
              Draw results are determined by blockchain oracle for true randomness.
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
      title: "Official Weekly Draws",
      interval: "Every 7 days",
      description: "Platform-managed draws with accumulated prize pools",
      features: ["Fixed schedule", "0.1 LYX ticket price", "Single winner", "Big prizes"],
      icon: Timer,
      color: "accent-blue",
      gradient: "from-accent-blue/20 to-accent-blue/5"
    },
    {
      title: "Official Monthly Draws",
      interval: "Every 30 days",
      description: "Special monthly draws with larger prize pools",
      features: ["Monthly schedule", "Accumulated prizes", "Single winner", "Huge jackpots"],
      icon: Award,
      color: "accent-purple",
      gradient: "from-accent-purple/20 to-accent-purple/5"
    },
    {
      title: "User-Created Draws",
      interval: "Custom timing",
      description: "Create your own draws with custom prizes and rules",
      features: ["LYX/LSP7/LSP8 prizes", "Custom ticket price", "Multi-winner option", "Entry requirements"],
      icon: Gift,
      color: "accent-green",
      gradient: "from-accent-green/20 to-accent-green/5"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">Draw Types</h2>
        <p className="text-lg text-text-secondary mb-8">
          Different draw types for different opportunities
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
              className={`glass-card p-8 bg-gradient-to-r ${draw.gradient} border border-${draw.color}/20 hover:border-${draw.color}/40 transition-all`}
            >
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 bg-gradient-to-br from-${draw.color}/30 to-${draw.color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-8 h-8 text-${draw.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-text-primary">{draw.title}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full bg-${draw.color}/20 text-${draw.color} font-medium`}>
                      {draw.interval}
                    </span>
                  </div>
                  <p className="text-text-secondary mb-4">{draw.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {draw.features.map((feature, idx) => (
                      <span key={idx} className={`text-sm px-3 py-1 rounded-lg bg-${draw.color}/10 text-${draw.color} border border-${draw.color}/20`}>
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

      <div className="glass-card p-8 border border-primary/30 bg-gradient-to-br from-primary/5 to-accent-purple/5">
        <h3 className="text-2xl font-bold mb-4 text-text-primary">Prize Types Supported</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-green/10 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-8 h-8 text-accent-green" />
            </div>
            <h4 className="font-semibold text-text-primary">LYX Tokens</h4>
            <p className="text-sm text-text-tertiary">Native LUKSO currency</p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 flex items-center justify-center mx-auto mb-3">
              <Coins className="w-8 h-8 text-accent-blue" />
            </div>
            <h4 className="font-semibold text-text-primary">LSP7 Tokens</h4>
            <p className="text-sm text-text-tertiary">Fungible tokens</p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-purple/10 flex items-center justify-center mx-auto mb-3">
              <Gem className="w-8 h-8 text-accent-purple" />
            </div>
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
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">Fee Structure</h2>
        <p className="text-lg text-text-secondary mb-8">
          Understanding how ticket sales are distributed
        </p>
      </div>

      <div className="glass-card p-8 bg-gradient-to-br from-accent-amber/5 to-accent-green/5">
        <h3 className="text-2xl font-bold mb-6 text-text-primary">Official Draws Fee Distribution</h3>
        
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-r from-accent-amber/10 to-transparent border border-accent-amber/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-accent-amber" />
                <h4 className="text-lg font-semibold text-text-primary">Draw Prize Pool</h4>
              </div>
              <span className="text-2xl font-bold text-accent-amber">75%</span>
            </div>
            <p className="text-text-secondary">
              Goes directly to the current draw's prize pool for the winner
            </p>
          </div>

          <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-transparent border border-accent-purple/20">
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

          <div className="glass-card p-6 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
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

      <div className="glass-card p-8 mt-6 bg-gradient-to-br from-accent-green/5 to-accent-blue/5">
        <h3 className="text-2xl font-bold mb-6 text-text-primary">User-Created Draws</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-accent-amber" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Executor Reward - 5%</h4>
              <p className="text-text-secondary">
                Anyone who executes the draw earns 5% of the prize pool. Be fast and earn guaranteed rewards!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Creator Earnings</h4>
              <p className="text-text-secondary">
                Draw creators can set custom participation fees and earn from every ticket sold
              </p>
            </div>
          </div>
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
      gradient: "from-gray-400 to-gray-600",
      benefits: ["20% ticket discount", "Priority support", "Exclusive draws access"],
      savings: "Save 2 LYX per 10 LYX spent"
    },
    {
      name: "Gold",
      level: 2,
      color: "yellow",
      gradient: "from-yellow-400 to-yellow-600",
      benefits: ["40% ticket discount", "Bonus tickets", "Early access to features"],
      savings: "Save 4 LYX per 10 LYX spent"
    },
    {
      name: "Diamond",
      level: 3,
      color: "blue",
      gradient: "from-blue-400 to-blue-600",
      benefits: ["60% ticket discount", "Extra bonus tickets", "Governance voting"],
      savings: "Save 6 LYX per 10 LYX spent"
    },
    {
      name: "Universe",
      level: 4,
      color: "purple",
      gradient: "from-purple-400 to-purple-600",
      benefits: ["80% ticket discount", "Maximum bonus tickets", "Revenue sharing"],
      savings: "Save 8 LYX per 10 LYX spent"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">VIP Benefits</h2>
        <p className="text-lg text-text-secondary mb-8">
          Hold BraveUniverse VIP Pass NFTs to unlock exclusive benefits and massive discounts!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tiers.map((tier, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-6 border border-${tier.color}-500/30 hover:border-${tier.color}-500/50 transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${tier.gradient}`}>
                {tier.name}
              </h3>
              <span className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${tier.gradient} text-white font-medium`}>
                Tier {tier.level}
              </span>
            </div>
            <p className={`text-sm text-${tier.color}-400 mb-4`}>{tier.savings}</p>
            <ul className="space-y-2">
              {tier.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className={`w-5 h-5 text-${tier.color}-400 flex-shrink-0 mt-0.5`} />
                  <span className="text-text-secondary">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-8 border border-primary/30 bg-gradient-to-r from-primary/5 to-accent-purple/5">
        <div className="flex items-start gap-3">
          <Gem className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">How to Get VIP Status</h4>
            <p className="text-text-secondary">
              Purchase BraveUniverse VIP Pass NFTs from the official collection on LUKSO. 
              Higher tier passes unlock better benefits and rewards. The discounts alone can save you hundreds of LYX!
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
      icon: Gem,
      color: "accent-purple"
    },
    {
      title: "Oracle Integration",
      description: "Uses blockchain oracle for verifiable random number generation",
      icon: Target,
      color: "accent-blue"
    },
    {
      title: "Automated Execution",
      description: "Draws execute automatically based on predefined conditions",
      icon: Zap,
      color: "accent-amber"
    },
    {
      title: "LUKSO Security",
      description: "Protected by LUKSO blockchain's security standards",
      icon: Shield,
      color: "accent-green"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
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
              className={`glass-card p-6 bg-gradient-to-br from-${feature.color}/5 to-transparent border border-${feature.color}/20 hover:border-${feature.color}/40 transition-all`}
            >
              <Icon className={`w-10 h-10 text-${feature.color} mb-4`} />
              <h3 className="text-xl font-semibold mb-2 text-text-primary">{feature.title}</h3>
              <p className="text-text-secondary">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6 border border-error/30 bg-gradient-to-r from-error/5 to-transparent">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Security Tip</h4>
            <p className="text-text-secondary">
              Never share your private keys with anyone. Gridotto will never ask for your private keys.
              Always verify you're on the official Gridotto website before connecting your wallet.
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
          Start Earning Now
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}