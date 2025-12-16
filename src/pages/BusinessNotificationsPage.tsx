import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, MessageCircle, Briefcase, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  created_at: string;
  read_at?: string;
  company_id?: string;
}

const BusinessNotificationsPage = () => {
  const { user } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Build query with company_id filter
      let query = supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id);
      
      // Filter by active company: show notifications for this company OR global (null company_id)
      if (activeCompany?.id) {
        query = query.or(`company_id.eq.${activeCompany.id},company_id.is.null`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data as any) || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user, activeCompany?.id]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Build query with company_id filter
      let query = supabase
        .from('notifications' as any)
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);
      
      // Only mark as read notifications for this company OR global
      if (activeCompany?.id) {
        query = query.or(`company_id.eq.${activeCompany.id},company_id.is.null`);
      }
      
      const { error } = await query;

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'opportunity':
        return <Briefcase className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Only mark as read, no navigation
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, actionUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 Navegando a notificación:', { actionUrl });
    
    // Handle external URLs
    if (/^https?:\/\//i.test(actionUrl)) {
      console.log('🌐 URL externa, abriendo en nueva pestaña');
      window.open(actionUrl, '_blank');
    } else {
      console.log('🔗 URL interna, usando navigate');
      navigate(actionUrl);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Debes iniciar sesión para ver las notificaciones</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} no leídas` : 'Todo al día'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
            <p className="text-muted-foreground">
              Aquí aparecerán tus nuevas notificaciones
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-6">
            {notifications.map(notification => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          {notification.title}
                          {!notification.read && (
                            <Badge variant="default" className="h-5 px-2">
                              Nuevo
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                  
                  {notification.action_url && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-2 text-primary"
                      onClick={(e) => handleActionClick(e, notification.action_url!)}
                    >
                      Ver detalles →
                    </Button>
                  )}
                </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessNotificationsPage;

