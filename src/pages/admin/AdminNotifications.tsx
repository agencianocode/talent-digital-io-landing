import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash2, MessageCircle, Briefcase, AlertCircle, ShoppingBag, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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
}

interface AdminNotificationsProps {
  onTabChange?: (tab: string) => void;
}

const AdminNotifications = ({ onTabChange }: AdminNotificationsProps) => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'solicitudes' | 'mensajes' | 'oportunidades'>('todas');

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
  }, [user]);

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
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'opportunity':
        return <Briefcase className="h-5 w-5 text-green-600" />;
      case 'marketplace':
      case 'marketplace_request':
        return <ShoppingBag className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleContactUser = (notification: Notification) => {
    // Extract email from message (format: "Usuario X quiere publicar...")
    const messageMatch = notification.message.match(/Email: ([\w\.-]+@[\w\.-]+\.\w+)/);
    const email = messageMatch ? messageMatch[1] : '';
    
    if (email) {
      const mailtoLink = `mailto:${email}?subject=Solicitud de publicación de servicio&body=Hola,%0D%0A%0D%0AHemos recibido tu solicitud de publicación en el marketplace.%0D%0A%0D%0ASaludos,%0D%0AEquipo TalentoDigital`;
      window.location.href = mailtoLink;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Only mark as read, no navigation
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, actionUrl: string) => {
    e.stopPropagation();
    
    // Handle external URLs
    if (/^https?:\/\//i.test(actionUrl)) {
      window.location.assign(actionUrl);
      return;
    }
    
    // Handle marketplace notifications - redirect to publishing requests tab
    if (actionUrl.includes('/admin') && onTabChange) {
      onTabChange('publishing-requests');
      return;
    }
    
    // Handle message notifications for admin - redirect to admin chat tab
    if (actionUrl.includes('/messages/')) {
      if (onTabChange) {
        onTabChange('chat');
      }
      return;
    }
    
    // For other internal routes, navigate normally
    navigate(actionUrl);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'todas') return true;
    if (filter === 'solicitudes') return notification.type === 'marketplace' || notification.type === 'marketplace_request';
    if (filter === 'mensajes') return notification.type === 'message';
    if (filter === 'oportunidades') return notification.type === 'opportunity';
    return true;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Debes iniciar sesión para ver las notificaciones</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="truncate">Notificaciones</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} no leídas` : 'Todo al día'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead} 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto flex-shrink-0"
          >
            <Check className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Marcar todas como leídas</span>
            <span className="sm:hidden">Marcar todas</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-4 sm:mb-6">
        <TabsList className="grid w-full grid-cols-4 h-auto sm:h-10 gap-0.5 sm:gap-0">
          <TabsTrigger 
            value="todas" 
            className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap"
          >
            Todas
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 hidden sm:inline-flex text-xs">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="solicitudes" 
            className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap"
          >
            Solicitudes
            {notifications.filter(n => n.type === 'marketplace' || n.type === 'marketplace_request').length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 hidden sm:inline-flex text-xs">
                {notifications.filter(n => n.type === 'marketplace' || n.type === 'marketplace_request').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="mensajes" 
            className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap"
          >
            Mensajes
            {notifications.filter(n => n.type === 'message').length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 hidden sm:inline-flex text-xs">
                {notifications.filter(n => n.type === 'message').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="oportunidades" 
            className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap"
          >
            Oportunidades
            {notifications.filter(n => n.type === 'opportunity').length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 hidden sm:inline-flex text-xs">
                {notifications.filter(n => n.type === 'opportunity').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'todas' ? 'No tienes notificaciones' : `No hay notificaciones de ${filter}`}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'todas' 
                ? 'Aquí aparecerán tus nuevas notificaciones'
                : 'Prueba con otro filtro para ver más notificaciones'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 pb-6">
            {filteredNotifications.map(notification => (
              <Card
                key={notification.id}
                className={`p-3 sm:p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                          <span className="truncate">{notification.title}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <Badge variant="default" className="h-5 px-2 text-xs">
                                Nuevo
                              </Badge>
                            )}
                            {(notification.type === 'marketplace' || notification.type === 'marketplace_request') && (
                              <Badge variant="secondary" className="h-5 px-2 bg-purple-100 text-purple-800 text-xs">
                                Solicitud
                              </Badge>
                            )}
                          </div>
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                          {notification.message}
                        </p>
                        
                        {/* Display marketplace request details if available */}
                        {(notification.type === 'marketplace' || notification.type === 'marketplace_request') && (notification as any).data && (
                          <div className="mt-2 p-2 bg-muted/30 rounded-md space-y-1 text-xs">
                            {(notification as any).data.contact_name && (
                              <p className="truncate"><span className="font-medium">Contacto:</span> {(notification as any).data.contact_name}</p>
                            )}
                            {(notification as any).data.contact_email && (
                              <p className="truncate"><span className="font-medium">Email:</span> {(notification as any).data.contact_email}</p>
                            )}
                            {(notification as any).data.company_name && (
                              <p className="truncate"><span className="font-medium">Empresa:</span> {(notification as any).data.company_name}</p>
                            )}
                            {(notification as any).data.service_type && (
                              <p className="truncate"><span className="font-medium">Servicio:</span> {(notification as any).data.service_type}</p>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                       
                        <div className="flex flex-wrap gap-2 mt-2">
                          {notification.action_url && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-primary text-xs sm:text-sm"
                              onClick={(e) => handleActionClick(e, notification.action_url!)}
                            >
                              Ver detalles →
                            </Button>
                          )}
                          {notification.type === 'marketplace_request' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs sm:text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactUser(notification);
                              }}
                            >
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Contactar
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 sm:mt-0 mt-2 sm:mt-0">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default AdminNotifications;