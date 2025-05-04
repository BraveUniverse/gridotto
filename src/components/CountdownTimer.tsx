import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CountdownTimerProps {
  title: string;
  timeLeft: number;
  poolAmount: number;
}

export const CountdownTimer = ({ title, timeLeft: initialTimeLeft, poolAmount }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Havuz doluluk yüzdesi (maksimum %95)
  const fillPercentage = Math.min((poolAmount / 1000) * 100, 95);
  
  // Kalan süre yüzdesi
  const maxTime = title.includes('Weekly') ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60;
  
  // Zaman yüzdesi 0-100 arası (0 = süre bitmiş, 100 = tüm süre kalmış)
  const timePercentage = Math.min(Math.max((timeLeft / maxTime) * 100, 0), 100);

  // Çember için path hesaplama
  const calculateTimePath = () => {
    const radius = 48;
    const center = { x: 50, y: 50 };
    
   
    if (timeLeft <= 0) {
      return { 
        leftPath: `M ${center.x} ${center.y + radius} A ${radius} ${radius} 0 0 1 ${center.x} ${center.y - radius}`,
        rightPath: `M ${center.x} ${center.y + radius} A ${radius} ${radius} 0 0 0 ${center.x} ${center.y - radius}`
      };
    }
    
    
    const percentage = timePercentage;
    
 
    const angleInRadians = (percentage / 100) * Math.PI;
    
 
    const leftEndX = center.x - radius * Math.sin(angleInRadians);
    const leftEndY = center.y - radius * Math.cos(angleInRadians);
    
   
    const rightEndX = center.x + radius * Math.sin(angleInRadians);
    const rightEndY = center.y - radius * Math.cos(angleInRadians);

  
    const leftPath = `M ${center.x} ${center.y + radius} A ${radius} ${radius} 0 0 1 ${leftEndX} ${leftEndY}`;
    const rightPath = `M ${center.x} ${center.y + radius} A ${radius} ${radius} 0 0 0 ${rightEndX} ${rightEndY}`;

    return { leftPath, rightPath };
  };

  const { leftPath, rightPath } = calculateTimePath();

  useEffect(() => {
    if (initialTimeLeft !== null && initialTimeLeft !== undefined) {
      setTimeLeft(initialTimeLeft);
    }
  }, [initialTimeLeft]);

  // Zamanı hesapla
  useEffect(() => {
    const calculateTime = () => {
      if (timeLeft <= 0) {
        setTime({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }
      
      setTime({
        days: Math.floor(timeLeft / (60 * 60 * 24)),
        hours: Math.floor((timeLeft % (60 * 60 * 24)) / (60 * 60)),
        minutes: Math.floor((timeLeft % (60 * 60)) / 60),
        seconds: Math.floor(timeLeft % 60),
      });
    };

    calculateTime();
  }, [timeLeft]);

  const { days, hours, minutes, seconds } = time;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xs sm:text-base font-semibold mb-1 sm:mb-3 text-[#1D1D1F]">{title}</h2>
      
      <div className="relative w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px]">
        {/* Ana daire - 3D efekti için gölge */}
        <div className="absolute inset-0 rounded-full bg-[#EDEDED] shadow-[0_8px_16px_rgba(0,0,0,0.1)]" />
        
        {/* Zaman göstergesi - dairesel kenar */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <path
              d={leftPath}
              fill="none"
              stroke="#1D1D1F"
              strokeWidth="2"
              className="transition-all duration-1000"
            />
            <path
              d={rightPath}
              fill="none"
              stroke="#1D1D1F"
              strokeWidth="2"
              className="transition-all duration-1000"
            />
          </svg>
        </div>
        
        {/* Havuz doluluk animasyonu */}
        <div className="absolute inset-[12px] rounded-full overflow-hidden">
          <div 
            className="absolute bottom-0 w-full transition-all duration-1000"
            style={{
              height: `${fillPercentage}%`,
              background: '#FF2975',
            }}
          >
            {/* Üst kısımda dalgalanma efekti */}
            <div className="wave-container">
              <div className="wave wave1"></div>
              <div className="wave wave2"></div>
            </div>
          </div>
        </div>
        
        {/* Sayaç içeriği */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {timeLeft <= 0 ? (
            <div className="text-center">
              <p className="text-[10px] sm:text-sm md:text-base font-bold text-[#1D1D1F] animate-pulse drop-shadow-md">Draw<br/>Starting...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="grid grid-cols-2 gap-1">
                <div className="flex flex-col items-center">
                  <span className="text-[11px] sm:text-lg font-bold">{days}</span>
                  <span className="text-[7px] sm:text-[10px] text-gray-500">Days</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] sm:text-lg font-bold">{hours}</span>
                  <span className="text-[7px] sm:text-[10px] text-gray-500">Hrs</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] sm:text-lg font-bold">{minutes}</span>
                  <span className="text-[7px] sm:text-[10px] text-gray-500">Min</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] sm:text-lg font-bold">{seconds}</span>
                  <span className="text-[7px] sm:text-[10px] text-gray-500">Sec</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Havuz miktarı */}
      <div className="flex items-center gap-1 mt-1 sm:mt-3">
        <p className="text-xs sm:text-base md:text-lg font-bold text-[#FF2975]">{poolAmount.toFixed(2)}</p>
        <Image src="/assets/luksologo.png" alt="LYX" width={12} height={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </div>

      <style jsx>{`
        .wave-container {
          position: absolute;
          top: -30px;
          left: 0;
          right: 0;
          height: 60px;
          overflow: hidden;
          background: white;
        }
        
        .wave {
          position: absolute;
          width: 300%;
          height: 80px;
          background: #FF2975;
          border-radius: 50%;
          left: -100%;
          box-shadow: none;
        }
        
        .wave1 {
          animation: wave 6s ease-in-out infinite;
          opacity: 1;
          top: 5px;
        }
        
        .wave2 {
          animation: wave 7s ease-in-out infinite;
          animation-delay: -3s;
          opacity: 0.95;
          top: 15px;
        }
        
        @keyframes wave {
          0%, 100% {
            transform: translateX(-15%) scaleY(0.7) scaleX(0.9);
            border-radius: 35% 65%;
          }
          25% {
            transform: translateX(-5%) scaleY(1.3) scaleX(0.8);
            border-radius: 40% 60%;
          }
          50% {
            transform: translateX(15%) scaleY(0.7) scaleX(0.9);
            border-radius: 65% 35%;
          }
          75% {
            transform: translateX(5%) scaleY(1.3) scaleX(0.8);
            border-radius: 60% 40%;
          }
        }
      `}</style>
    </div>
  );
}; 