'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useUPProvider } from '@/hooks/useUPProvider';

interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  details?: any;
}

type TabType = 'console' | 'info';

export function MobileDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');
  const [activeTab, setActiveTab] = useState<TabType>('console');
  const [debugEnabled, setDebugEnabled] = useState(false);
  const logIdRef = useRef(0);
  const originalConsole = useRef<{
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  } | null>(null);

  // Get system info
  const { isConnected, account, web3 } = useUPProvider();
  const [systemInfo, setSystemInfo] = useState({
    userAgent: '',
    screenSize: '',
    network: '',
    memory: '',
    connection: ''
  });

  // Check if debug is enabled via URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const debugParam = urlParams.get('debug');
      const envEnabled = process.env.NEXT_PUBLIC_DEBUG_ENABLED === 'true';
      const isDev = process.env.NODE_ENV === 'development';
      
      setDebugEnabled(debugParam === 'true' || envEnabled || isDev);
    }
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('debugPanelState');
      if (savedState) {
        try {
          const { isOpen: savedIsOpen, activeTab: savedTab } = JSON.parse(savedState);
          setIsOpen(savedIsOpen);
          setActiveTab(savedTab || 'console');
        } catch (e) {
          console.error('Failed to parse debug panel state:', e);
        }
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('debugPanelState', JSON.stringify({ isOpen, activeTab }));
    }
  }, [isOpen, activeTab]);

  // Debug commands
  const clearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      console.info('All caches cleared!');
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    // Update system info
    const updateSystemInfo = () => {
      setSystemInfo({
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth} x ${window.innerHeight}`,
        network: navigator.onLine ? 'Online' : 'Offline',
        memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown',
        connection: (navigator as any).connection?.effectiveType || 'Unknown'
      });
    };

    updateSystemInfo();
    window.addEventListener('resize', updateSystemInfo);
    window.addEventListener('online', updateSystemInfo);
    window.addEventListener('offline', updateSystemInfo);

    return () => {
      window.removeEventListener('resize', updateSystemInfo);
      window.removeEventListener('online', updateSystemInfo);
      window.removeEventListener('offline', updateSystemInfo);
    };
  }, []);

  useEffect(() => {
    // Only setup console overrides if debug is enabled
    if (!debugEnabled) return;

    // Store original console methods
    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    // Override console methods
    const addLog = (type: LogEntry['type'], ...args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const logEntry: LogEntry = {
        id: logIdRef.current++,
        type,
        message,
        timestamp: new Date(),
        details: args.length === 1 && typeof args[0] === 'object' ? args[0] : undefined
      };

      setLogs(prev => [...prev.slice(-99), logEntry]); // Keep last 100 logs

      // Call original console method
      originalConsole.current![type](...args);
    };

    console.log = (...args) => addLog('log', ...args);
    console.error = (...args) => addLog('error', ...args);
    console.warn = (...args) => addLog('warn', ...args);
    console.info = (...args) => addLog('info', ...args);

    // Catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      addLog('error', `Unhandled error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    window.addEventListener('error', handleError);

    // Catch unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog('error', `Unhandled promise rejection:`, event.reason);
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      // Restore original console methods
      if (originalConsole.current) {
        console.log = originalConsole.current.log;
        console.error = originalConsole.current.error;
        console.warn = originalConsole.current.warn;
        console.info = originalConsole.current.info;
      }
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [debugEnabled]);

  // Show debug panel if explicitly enabled via env variable
  // const debugEnabled = process.env.NEXT_PUBLIC_DEBUG_ENABLED === 'true' || process.env.NODE_ENV === 'development';
  
  if (!debugEnabled) return null;

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warn': return 'text-yellow-400 bg-yellow-900/20';
      case 'info': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-300 bg-gray-900/20';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <>
      {/* Floating Debug Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
          aria-label="Open debug panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {logs.filter(l => l.type === 'error').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {logs.filter(l => l.type === 'error').length}
            </span>
          )}
        </button>
      )}

      {/* Debug Panel */}
      {isOpen && (
        <div className={`fixed inset-x-0 bottom-0 z-50 bg-gray-900 border-t border-gray-700 shadow-2xl transition-all duration-300 ${
          isMinimized ? 'h-12' : 'h-96'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Debug Panel</span>
              {activeTab === 'console' && (
                <span className="text-xs text-gray-400">({filteredLogs.length} logs)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-gray-400 hover:text-white"
              >
                {isMinimized ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-2 p-2 bg-gray-850 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                    activeTab === 'console' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Console
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                    activeTab === 'info' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  <InformationCircleIcon className="w-4 h-4" />
                  System Info
                </button>
              </div>

              {/* Content */}
              {activeTab === 'console' ? (
                <>
                  {/* Filters */}
                  <div className="flex items-center gap-2 p-2 bg-gray-850 border-b border-gray-700">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 text-xs rounded ${
                        filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('log')}
                      className={`px-3 py-1 text-xs rounded ${
                        filter === 'log' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Log
                    </button>
                    <button
                      onClick={() => setFilter('error')}
                      className={`px-3 py-1 text-xs rounded ${
                        filter === 'error' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Error
                    </button>
                    <button
                      onClick={() => setFilter('warn')}
                      className={`px-3 py-1 text-xs rounded ${
                        filter === 'warn' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Warn
                    </button>
                    <button
                      onClick={() => setFilter('info')}
                      className={`px-3 py-1 text-xs rounded ${
                        filter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Info
                    </button>
                    <div className="ml-auto">
                      <button
                        onClick={clearLogs}
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ height: 'calc(100% - 120px)' }}>
                    {filteredLogs.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No logs to display
                      </div>
                    ) : (
                      filteredLogs.map(log => (
                        <div
                          key={log.id}
                          className={`p-2 rounded text-xs font-mono ${getLogColor(log.type)}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                            <span className="font-semibold uppercase">
                              [{log.type}]
                            </span>
                            <pre className="flex-1 whitespace-pre-wrap break-all">
                              {log.message}
                            </pre>
                          </div>
                          {log.details && (
                            <details className="mt-1 ml-4">
                              <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                                Show details
                              </summary>
                              <pre className="mt-1 text-xs whitespace-pre-wrap break-all">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* System Info Tab */
                <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 88px)' }}>
                  <div className="space-y-4">
                    {/* Wallet Info */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-sm font-semibold text-white mb-2">Wallet Connection</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        {account && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Address:</span>
                            <span className="text-gray-300 font-mono">
                              {account.slice(0, 6)}...{account.slice(-4)}
                            </span>
                          </div>
                        )}
                        {web3 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Network:</span>
                            <span className="text-gray-300">LUKSO Testnet</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Device Info */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-sm font-semibold text-white mb-2">Device Info</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Screen:</span>
                          <span className="text-gray-300">{systemInfo.screenSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network:</span>
                          <span className={systemInfo.network === 'Online' ? 'text-green-400' : 'text-red-400'}>
                            {systemInfo.network}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Connection:</span>
                          <span className="text-gray-300">{systemInfo.connection}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Memory:</span>
                          <span className="text-gray-300">{systemInfo.memory}</span>
                        </div>
                      </div>
                    </div>

                    {/* User Agent */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-sm font-semibold text-white mb-2">User Agent</h3>
                      <p className="text-xs text-gray-300 font-mono break-all">
                        {systemInfo.userAgent}
                      </p>
                    </div>

                    {/* App Info */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-sm font-semibold text-white mb-2">App Info</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Environment:</span>
                          <span className="text-gray-300">{process.env.NODE_ENV}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Build Time:</span>
                          <span className="text-gray-300">{new Date().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Debug Actions */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-sm font-semibold text-white mb-2">Debug Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={clearCache}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Clear All Cache
                        </button>
                        <button
                          onClick={reloadPage}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Reload Page
                        </button>
                        <button
                          onClick={() => {
                            console.log('=== Debug Info ===');
                            console.log('Wallet:', { isConnected, account });
                            console.log('System:', systemInfo);
                            console.log('Logs count:', logs.length);
                          }}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Log Debug Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}