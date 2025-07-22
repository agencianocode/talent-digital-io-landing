
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressLoaderProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  autoProgress?: boolean;
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  isLoading,
  message = 'Cargando...',
  progress: controlledProgress,
  autoProgress = false
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    if (controlledProgress !== undefined) {
      setProgress(controlledProgress);
      return;
    }

    if (autoProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading, controlledProgress, autoProgress]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-foreground">{message}</h3>
            </div>
            
            {(controlledProgress !== undefined || autoProgress) && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {Math.round(progress)}%
                </p>
              </div>
            )}
            
            {!autoProgress && controlledProgress === undefined && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressLoader;
