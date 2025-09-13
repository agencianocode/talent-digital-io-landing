// import React from 'react'; // No utilizado
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Briefcase, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const notificationSchema = z.object({
  // Email Notifications
  email_opportunities: z.boolean(),
  email_messages: z.boolean(),
  email_company_invitations: z.boolean(),
  email_profile_views: z.boolean(),
  email_weekly_digest: z.boolean(),
  email_frequency: z.enum(['instant', 'daily', 'weekly']),
  
  // Push Notifications
  push_opportunities: z.boolean(),
  push_messages: z.boolean(),
  push_company_invitations: z.boolean(),
  push_profile_matches: z.boolean(),
  
  // In-App Notifications
  inapp_opportunities: z.boolean(),
  inapp_messages: z.boolean(),
  inapp_company_activity: z.boolean(),
  inapp_system_updates: z.boolean(),
  
  // Quiet Hours
  quiet_hours_enabled: z.boolean(),
  quiet_hours_start: z.string(),
  quiet_hours_end: z.string(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const NotificationSettings = () => {
  const { user } = useSupabaseAuth();
  
  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      // Email defaults
      email_opportunities: true,
      email_messages: true,
      email_company_invitations: true,
      email_profile_views: false,
      email_weekly_digest: true,
      email_frequency: 'daily',
      
      // Push defaults
      push_opportunities: true,
      push_messages: true,
      push_company_invitations: true,
      push_profile_matches: false,
      
      // In-app defaults
      inapp_opportunities: true,
      inapp_messages: true,
      inapp_company_activity: true,
      inapp_system_updates: true,
      
      // Quiet hours
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
    }
  });

  const onSubmit = async (data: NotificationFormData) => {
    if (!user) {
      toast.error('Debes estar autenticado para actualizar las configuraciones');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Configuración de notificaciones actualizada');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Error al actualizar las notificaciones');
    }
  };

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
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificaciones por Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de emails</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="instant">Instantáneo - Recibir inmediatamente</SelectItem>
                        <SelectItem value="daily">Diario - Resumen diario</SelectItem>
                        <SelectItem value="weekly">Semanal - Resumen semanal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controla con qué frecuencia recibir emails de notificación
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email_opportunities"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Nuevas oportunidades</FormLabel>
                        <FormDescription>
                          Recibir emails cuando hay nuevas oportunidades que coinciden con tu perfil
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
                  name="email_messages"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mensajes directos</FormLabel>
                        <FormDescription>
                          Recibir emails cuando tengas nuevos mensajes
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
                  name="email_company_invitations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Invitaciones de empresas</FormLabel>
                        <FormDescription>
                          Recibir emails cuando las empresas te envíen invitaciones
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
                  name="email_weekly_digest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Resumen semanal</FormLabel>
                        <FormDescription>
                          Recibir un resumen semanal de actividad y oportunidades
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

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notificaciones Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="push_opportunities"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Oportunidades relevantes</FormLabel>
                      <FormDescription>
                        Notificaciones push para oportunidades que coinciden contigo
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
                name="push_messages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mensajes nuevos</FormLabel>
                      <FormDescription>
                        Notificaciones push para nuevos mensajes
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
                name="push_company_invitations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Invitaciones de empresas</FormLabel>
                      <FormDescription>
                        Notificaciones push cuando las empresas te contacten
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
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Notificaciones en la App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="inapp_opportunities"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Nuevas oportunidades</FormLabel>
                      <FormDescription>
                        Mostrar notificaciones en la app para nuevas oportunidades
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
                name="inapp_company_activity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Actividad de empresas</FormLabel>
                      <FormDescription>
                        Notificaciones cuando las empresas vean tu perfil o te contacten
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
                name="inapp_system_updates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Actualizaciones del sistema</FormLabel>
                      <FormDescription>
                        Notificaciones sobre nuevas funciones y mantenimiento
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
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Horario de Silencio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="quiet_hours_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activar horario de silencio</FormLabel>
                      <FormDescription>
                        No recibir notificaciones push durante ciertas horas
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

              {form.watch('quiet_hours_enabled') && (
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <FormField
                    control={form.control}
                    name="quiet_hours_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de inicio</FormLabel>
                        <FormControl>
                          <input
                            type="time"
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quiet_hours_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de fin</FormLabel>
                        <FormControl>
                          <input
                            type="time"
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Restablecer
            </Button>
            <Button type="submit">
              Guardar Configuración
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NotificationSettings;