'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUPProvider } from '@/hooks/useUPProvider';
import { 
  Squares2X2Icon,
  PlusCircleIcon,
  TrophyIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, account, refreshConnection } = useUPProvider();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConnect = async () => {
    await refreshConnection();
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Squares2X2Icon },
    { name: 'All Draws', href: '/draws', icon: TrophyIcon },
    { name: 'Create Draw', href: '/create-draw', icon: PlusCircleIcon },
    { name: 'Stats', href: '/stats', icon: ChartBarIcon },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-white/10' : ''
    }`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[rgb(var(--primary))] blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))] flex items-center justify-center">
                <span className="text-2xl font-bold text-white">G</span>
              </div>
            </div>
            <span className="text-xl font-bold text-white">Gridotto</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Connect Button / Profile */}
            {isConnected && account ? (
              <div className="flex items-center space-x-4">
                <ProfileDisplay 
                  address={account} 
                  size="small"
                  showName={true}
                  className="hidden md:flex"
                />
                <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <CogIcon className="w-5 h-5 text-gray-300" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="btn-primary"
              >
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
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
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile Profile */}
            {isConnected && account && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <ProfileDisplay 
                  address={account} 
                  size="medium"
                  showName={true}
                  showTags={true}
                  className="px-4"
                />
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}; 