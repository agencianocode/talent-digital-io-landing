import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define notification types with their channels
type NotificationType = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  email: boolean;
  push: boolean;
};

const notificationSettingsSchema = z.object({
  admin_email: z.string().email().optional().or(z.literal('')),
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

const defaultNotifications: NotificationType[] = [
  // === Usuarios y Empresas ===
  {
    id: 'new_user_registration',
    name: 'Nuevos Registros de Usuario',
    description: 'Recibe una notificación cuando se registre un nuevo usuario en la plataforma.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'user_email_verification',
    name: 'Verificación de Email',
    description: 'Notificación cuando un usuario verifique su correo electrónico.',
    enabled: false,
    email: true,
    push: false,
  },
  {
    id: 'user_profile_completion',
    name: 'Perfil Completado',
    description: 'Notificación cuando un usuario complete su perfil.',
    enabled: false,
    email: true,
    push: false,
  },
  {
    id: 'new_company_registration',
    name: 'Nueva Empresa Registrada',
    description: 'Recibe una notificación cuando se registre una nueva empresa.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'company_upgrade_request',
    name: 'Solicitud de Upgrade',
    description: 'Notificación cuando una empresa solicite un upgrade de plan.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'company_verification',
    name: 'Verificación de Empresa',
    description: 'Notificación cuando una empresa complete su verificación.',
    enabled: true,
    email: true,
    push: false,
  },
  
  // === Reportes y Moderación ===
  {
    id: 'opportunity_reports',
    name: 'Reportes de Oportunidades',
    description: 'Notificación cuando se reporte contenido en oportunidades.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'marketplace_reports',
    name: 'Reportes del Marketplace',
    description: 'Notificación cuando se reporte contenido en el marketplace.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'user_reports',
    name: 'Reportes de Usuarios',
    description: 'Notificación cuando se reporte un usuario.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'content_approval',
    name: 'Aprobación de Contenido',
    description: 'Notificación cuando haya contenido pendiente de aprobar.',
    enabled: true,
    email: true,
    push: false,
  },
  
  // === Soporte y Feedback ===
  {
    id: 'new_bug_report',
    name: 'Nuevos Reportes de Problemas',
    description: 'Recibir notificaciones cuando un usuario reporte un problema.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'new_bug_report_comment_admin',
    name: 'Comentarios en Reportes de Problemas',
    description: 'Recibir notificaciones cuando un usuario comente en un reporte.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'new_feedback',
    name: 'Nuevas Sugerencias de Mejora',
    description: 'Recibir notificaciones cuando un usuario sugiera una mejora.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'new_feedback_comment_admin',
    name: 'Comentarios en Sugerencias',
    description: 'Recibir notificaciones cuando un usuario comente en una sugerencia.',
    enabled: true,
    email: true,
    push: true,
  },
  
  // === Sistema ===
  {
    id: 'system_errors',
    name: 'Errores del Sistema',
    description: 'Notificación cuando ocurran errores críticos en el sistema.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'performance_issues',
    name: 'Problemas de Rendimiento',
    description: 'Notificación cuando se detecten problemas de rendimiento.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'security_alerts',
    name: 'Alertas de Seguridad',
    description: 'Notificación de alertas de seguridad críticas.',
    enabled: true,
    email: true,
    push: true,
  },
  {
    id: 'backup_status',
    name: 'Estado de Backups',
    description: 'Notificación sobre el estado de los backups automáticos.',
    enabled: false,
    email: true,
    push: false,
  },
];

const AdminNotificationSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      admin_email: '',
      notifications: defaultNotifications,
    }
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', 'notifications');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        // Load admin email
        const adminEmailSetting = data.find(s => s.key === 'admin_email');
        
        // Load notifications array
        const notificationsSetting = data.find(s => s.key === 'notifications');
        const loadedNotifications = notificationsSetting && notificationsSetting.value
          ? JSON.parse(notificationsSetting.value)
          : defaultNotifications;

        form.reset({
          admin_email: adminEmailSetting?.value || '',
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
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const settingsToSave = [
        {
          key: 'admin_email',
          value: data.admin_email || '',
          type: 'string',
          category: 'notifications'
        },
        {
          key: 'notifications',
          value: JSON.stringify(data.notifications),
          type: 'json',
          category: 'notifications'
        }
      ];

      // Delete existing settings
      await supabase
        .from('admin_settings')
        .delete()
        .eq('category', 'notifications');

      // Insert new settings
      const { error } = await supabase
        .from('admin_settings')
        .insert(settingsToSave);

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Configuración de notificaciones guardada correctamente' });
      toast.success('Configuración de notificaciones guardada correctamente');
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración de notificaciones' });
      toast.error('Error al guardar la configuración de notificaciones');
      
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Admin Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="admin_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del Administrador</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="admin@ejemplo.com" />
                    </FormControl>
                    <p className="text-sm text-muted-foreground mt-1">
                      Email donde recibir las notificaciones administrativas
                    </p>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notifications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Tipos de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[40px,1fr,120px,140px] gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
                  <div></div>
                  <div>Notificación</div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="hidden sm:inline">Web App</span>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y">
                  {form.watch('notifications').map((notification, index) => (
                    <div 
                      key={notification.id}
                      className="grid grid-cols-[40px,1fr,120px,140px] gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      {/* Toggle Switch */}
                      <div className="flex items-start pt-1">
                        <FormField
                          control={form.control}
                          name={`notifications.${index}.enabled`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="switch-mobile-oval">
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </div>
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
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminNotificationSettings;
