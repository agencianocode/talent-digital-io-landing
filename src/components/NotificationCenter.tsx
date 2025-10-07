import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationCenter = () => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-auto text-xs">
      {unreadCount > 9 ? '9+' : unreadCount}
    </Badge>
  );
};

export default NotificationCenter;
