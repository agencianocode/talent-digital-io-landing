import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Eye, MapPin, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const privacySchema = z.object({
  profile_visibility: z.enum(['public', 'companies_only', 'private']),
  location_visibility: z.enum(['full', 'city_only', 'hidden']),
  contact_visibility: z.enum(['public', 'companies_only', 'hidden']),
  hide_exact_location: z.boolean(),
  allow_direct_messages: z.boolean(),
  show_online_status: z.boolean(),
  profile_searchable: z.boolean(),
  allow_company_invitations: z.boolean(),
});

type PrivacyFormData = z.infer<typeof privacySchema>;

const PrivacySettings = () => {
  const { user } = useSupabaseAuth();
  
  const form = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profile_visibility: 'companies_only',
      location_visibility: 'city_only',
      contact_visibility: 'companies_only',
      hide_exact_location: true,
      allow_direct_messages: true,
      show_online_status: false,
      profile_searchable: true,
      allow_company_invitations: true,
    }
  });

  // Load existing settings
  React.useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading privacy settings:', error);
        return;
      }

      if (data?.privacy_settings) {
        form.reset(data.privacy_settings as PrivacyFormData);
      }
    };

    loadSettings();
  }, [user, form]);

  const onSubmit = async (data: PrivacyFormData) => {
    if (!user) {
      toast.error('Debes estar autenticado para actualizar la configuración');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          privacy_settings: data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Configuración de privacidad actualizada');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Error al actualizar la configuración');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Privacidad y Visibilidad</h2>
          <p className="text-muted-foreground">Controla quién puede ver tu información</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visibilidad del Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="profile_visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Quién puede ver tu perfil?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la visibilidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Público - Todos pueden ver mi perfil</SelectItem>
                        <SelectItem value="companies_only">Solo Empresas - Solo empresas registradas</SelectItem>
                        <SelectItem value="private">Privado - Solo yo puedo ver mi perfil</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controla quién puede encontrar y ver tu perfil profesional
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile_searchable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Perfil encontrable</FormLabel>
                      <FormDescription>
                        Permite que tu perfil aparezca en búsquedas
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

          {/* Location Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Privacidad de Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="location_visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mostrar ubicación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el nivel de detalle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full">Completa - País, estado y ciudad</SelectItem>
                        <SelectItem value="city_only">Solo ciudad - Ocultar dirección específica</SelectItem>
                        <SelectItem value="hidden">Oculta - No mostrar ubicación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controla qué tan específica es la ubicación que muestras
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hide_exact_location"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ocultar ubicación exacta</FormLabel>
                      <FormDescription>
                        No mostrar tu dirección específica, solo la ciudad
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

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="contact_visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidad de contacto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="¿Quién puede ver tu información de contacto?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Público - Todos pueden ver mi contacto</SelectItem>
                        <SelectItem value="companies_only">Solo Empresas - Solo empresas verificadas</SelectItem>
                        <SelectItem value="hidden">Oculto - Solo disponible tras contacto inicial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controla quién puede ver tu email y teléfono
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_direct_messages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Permitir mensajes directos</FormLabel>
                      <FormDescription>
                        Las empresas pueden contactarte directamente
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
                name="allow_company_invitations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recibir invitaciones de empresas</FormLabel>
                      <FormDescription>
                        Permite que las empresas te envíen invitaciones directas
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

          {/* Online Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado en Línea</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="show_online_status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mostrar cuando estoy en línea</FormLabel>
                      <FormDescription>
                        Otros usuarios pueden ver si estás activo
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

export default PrivacySettings;