import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Mail, 
  MessageSquare,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

type NotificationType = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  email: boolean;
  push: boolean;
};

const notificationSettingsSchema = z.object({
  notifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    enabled: z.boolean(),
    email: z.boolean(),
    push: z.boolean(),
  })),
});

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

// Default notifications for talent users
const talentNotifications: NotificationType[] = [
  {
    id: 'new_opportunities',
    name: 'Nuevas Oportunidades',
    description: 'Recibe notificaciones cuando hay nuevas oportunidades que coinciden con tu perfil.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'messages',
    name: 'Mensajes Directos',
    description: 'Notificaciones cuando recibes nuevos mensajes de empresas.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'company_invitations',
    name: 'Invitaciones de Empresas',
    description: 'Recibe notificaciones cuando las empresas te envíen invitaciones.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'profile_views',
    name: 'Vistas de Perfil',
    description: 'Notificaciones cuando las empresas vean tu perfil.',
    enabled: false,
    email: true,
    push: false,
  },
  {
    id: 'application_updates',
    name: 'Actualizaciones de Aplicaciones',
    description: 'Notificaciones sobre el estado de tus aplicaciones.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'marketplace_inquiries',
    name: 'Consultas del Marketplace',
    description: 'Notificaciones cuando alguien consulte por tus servicios.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'marketplace_views',
    name: 'Vistas en mis publicaciones de marketplace',
    description: 'Recibe notificaciones cuando alguien vea tus servicios en el marketplace.',
    enabled: true,
    email: false,
    push: true,
  },
  {
    id: 'weekly_digest',
    name: 'Resumen Semanal',
    description: 'Recibe un resumen semanal de actividad y oportunidades.',
    enabled: true,
    email: true,
    push: false,
  },
  {
    id: 'system_updates',
    name: 'Actualizaciones del Sistema',
    description: 'Notificaciones sobre nuevas funciones y mantenimiento.',
    enabled: true,
    email: true,
    push: false,
  },
];

// Default notifications for business users
const businessNotifications: NotificationType[] = [
  {
    id: 'new_applications',
    name: 'Nuevas Aplicaciones',
    description: 'Notificaciones cuando candidatos apliquen a tus oportunidades.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'messages',
    name: 'Mensajes Directos',
    description: 'Notificaciones cuando recibes nuevos mensajes de candidatos.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'team_requests',
    name: 'Solicitudes de Equipo',
    description: 'Notificaciones cuando alguien solicite unirse a tu equipo.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'opportunity_milestones',
    name: 'Hitos de Oportunidades',
    description: 'Notificaciones sobre hitos alcanzados (5, 10, 25, 50, 100 aplicantes).',
    enabled: true,
    email: true,
    push: false,
  },
  {
    id: 'opportunity_expiring',
    name: 'Oportunidades por Vencer',
    description: 'Notificaciones cuando tus oportunidades estén por expirar.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'marketplace_services',
    name: 'Servicios del Marketplace',
    description: 'Notificaciones sobre consultas de servicios publicados.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'weekly_digest',
    name: 'Resumen Semanal',
    description: 'Recibe un resumen semanal de actividad de tus oportunidades.',
    enabled: true,
    email: true,
    push: false,
  },
  {
    id: 'system_updates',
    name: 'Actualizaciones del Sistema',
    description: 'Notificaciones sobre nuevas funciones y mantenimiento.',
    enabled: true,
    email: true,
    push: false,
  },
];

interface UserNotificationSettingsProps {
  userType?: 'talent' | 'business';
}

const UserNotificationSettings: React.FC<UserNotificationSettingsProps> = ({ 
  userType = 'talent' 
}) => {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const defaultNotifications = userType === 'business' ? businessNotifications : talentNotifications;

  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      notifications: defaultNotifications,
    }
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        // Merge loaded preferences with defaults
        const loadedNotifications = defaultNotifications.map(defaultNotif => {
          const userPref = data.find(d => d.notification_type === defaultNotif.id);
          if (userPref) {
            return {
              ...defaultNotif,
              enabled: userPref.enabled,
              email: userPref.email,
              sms: userPref.sms,
              push: userPref.push,
            };
          }
          return defaultNotif;
        });

        form.reset({
          notifications: loadedNotifications,
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast.error('Error al cargar la configuración de notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: NotificationSettingsFormData) => {
    if (!user) {
      toast.error('Debes estar autenticado');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Prepare upsert data
      const prefsToSave = data.notifications.map(notif => ({
        user_id: user.id,
        notification_type: notif.id,
        enabled: notif.enabled,
        email: notif.email,
        push: notif.push,
      }));

      // Upsert all preferences
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert(prefsToSave, {
          onConflict: 'user_id,notification_type',
        });

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      toast.success('Configuración de notificaciones guardada');
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración' });
      toast.error('Error al guardar la configuración');
      
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notificaciones</h2>
          <p className="text-muted-foreground">Configura cómo y cuándo recibir notificaciones</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Notifications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Preferencias de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[40px,1fr,120px,180px] gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
                  <div></div>
                  <div>Tipo de Notificación</div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Notificaciones en la app</span>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y">
                  {form.watch('notifications').map((notification, index) => (
                    <div 
                      key={notification.id}
                      className="grid grid-cols-[40px,1fr,120px,180px] gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      {/* Toggle Switch */}
                      <div className="flex items-start pt-1">
                        <FormField
                          control={form.control}
                          name={`notifications.${index}.enabled`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Notification Name & Description */}
                      <div className="flex flex-col gap-1">
                        <FormLabel className="text-sm font-medium">
                          {notification.name}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {notification.description}
                        </p>
                      </div>

                      {/* Email Checkbox */}
                      <div className="flex items-start justify-center pt-1">
                        <FormField
                          control={form.control}
                          name={`notifications.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!form.watch(`notifications.${index}.enabled`)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Push Checkbox */}
                      <div className="flex items-start justify-center pt-1">
                        <FormField
                          control={form.control}
                          name={`notifications.${index}.push`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!form.watch(`notifications.${index}.enabled`)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Estas preferencias son respetadas siempre que el administrador 
                  haya habilitado el tipo de notificación. Si un tipo de notificación está deshabilitado 
                  globalmente, no recibirás notificaciones de ese tipo independientemente de tu configuración.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Message */}
          {saveMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200' 
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
            }`}>
              {saveMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{saveMessage.text}</span>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserNotificationSettings;
