import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

export default function OfflineIndicator() {
  const isOffline = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg flex items-center space-x-2">
      <WifiOff className="h-5 w-5 text-yellow-600" />
      <span className="text-sm text-yellow-800">
        You're offline. Some features may be limited.
      </span>
    </div>
  );
}