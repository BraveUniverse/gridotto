import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinish?: () => void;
  duration?: number; // milisaniye cinsinden
}

export const LoadingScreen = ({ onFinish, duration = 3000 }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <h1 className="text-responsive-4xl font-bold mb-responsive-lg">
          <span className="text-primary">Grid</span>
          <span className="text-gray-800">otto</span>
        </h1>
        
        <div className="w-[280px] h-[8px] bg-gray-200 rounded-full overflow-hidden mb-responsive-sm">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-responsive-base text-gray-800 font-medium">
          Loading... {progress}%
        </p>
      </div>
    </div>
  );
}; 