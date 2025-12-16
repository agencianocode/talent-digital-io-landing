import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useCompany } from '@/contexts/CompanyContext';

const NotificationCenter = () => {
  const { activeCompany } = useCompany();
  const { unreadCount } = useNotifications(activeCompany?.id);

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-auto text-xs">
      {unreadCount > 9 ? '9+' : unreadCount}
    </Badge>
  );
};

export default NotificationCenter;
