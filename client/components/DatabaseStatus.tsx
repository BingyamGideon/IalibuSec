import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authStore } from '@/lib/authStore';
import { RefreshCw, Database, HardDrive, Wifi, WifiOff } from 'lucide-react';

interface DatabaseStatus {
  isConnected: boolean;
  mode: 'api' | 'localStorage';
  message: string;
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus>({
    isConnected: false,
    mode: 'localStorage',
    message: 'Checking connection...'
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const result = await authStore.testDatabaseConnection();
      
      if (result.success) {
        setStatus({
          isConnected: true,
          mode: 'api',
          message: 'Connected to XAMPP MySQL'
        });
      } else if (result.error === 'API_UNAVAILABLE') {
        setStatus({
          isConnected: false,
          mode: 'localStorage',
          message: 'Using localStorage (cloud environment)'
        });
      } else {
        setStatus({
          isConnected: false,
          mode: 'localStorage',
          message: 'XAMPP not available, using localStorage'
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        mode: 'localStorage',
        message: 'Using localStorage fallback'
      });
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }
    
    if (status.isConnected) {
      return <Database className="h-3 w-3" />;
    } else if (status.mode === 'localStorage') {
      return <HardDrive className="h-3 w-3" />;
    } else {
      return <WifiOff className="h-3 w-3" />;
    }
  };

  const getStatusVariant = () => {
    if (status.isConnected) {
      return 'default'; // Green
    } else if (status.mode === 'localStorage') {
      return 'secondary'; // Gray
    } else {
      return 'destructive'; // Red
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant()} className="flex items-center gap-1 text-xs">
        {getStatusIcon()}
        {status.mode === 'api' ? 'MySQL' : 'Local'}
      </Badge>
      
      <span className="text-xs text-gray-600 hidden sm:inline">
        {status.message}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={checkConnection}
        disabled={isChecking}
        className="h-6 px-2 text-xs"
      >
        {isChecking ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <RefreshCw className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
