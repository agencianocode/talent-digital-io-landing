
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Bell, Users, Eye, MessageSquare } from 'lucide-react';

interface NotificationToastProps {
  type: 'application' | 'message' | 'opportunity';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const showNotificationToast = ({ 
  type, 
  title, 
  message, 
  actionText, 
  onAction 
}: NotificationToastProps) => {
  const getIcon = () => {
    switch (type) {
      case 'application':
        return <Users className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'opportunity':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'application':
        return 'text-green-600';
      case 'message':
        return 'text-blue-600';
      case 'opportunity':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  toast.custom((t) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md w-full">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${getColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">{message}</p>
          {actionText && onAction && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => {
                  onAction();
                  toast.dismiss(t);
                }}
                className="h-8 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                {actionText}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.dismiss(t)}
                className="h-8 text-xs"
              >
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  ), {
    duration: 8000,
    position: 'top-right',
  });
};

export const NotificationCenter = () => {
  // This could be expanded to show a notification center/inbox
  return null;
};