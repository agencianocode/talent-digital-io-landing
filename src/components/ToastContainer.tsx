
import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToastContext } from '@/contexts/ToastContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-border bg-background';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className={`animate-fade-in shadow-lg ${getBackgroundColor(toast.type)}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {getIcon(toast.type)}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {toast.description}
                  </p>
                )}
                {toast.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={toast.action.onClick}
                  >
                    {toast.action.label}
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-transparent"
                onClick={() => removeToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ToastContainer;
