import { useLSP3Profile } from '@/hooks/useLSP3Profile';
import Image from 'next/image';
import { useState, useEffect, memo, useCallback } from 'react';
import { useVIPPassContract, VIPPassTier } from '@/hooks/useVIPPassContract';

interface ProfileItemProps {
  address: string;
  size?: 'sm' | 'md' | 'lg';
  showAddress?: boolean;
  showTicketCount?: boolean;
  ticketCount?: number;
  isHighlighted?: boolean;
  className?: string;
  rank?: number;
  showVIP?: boolean;
  vipTier?: VIPPassTier;
}

// Sonradan yapılacak fetchler için önbellek
const profileCache: Record<string, any> = {};

export const ProfileItem = memo(({ 
  address, 
  size = 'md', 
  showAddress = false,
  showTicketCount = false,
  ticketCount = 0,
  isHighlighted = false,
  className = '',
  rank,
  showVIP = true,
  vipTier: propVipTier
}: ProfileItemProps) => {
  const { profileData, loading, error } = useLSP3Profile(address);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [vipTier, setVipTier] = useState<VIPPassTier>(propVipTier !== undefined ? propVipTier : VIPPassTier.NO_TIER);
  const { getHighestTierOwned, getTierName } = useVIPPassContract();
  
  // Boyut değerlerini belirle
  const sizeMap = {
    sm: {
      container: 'h-8',
      avatar: 'w-8 h-8',
      text: 'text-sm',
      address: 'text-xs',
      counter: 'w-5 h-5 text-xs',
      badge: 'w-4 h-4 text-[10px]',
      vipBadge: 'w-5 h-5 text-[8px] leading-none font-bold'
    },
    md: {
      container: 'h-10',
      avatar: 'w-10 h-10',
      text: 'text-base',
      address: 'text-xs',
      counter: 'w-6 h-6 text-sm',
      badge: 'w-5 h-5 text-xs',
      vipBadge: 'w-6 h-6 text-[9px] leading-none font-bold'
    },
    lg: {
      container: 'h-16',
      avatar: 'w-16 h-16',
      text: 'text-lg font-bold',
      address: 'text-sm',
      counter: 'w-8 h-8 text-base',
      badge: 'w-6 h-6 text-sm',
      vipBadge: 'w-8 h-8 text-xs leading-none font-bold'
    }
  };
  
  // Adres kısaltma fonksiyonu
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };
  
  // Profil adı veya kısaltılmış adres
  const displayName = profileData?.name || formatAddress(address);
  
  // Profil resmi URL'si
  const profileImageUrl = profileData?.profileImage?.[0]?.url;
  
  // Resim yükleme hatası durumunda
  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };
  
  // Resim yükleme başarılı durumunda
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  // Yükleme durumunu sıfırla
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [profileImageUrl]);
  
  // Highlight efekti için
  useEffect(() => {
    if (isHighlighted) {
      setAnimate(true);
      const timeout = setTimeout(() => {
        setAnimate(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isHighlighted]);

  // Eğer vipTier prop olarak verilmemişse, kontrat üzerinden kontrol edelim
  useEffect(() => {
    const checkVIPStatus = async () => {
      // Eğer vipTier prop ile verilmişse, onu kullan
      if (propVipTier !== undefined) {
        setVipTier(propVipTier);
        return;
      }
      
      // VIP Pass kontrol edilecekse
      if (showVIP && address) {
        try {
          const tier = await getHighestTierOwned(address);
          setVipTier(tier);
        } catch (error) {
          setVipTier(VIPPassTier.NO_TIER);
        }
      }
    };
    
    checkVIPStatus();
  }, [address, getHighestTierOwned, showVIP, propVipTier]);
  
  // VIP rozetinin rengini belirle
  const getVipBadgeColor = useCallback(() => {
    switch (vipTier) {
      case VIPPassTier.SILVER: return 'bg-gray-300';
      case VIPPassTier.GOLD: return 'bg-yellow-400';
      case VIPPassTier.DIAMOND: return 'bg-blue-300';
      case VIPPassTier.UNIVERSE: return 'bg-purple-500';
      default: return '';
    }
  }, [vipTier]);
  
  // VIP rozeti göster
  const renderVipBadge = useCallback(() => {
    if (!showVIP || vipTier === VIPPassTier.NO_TIER) {
      return null;
    }
    
    const vipShortLabels = {
      [VIPPassTier.SILVER]: 'S',
      [VIPPassTier.GOLD]: 'G',
      [VIPPassTier.DIAMOND]: 'D',
      [VIPPassTier.UNIVERSE]: 'U'
    };
    
    return (
      <div 
        className={`absolute flex items-center justify-center ${sizeMap[size].vipBadge} rounded-full ${getVipBadgeColor()} text-white z-50 border-2 border-white shadow-md`} 
        style={{
          pointerEvents: 'none',
          top: '-6px',
          left: '-6px'
        }}
      >
        {vipShortLabels[vipTier]}
      </div>
    );
  }, [showVIP, vipTier, size, getVipBadgeColor]);
  
  // Render madalya veya sıralama
  const renderRank = () => {
    if (rank === undefined) return null;
    
    if (rank === 0) {
      return (
        <div className={`absolute -top-1 -right-1 flex items-center justify-center ${sizeMap[size].badge} rounded-full bg-yellow-500 text-white font-bold z-20 border-2 border-white shadow-md`}>
          🥇
        </div>
      );
    } else if (rank === 1) {
      return (
        <div className={`absolute -top-1 -right-1 flex items-center justify-center ${sizeMap[size].badge} rounded-full bg-gray-400 text-white font-bold z-20 border-2 border-white shadow-md`}>
          🥈
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className={`absolute -top-1 -right-1 flex items-center justify-center ${sizeMap[size].badge} rounded-full bg-amber-700 text-white font-bold z-20 border-2 border-white shadow-md`}>
          🥉
        </div>
      );
    } else if (rank !== undefined) {
      return (
        <div className={`absolute -top-1 -right-1 flex items-center justify-center ${sizeMap[size].badge} rounded-full bg-gray-200 text-gray-700 font-semibold z-20 border-2 border-white shadow-md`}>
          {rank + 1}
        </div>
      );
    }
    
    return null;
  };
  
  // Console log için useEffect ekleyelim
  useEffect(() => {
    // Konsol logları kaldırıldı
  }, [vipTier, address]);
  
  return (
    <div className={`flex items-center gap-3 ${sizeMap[size].container} ${animate ? 'animate-pulse' : ''} ${className}`}>
      <div 
        className={`relative ${sizeMap[size].avatar} rounded-full overflow-hidden bg-gray-200 flex-shrink-0 
        ${animate ? 'ring-2 ring-[#FF2975] ring-offset-2' : isHighlighted ? 'ring-2 ring-[#FF2975]' : ''}
        ${vipTier !== VIPPassTier.NO_TIER && showVIP ? `ring-2 ${getVipBadgeColor()} ring-offset-1` : ''}
        `}
      >
        {renderRank()}
        {showVIP && vipTier !== VIPPassTier.NO_TIER && renderVipBadge()}
        
        {profileImageUrl && !imageError ? (
          <>
            <div className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
              <div className="w-5 h-5 border-2 border-[#FF2975] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <Image
              src={profileImageUrl}
              alt={displayName}
              fill
              className={`object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized={true}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF2975] to-[#FF9F80] text-white font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        
        {showTicketCount && ticketCount > 0 && (
          <div className={`absolute -bottom-1 -right-1 flex items-center justify-center ${sizeMap[size].counter} rounded-full bg-[#FF2975] text-white font-bold z-10 border-2 border-white shadow-md`}>
            {ticketCount > 99 ? '99+' : ticketCount}
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <div className={`font-medium ${sizeMap[size].text} text-gray-800 dark:text-gray-200 line-clamp-1 flex items-center`}>
          {displayName}
          {showVIP && vipTier !== VIPPassTier.NO_TIER && (
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs text-white rounded font-semibold ${getVipBadgeColor()}`}>
              {vipTierToString(vipTier)}
            </span>
          )}
        </div>
        
        {showAddress && (
          <div className={`${sizeMap[size].address} text-gray-500`}>
            {formatAddress(address)}
          </div>
        )}
        
        {showTicketCount && (
          <div className={`${sizeMap[size].address} text-[#FF2975] font-medium`}>
            {ticketCount} {ticketCount === 1 ? 'Ticket' : 'Tickets'}
          </div>
        )}
      </div>
    </div>
  );
});

// VIP tier adını string olarak döndürme yardımcı fonksiyonu
function vipTierToString(tier: VIPPassTier): string {
  switch (tier) {
    case VIPPassTier.SILVER: return 'Silver';
    case VIPPassTier.GOLD: return 'Gold';
    case VIPPassTier.DIAMOND: return 'Diamond';
    case VIPPassTier.UNIVERSE: return 'Universe';
    default: return '';
  }
} 