import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  Mail, 
  Eye, 
  Share2, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  emailNotifications: boolean;
  profileViews: boolean;
  newMessages: boolean;
  profileShares: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ProfileNotifications: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    profileViews: true,
    newMessages: true,
    profileShares: false,
    weeklyDigest: true,
    marketingEmails: false
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'success',
      title: 'Perfil actualizado',
      message: 'Tu perfil ha sido actualizado exitosamente',
      timestamp: 'Hace 2 horas',
      read: false,
      action: {
        label: 'Ver perfil',
        onClick: () => console.log('Ver perfil')
      }
    },
    {
      id: '2',
      type: 'info',
      title: 'Nueva visualización',
      message: 'Tu perfil fue visto por 3 personas esta semana',
      timestamp: 'Hace 1 día',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Perfil incompleto',
      message: 'Completa tu perfil para aumentar tu visibilidad',
      timestamp: 'Hace 3 días',
      read: true,
      action: {
        label: 'Completar perfil',
        onClick: () => console.log('Completar perfil')
      }
    }
  ]);

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Configuración actualizada');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notificaciones por email</p>
                <p className="text-xs text-gray-500">Recibe notificaciones importantes por email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Visualizaciones del perfil</p>
                <p className="text-xs text-gray-500">Notificaciones cuando alguien ve tu perfil</p>
              </div>
              <Switch
                checked={settings.profileViews}
                onCheckedChange={(checked) => handleSettingChange('profileViews', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Nuevos mensajes</p>
                <p className="text-xs text-gray-500">Notificaciones de mensajes recibidos</p>
              </div>
              <Switch
                checked={settings.newMessages}
                onCheckedChange={(checked) => handleSettingChange('newMessages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Compartir perfil</p>
                <p className="text-xs text-gray-500">Notificaciones cuando alguien comparte tu perfil</p>
              </div>
              <Switch
                checked={settings.profileShares}
                onCheckedChange={(checked) => handleSettingChange('profileShares', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Resumen semanal</p>
                <p className="text-xs text-gray-500">Recibe un resumen de tu actividad semanal</p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Emails de marketing</p>
                <p className="text-xs text-gray-500">Recibe ofertas y promociones especiales</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones Recientes
            </CardTitle>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{unreadCount} sin leer</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Marcar todas como leídas
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay notificaciones
              </h4>
              <p className="text-sm text-gray-600">
                Te notificaremos cuando tengas actualizaciones importantes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        {notification.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              notification.action?.onClick();
                              markAsRead(notification.id);
                            }}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Configurar Email
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Pausar Notificaciones
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir Perfil
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
