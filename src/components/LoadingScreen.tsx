import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const LoadingScreen = ({ onFinish, duration = 2000 }: LoadingScreenProps) => {
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
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, duration / 20);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(var(--background))]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))/20] via-transparent to-[rgb(var(--accent-purple))/20]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-[rgb(var(--primary))/10] rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[rgb(var(--accent-purple))/10] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-light))] rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))] flex items-center justify-center animate-glow">
              <span className="text-4xl font-bold text-white">G</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-2">
          <span className="gradient-text">Grid</span>
          <span className="text-white">otto</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-400 mb-8">Next-Gen Lottery Platform</p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-light))] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full bg-white/20 animate-shimmer"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Loading</span>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}; 