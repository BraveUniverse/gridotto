'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

export default function DebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Store original console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Override console methods
    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('info', args);
    };

    // Cleanup
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  const addLog = (type: LogEntry['type'], args: any[]) => {
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

    setLogs(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    }].slice(-100)); // Keep last 100 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary/90 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary transition-colors"
      >
        Debug Console ({logs.length})
      </button>
    );
  }

  return (
    <div className={`fixed z-50 bg-black/95 border border-white/10 rounded-lg shadow-2xl transition-all ${
      isMinimized 
        ? 'bottom-4 right-4 w-64 h-12' 
        : 'bottom-4 right-4 w-96 h-96 md:w-[600px] md:h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/50 rounded-t-lg">
        <h3 className="text-sm font-semibold text-white">Debug Console</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
          >
            Clear
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/60 hover:text-white"
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div className="overflow-y-auto h-[calc(100%-48px)] p-3 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center mt-8">No logs yet...</p>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="border-b border-white/5 pb-2">
                  <div className="flex items-start gap-2">
                    <span className={`font-bold ${getLogColor(log.type)}`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-gray-300 whitespace-pre-wrap break-all mt-1">
                    {log.message}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}