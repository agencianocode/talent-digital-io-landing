import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Shield,
  Database,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const notificationSettingsSchema = z.object({
  // General Notifications
  enable_notifications: z.boolean(),
  notification_frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  
  // User Registration Notifications
  notify_new_user_registration: z.boolean(),
  notify_user_email_verification: z.boolean(),
  notify_user_profile_completion: z.boolean(),
  
  // Company Notifications
  notify_new_company_registration: z.boolean(),
  notify_company_upgrade_request: z.boolean(),
  notify_company_verification: z.boolean(),
  
  // Content Moderation Notifications
  notify_opportunity_reports: z.boolean(),
  notify_marketplace_reports: z.boolean(),
  notify_user_reports: z.boolean(),
  notify_content_approval: z.boolean(),
  
  // System Notifications
  notify_system_errors: z.boolean(),
  notify_performance_issues: z.boolean(),
  notify_security_alerts: z.boolean(),
  notify_backup_status: z.boolean(),
  
  // Email Settings
  admin_email: z.string().email().optional().or(z.literal('')),
  email_notifications_enabled: z.boolean(),
  sms_notifications_enabled: z.boolean(),
  push_notifications_enabled: z.boolean(),
  
  // Notification Channels
  notify_via_email: z.boolean(),
  notify_via_sms: z.boolean(),
  notify_via_push: z.boolean(),
  notify_via_dashboard: z.boolean(),
});

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

const AdminNotificationSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      enable_notifications: true,
      notification_frequency: 'immediate',
      notify_new_user_registration: true,
      notify_user_email_verification: false,
      notify_user_profile_completion: false,
      notify_new_company_registration: true,
      notify_company_upgrade_request: true,
      notify_company_verification: true,
      notify_opportunity_reports: true,
      notify_marketplace_reports: true,
      notify_user_reports: true,
      notify_content_approval: true,
      notify_system_errors: true,
      notify_performance_issues: true,
      notify_security_alerts: true,
      notify_backup_status: false,
      admin_email: '',
      email_notifications_enabled: true,
      sms_notifications_enabled: false,
      push_notifications_enabled: true,
      notify_via_email: true,
      notify_via_sms: false,
      notify_via_push: true,
      notify_via_dashboard: true,
    }
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load notification settings from Supabase
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', 'notifications');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const settings: any = {};
        data.forEach(setting => {
          // Convert value based on type
          let value: any = setting.value;
          if (setting.type === 'boolean') {
            value = setting.value === 'true';
          } else if (setting.type === 'number') {
            value = parseFloat(setting.value || '0');
          }
          settings[setting.key] = value;
        });
        form.reset(settings);
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
    setSaveMessage(null); // Clear previous message
    try {
      // Save settings to Supabase
      const settingsToSave = Object.entries(data).map(([key, value]) => ({
        key,
        value: value?.toString() || '',
        type: typeof value === 'boolean' ? 'boolean' : 'string',
        category: 'notifications'
      }));

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

      // Show success message
      setSaveMessage({ type: 'success', text: 'Configuración de notificaciones guardada correctamente' });
      toast.success('Configuración de notificaciones guardada correctamente');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración de notificaciones' });
      toast.error('Error al guardar la configuración de notificaciones');
      
      // Clear error message after 5 seconds
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
          {/* General Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración General de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enable_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notificaciones Habilitadas</FormLabel>
                      <FormDescription>
                        Activar o desactivar todas las notificaciones del sistema
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notification_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Notificaciones</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Inmediata</SelectItem>
                        <SelectItem value="hourly">Cada hora</SelectItem>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Con qué frecuencia recibir notificaciones
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admin_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del Administrador</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="admin@ejemplo.com" />
                    </FormControl>
                    <FormDescription>
                      Email donde recibir las notificaciones administrativas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* User Registration Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Notificaciones de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notify_new_user_registration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Nuevos Registros</FormLabel>
                        <FormDescription>
                          Notificar cuando se registre un nuevo usuario
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_user_email_verification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Verificación de Email</FormLabel>
                        <FormDescription>
                          Notificar cuando un usuario verifique su email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_user_profile_completion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Completar Perfil</FormLabel>
                        <FormDescription>
                          Notificar cuando un usuario complete su perfil
                        </FormDescription>
                      </div>
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
            </CardContent>
          </Card>

          {/* Company Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Notificaciones de Empresas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notify_new_company_registration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Nuevas Empresas</FormLabel>
                        <FormDescription>
                          Notificar cuando se registre una nueva empresa
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_company_upgrade_request"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Solicitudes de Upgrade</FormLabel>
                        <FormDescription>
                          Notificar solicitudes de upgrade de empresas
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_company_verification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Verificación de Empresas</FormLabel>
                        <FormDescription>
                          Notificar cuando una empresa sea verificada
                        </FormDescription>
                      </div>
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
            </CardContent>
          </Card>

          {/* Content Moderation Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Notificaciones de Moderación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notify_opportunity_reports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Reportes de Oportunidades</FormLabel>
                        <FormDescription>
                          Notificar reportes de contenido en oportunidades
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_marketplace_reports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Reportes del Marketplace</FormLabel>
                        <FormDescription>
                          Notificar reportes de contenido en el marketplace
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_user_reports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Reportes de Usuarios</FormLabel>
                        <FormDescription>
                          Notificar reportes de usuarios
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_content_approval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Aprobación de Contenido</FormLabel>
                        <FormDescription>
                          Notificar contenido pendiente de aprobación
                        </FormDescription>
                      </div>
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
            </CardContent>
          </Card>

          {/* System Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Notificaciones del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notify_system_errors"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Errores del Sistema</FormLabel>
                        <FormDescription>
                          Notificar errores críticos del sistema
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_performance_issues"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Problemas de Rendimiento</FormLabel>
                        <FormDescription>
                          Notificar problemas de rendimiento del sistema
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_security_alerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Alertas de Seguridad</FormLabel>
                        <FormDescription>
                          Notificar alertas de seguridad
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_backup_status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Estado de Backups</FormLabel>
                        <FormDescription>
                          Notificar estado de backups automáticos
                        </FormDescription>
                      </div>
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
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Canales de Notificación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notify_via_email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FormLabel>
                        <FormDescription>
                          Recibir notificaciones por email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_via_push"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Push Notifications
                        </FormLabel>
                        <FormDescription>
                          Recibir notificaciones push en el navegador
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_via_dashboard"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Dashboard
                        </FormLabel>
                        <FormDescription>
                          Mostrar notificaciones en el dashboard
                        </FormDescription>
                      </div>
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
            </CardContent>
          </Card>

          {/* Save Message */}
          {saveMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
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
