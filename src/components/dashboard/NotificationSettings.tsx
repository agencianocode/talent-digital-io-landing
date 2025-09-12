import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor,
  Settings 
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

interface NotificationPreferences {
  browserNotifications: boolean;
  soundNotifications: boolean;
  emailNotifications: boolean;
  newApplications: boolean;
  applicationUpdates: boolean;
  opportunityExpiring: boolean;
  weeklyReports: boolean;
  notificationTiming: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  browserNotifications: true,
  soundNotifications: true,
  emailNotifications: true,
  newApplications: true,
  applicationUpdates: true,
  opportunityExpiring: true,
  weeklyReports: true,
  notificationTiming: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

const NotificationSettings: React.FC = () => {
  const { user } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem(`notification_prefs_${activeCompany?.id}`);
    if (savedPrefs) {
      setPreferences({ ...defaultPreferences, ...JSON.parse(savedPrefs) });
    }

    // Check current notification permission
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, [activeCompany]);

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem(`notification_prefs_${activeCompany?.id}`, JSON.stringify(newPrefs));
      
      // In a real app, you'd also save to your backend
      // await supabase.from('notification_preferences').upsert({
      //   user_id: user?.id,
      //   company_id: activeCompany?.id,
      //   preferences: newPrefs
      // });

      setPreferences(newPrefs);
      toast.success('Preferencias de notificación guardadas');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar las preferencias');
    } finally {
      setIsLoading(false);
    }
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
      
      if (permission === 'granted') {
        await savePreferences({ ...preferences, browserNotifications: true });
        toast.success('Notificaciones del navegador habilitadas');
      } else {
        toast.error('Permisos de notificación denegados');
      }
    }
  };

  const testNotification = () => {
    if (hasPermission) {
      new Notification('¡Notificación de prueba!', {
        body: 'Este es un ejemplo de cómo se verán las notificaciones.',
        icon: '/favicon.ico'
      });
    } else {
      toast.error('Primero habilita las notificaciones del navegador');
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    savePreferences(newPrefs);
  };

  const updateQuietHours = (field: 'enabled' | 'start' | 'end', value: any) => {
    const newQuietHours = { ...preferences.quietHours, [field]: value };
    const newPrefs = { ...preferences, quietHours: newQuietHours };
    savePreferences(newPrefs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personaliza cómo y cuándo recibir notificaciones sobre aplicaciones y actividad.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="text-base font-medium">Notificaciones del Navegador</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas directamente en tu navegador
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasPermission ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Bell className="h-3 w-3 mr-1" />
                  Habilitado
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <BellOff className="h-3 w-3 mr-1" />
                  Deshabilitado
                </Badge>
              )}
              {!hasPermission ? (
                <Button size="sm" onClick={requestBrowserPermission}>
                  Habilitar
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={testNotification}>
                  Probar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {preferences.soundNotifications ? (
              <Volume2 className="h-5 w-5 text-purple-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <Label className="text-base font-medium">Sonidos de Notificación</Label>
              <p className="text-sm text-muted-foreground">
                Reproducir sonido cuando lleguen nuevas aplicaciones
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.soundNotifications}
            onCheckedChange={(checked) => updatePreference('soundNotifications', checked)}
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-5 w-5 text-green-600" />
            <div>
              <Label className="text-base font-medium">Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe resúmenes por correo electrónico
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
          />
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h4 className="font-medium">Tipos de Notificación</h4>
          
          <div className="space-y-3 pl-4 border-l-2 border-primary/20">
            <div className="flex items-center justify-between">
              <Label>Nuevas aplicaciones</Label>
              <Switch
                checked={preferences.newApplications}
                onCheckedChange={(checked) => updatePreference('newApplications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Actualizaciones de aplicaciones</Label>
              <Switch
                checked={preferences.applicationUpdates}
                onCheckedChange={(checked) => updatePreference('applicationUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Oportunidades por expirar</Label>
              <Switch
                checked={preferences.opportunityExpiring}
                onCheckedChange={(checked) => updatePreference('opportunityExpiring', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Reportes semanales</Label>
              <Switch
                checked={preferences.weeklyReports}
                onCheckedChange={(checked) => updatePreference('weeklyReports', checked)}
              />
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Configuración de Tiempo</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frecuencia de notificaciones</Label>
              <Select
                value={preferences.notificationTiming}
                onValueChange={(value: 'immediate' | 'hourly' | 'daily') => 
                  updatePreference('notificationTiming', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Inmediata</SelectItem>
                  <SelectItem value="hourly">Cada hora</SelectItem>
                  <SelectItem value="daily">Diaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Horas de silencio</Label>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
              />
            </div>
            
            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label className="text-sm">Desde</Label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Hasta</Label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => savePreferences(defaultPreferences)}
            disabled={isLoading}
          >
            Restaurar valores por defecto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;