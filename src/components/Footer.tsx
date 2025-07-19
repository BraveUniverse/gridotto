'use client';

import Link from 'next/link';
import { 
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  TelegramIcon
} from '@/components/icons/SocialIcons';

const navigation = {
  platform: [
    { name: 'All Draws', href: '/draws' },
    { name: 'Create Draw', href: '/create-draw' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'My Profile', href: '/profile' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api-docs' },
    { name: 'Smart Contracts', href: '/contracts' },
    { name: 'Audit Reports', href: '/audits' },
  ],
  community: [
    { name: 'Discord', href: 'https://discord.gg/gridotto' },
    { name: 'Twitter', href: 'https://twitter.com/gridotto' },
    { name: 'Telegram', href: 'https://t.me/gridotto' },
    { name: 'GitHub', href: 'https://github.com/gridotto' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: TwitterIcon, href: 'https://twitter.com/gridotto', label: 'Twitter' },
  { icon: GithubIcon, href: 'https://github.com/gridotto', label: 'GitHub' },
  { icon: DiscordIcon, href: 'https://discord.gg/gridotto', label: 'Discord' },
  { icon: TelegramIcon, href: 'https://t.me/gridotto', label: 'Telegram' },
];

export const Footer = () => {
  return (
    <footer className="relative mt-24 border-t border-white/10">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgb(var(--background-secondary))/50]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))] flex items-center justify-center">
                <span className="text-xl font-bold text-white">G</span>
              </div>
              <span className="text-xl font-bold text-white">ridotto</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              The most advanced lottery platform on LUKSO blockchain. 
              Create and participate in transparent, decentralized draws.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {navigation.platform.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Gridotto. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a 
                href="https://lukso.network" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Built on LUKSO
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="/security" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Security
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="/bug-bounty" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Bug Bounty
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};