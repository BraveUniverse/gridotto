'use client';

import { 
  WalletIcon,
  TicketIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const steps = [
  {
    icon: WalletIcon,
    title: 'Connect Your Wallet',
    description: 'Connect your Universal Profile to get started. Works seamlessly with LUKSO ecosystem.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: TicketIcon,
    title: 'Buy or Create Draws',
    description: 'Purchase tickets for existing draws or create your own with LYX, tokens, or NFTs.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: ClockIcon,
    title: 'Wait for Draw',
    description: 'Draws execute automatically when the timer ends. Everything is transparent on-chain.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: TrophyIcon,
    title: 'Claim Your Prize',
    description: 'Winners are selected fairly using VRF. Prizes are distributed instantly to winners.',
    color: 'from-green-500 to-emerald-500'
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[rgb(var(--primary))/5] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[rgb(var(--accent-blue))/5] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get started in minutes with our simple and transparent lottery platform
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>
              )}
              
              {/* Step Card */}
              <div className="relative z-10 text-center">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="mb-6 inline-flex">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-5 transform rotate-3 hover:rotate-6 transition-transform`}>
                    <step.icon className="w-full h-full text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center">
            <p className="text-gray-400 mb-6">Ready to try your luck?</p>
            <a 
              href="/draws" 
              className="btn-primary text-lg px-8 py-4"
            >
              Start Playing Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};