'use client';

import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface ProfileDisplayProps {
  address: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showDescription?: boolean;
  className?: string;
}

export const ProfileDisplay = ({ 
  address, 
  size = 'md', 
  showName = false,
  showDescription = false,
  className = ''
}: ProfileDisplayProps) => {
  const { profileData, loading } = useLSP3Profile(address);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Generate a consistent color based on address
  const getColorFromAddress = (addr: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600'
    ];
    
    const index = parseInt(addr.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

  const colorClass = getColorFromAddress(address);
  const profileImage = profileData?.profileImage && profileData.profileImage.length > 0 
    ? profileData.profileImage[0]?.url 
    : undefined;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center shadow-lg ${loading ? 'animate-pulse' : ''}`}>
        {profileImage ? (
          <div className="relative w-full h-full">
            <Image
              src={profileImage}
              alt={profileData?.name || formatAddress(address)}
              fill
              className="object-cover"
              sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
            />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
            {profileData?.name ? (
              <span className="text-white font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserCircleIcon className={`${iconSizes[size]} text-white/80`} />
            )}
          </div>
        )}
      </div>
      
      {(showName || showDescription) && (
        <div className="flex flex-col min-w-0">
          {showName && (
            <span className={`${textSizes[size]} font-medium text-white truncate`}>
              {profileData?.name || formatAddress(address)}
            </span>
          )}
          {showDescription && profileData?.description && (
            <span className={`text-xs text-gray-400 truncate max-w-[200px]`}>
              {profileData.description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};