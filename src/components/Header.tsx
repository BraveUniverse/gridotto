'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUPProvider } from '@/hooks/useUPProvider';
import { 
  Bars3Icon, 
  XMarkIcon,
  WalletIcon,
  PlusIcon,
  Squares2X2Icon,
  UserCircleIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, account, refreshConnection } = useUPProvider();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Squares2X2Icon },
    { name: 'All Draws', href: '/draws', icon: Squares2X2Icon },
    { name: 'Create Draw', href: '/create-draw', icon: PlusIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: ChartBarIcon },
    { name: 'My Profile', href: '/profile', icon: UserCircleIcon },
  ];

  const handleConnect = async () => {
    await refreshConnection();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'backdrop-blur-xl bg-black/10' : 'backdrop-blur-md bg-transparent'
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-light))] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <span className="text-2xl font-bold gradient-text">G</span>
              </div>
            </div>
            <span className="text-xl font-bold text-white">ridotto</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Connect Wallet Button */}
            {isConnected ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <Link href="/admin" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <CogIcon className="w-5 h-5 text-gray-300" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="hidden sm:flex items-center space-x-2 btn-primary"
              >
                <WalletIcon className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-white" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            
            {/* Mobile Wallet Section */}
            <div className="pt-4 border-t border-white/10">
              {isConnected ? (
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                      </span>
                    </div>
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <CogIcon className="w-5 h-5 text-gray-300" />
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="w-full flex items-center justify-center space-x-2 btn-primary"
                >
                  <WalletIcon className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}; 