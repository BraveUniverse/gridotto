'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '../ConnectButton';
import { 
  HomeIcon, 
  SparklesIcon, 
  PlusCircleIcon,
  TrophyIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Draws', href: '/draws', icon: SparklesIcon },
    { name: 'Create Draw', href: '/create-draw', icon: PlusCircleIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Admin', href: '/admin', icon: ShieldCheckIcon }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-900/95 backdrop-blur-xl shadow-lg' : 'bg-gray-900/80 backdrop-blur-lg'
    } border-b border-white/10`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">G</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 group-hover:from-purple-600 group-hover:to-primary transition-all">
              Gridotto
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary/20 to-purple-600/20 text-white border border-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <ConnectButton />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative p-2 rounded-xl bg-gradient-to-r from-primary/20 to-purple-600/20 text-white hover:from-primary/30 hover:to-purple-600/30 transition-all"
            >
              <div className="relative z-10">
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        mobileMenuOpen ? 'max-h-screen' : 'max-h-0'
      }`}>
        <div className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary/20 to-purple-600/20 text-white border border-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};