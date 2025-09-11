import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfileManager } from '@/contexts/ProfileManagerContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimizations';
import { 
  Activity, 
  Database, 
  Zap, 
  RefreshCw, 
  Settings,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

interface PerformanceDashboardProps {
  showInProduction?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  showInProduction = false 
}) => {
  const { 
    isRealTimeEnabled, 
    toggleRealTime, 
    getCacheStats, 
    invalidateCache,
    profileData 
  } = useProfileManager();
  
  const { getMetrics } = usePerformanceMonitor();
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  
  // Only show in development or if explicitly enabled in production
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  useEffect(() => {
    const updateMetrics = () => {
      setPerformanceMetrics(getMetrics());
      setCacheStats(getCacheStats());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, [getMetrics, getCacheStats]);

  if (!performanceMetrics || !cacheStats) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-time Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRealTimeEnabled ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Tiempo Real</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleRealTime(!isRealTimeEnabled)}
          >
            {isRealTimeEnabled ? 'Desactivar' : 'Activar'}
          </Button>
        </div>

        {/* Cache Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Cache</span>
            </div>
            <Badge variant="outline">
              {cacheStats.cacheHitRate.toFixed(1)}% hit rate
            </Badge>
          </div>
          <Progress value={cacheStats.cacheHitRate} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {cacheStats.size} entradas, {cacheStats.staleCacheCount} obsoletas
          </div>
        </div>

        {/* Render Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Rendimiento</span>
            </div>
            <Badge 
              variant={performanceMetrics.averageRenderTime < 50 ? "default" : "destructive"}
            >
              {performanceMetrics.averageRenderTime.toFixed(1)}ms
            </Badge>
          </div>
          {performanceMetrics.slowRenders > 0 && (
            <div className="text-xs text-yellow-600">
              ⚠️ {performanceMetrics.slowRenders} renders lentos detectados
            </div>
          )}
        </div>

        {/* API Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">API</span>
            </div>
            <Badge variant="outline">
              {performanceMetrics.averageApiTime.toFixed(0)}ms
            </Badge>
          </div>
        </div>

        {/* Profile Data Status */}
        {profileData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Datos</span>
              </div>
              <Badge variant={profileData.isStale ? "destructive" : "default"}>
                {profileData.isStale ? 'Obsoleto' : 'Actualizado'}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Última actualización: {profileData.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={invalidateCache}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Limpiar Cache
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <Settings className="h-3 w-3 mr-1" />
            Recargar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;