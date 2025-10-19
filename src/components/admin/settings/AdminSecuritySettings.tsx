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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Globe,
  Database,
  Save,
  RefreshCw,
  Key,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const securitySettingsSchema = z.object({
  // Authentication Settings
  enable_two_factor_auth: z.boolean(),
  session_timeout_minutes: z.number().min(5, 'Mínimo 5 minutos'),
  max_login_attempts: z.number().min(1, 'Mínimo 1 intento'),
  lockout_duration_minutes: z.number().min(1, 'Mínimo 1 minuto'),
  
  // Password Policy
  min_password_length: z.number().min(8, 'Mínimo 8 caracteres'),
  require_uppercase: z.boolean(),
  require_lowercase: z.boolean(),
  require_numbers: z.boolean(),
  require_special_chars: z.boolean(),
  password_expiry_days: z.number().min(0, 'Mínimo 0 días'),
  
  // IP Restrictions
  enable_ip_whitelist: z.boolean(),
  allowed_ips: z.string().optional(),
  blocked_ips: z.string().optional(),
  
  // Security Headers
  enable_cors: z.boolean(),
  cors_origins: z.string().optional(),
  enable_csp: z.boolean(),
  csp_policy: z.string().optional(),
  
  // Audit Logging
  enable_audit_logging: z.boolean(),
  log_retention_days: z.number().min(1, 'Mínimo 1 día'),
  log_failed_attempts: z.boolean(),
  log_admin_actions: z.boolean(),
  log_user_actions: z.boolean(),
  
  // Backup Settings
  enable_automatic_backup: z.boolean(),
  backup_frequency: z.enum(['daily', 'weekly', 'monthly']),
  backup_retention_days: z.number().min(1, 'Mínimo 1 día'),
  backup_encryption: z.boolean(),
  
  // API Security
  enable_api_rate_limiting: z.boolean(),
  api_rate_limit_requests: z.number().min(1, 'Mínimo 1 request'),
  api_rate_limit_window_minutes: z.number().min(1, 'Mínimo 1 minuto'),
  require_api_key: z.boolean(),
});

type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

const AdminSecuritySettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  const form = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      enable_two_factor_auth: false,
      session_timeout_minutes: 60,
      max_login_attempts: 5,
      lockout_duration_minutes: 15,
      min_password_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_special_chars: true,
      password_expiry_days: 90,
      enable_ip_whitelist: false,
      allowed_ips: '',
      blocked_ips: '',
      enable_cors: true,
      cors_origins: '',
      enable_csp: true,
      csp_policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      enable_audit_logging: true,
      log_retention_days: 30,
      log_failed_attempts: true,
      log_admin_actions: true,
      log_user_actions: false,
      enable_automatic_backup: true,
      backup_frequency: 'daily',
      backup_retention_days: 30,
      backup_encryption: true,
      enable_api_rate_limiting: true,
      api_rate_limit_requests: 100,
      api_rate_limit_window_minutes: 15,
      require_api_key: false,
    }
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadSecurityAlerts();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load security settings from Supabase
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', 'security');

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
      console.error('Error loading security settings:', error);
      toast.error('Error al cargar la configuración de seguridad');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      // Load recent security alerts from Supabase
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading security alerts:', error);
        return;
      }

      setSecurityAlerts(data || []);
    } catch (error) {
      console.error('Error loading security alerts:', error);
    }
  };

  const onSubmit = async (data: SecuritySettingsFormData) => {
    console.log('onSubmit called with data:', data);
    setIsSaving(true);
    setSaveMessage(null); // Clear previous message
    try {
      // Save settings to Supabase
      const settingsToSave = Object.entries(data).map(([key, value]) => {
        let type = 'string';
        if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'number') {
          type = 'number';
        }
        
        return {
          key,
          value: value?.toString() || '',
          type,
          category: 'security'
        };
      });

      console.log('Settings to save:', settingsToSave);

      // Delete existing settings
      const { error: deleteError } = await supabase
        .from('admin_settings')
        .delete()
        .eq('category', 'security');

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Insert new settings
      const { error } = await supabase
        .from('admin_settings')
        .insert(settingsToSave);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Settings saved successfully');

      // Show success message
      setSaveMessage({ type: 'success', text: 'Configuración de seguridad guardada correctamente' });
      toast.success('Configuración de seguridad guardada correctamente');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving security settings:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración de seguridad' });
      toast.error('Error al guardar la configuración de seguridad');
      
      // Clear error message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const getSecurityLevel = () => {
    const values = form.getValues();
    let score = 0;
    
    if (values.enable_two_factor_auth) score += 20;
    if (values.min_password_length >= 12) score += 15;
    if (values.require_uppercase && values.require_lowercase && values.require_numbers && values.require_special_chars) score += 15;
    if (values.enable_ip_whitelist) score += 10;
    if (values.enable_audit_logging) score += 10;
    if (values.enable_automatic_backup) score += 10;
    if (values.enable_api_rate_limiting) score += 10;
    if (values.enable_csp) score += 10;

    if (score >= 80) return { level: 'Alto', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { level: 'Medio', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Bajo', color: 'bg-red-100 text-red-800' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const securityLevel = getSecurityLevel();

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Resumen de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Nivel de Seguridad Actual</p>
              <Badge className={securityLevel.color}>{securityLevel.level}</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Alertas Recientes</p>
              <p className="text-2xl font-bold">{securityAlerts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log('Form validation errors:', errors);
          toast.error('Por favor corrige los errores en el formulario');
        })} className="space-y-6">
          {/* Authentication Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Configuración de Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enable_two_factor_auth"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Autenticación de Dos Factores</FormLabel>
                      <FormDescription>
                        Requerir 2FA para todos los administradores
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="session_timeout_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo de Sesión (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_login_attempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo Intentos de Login</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lockout_duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración de Bloqueo (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Política de Contraseñas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_password_length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitud Mínima</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_expiry_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiración (días)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="require_uppercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requerir Mayúsculas</FormLabel>
                        <FormDescription>
                          Al menos una letra mayúscula
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
                  name="require_lowercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requerir Minúsculas</FormLabel>
                        <FormDescription>
                          Al menos una letra minúscula
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
                  name="require_numbers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requerir Números</FormLabel>
                        <FormDescription>
                          Al menos un número
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
                  name="require_special_chars"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requerir Caracteres Especiales</FormLabel>
                        <FormDescription>
                          Al menos un carácter especial
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

          {/* IP Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Restricciones de IP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enable_ip_whitelist"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Lista Blanca de IPs</FormLabel>
                      <FormDescription>
                        Permitir acceso solo desde IPs específicas
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="allowed_ips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IPs Permitidas</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Una IP por línea. Soporta CIDR notation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blocked_ips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IPs Bloqueadas</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="192.168.1.100&#10;10.0.0.50"
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        IPs que serán bloqueadas automáticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audit Logging */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Auditoría y Logging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enable_audit_logging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auditoría Habilitada</FormLabel>
                      <FormDescription>
                        Registrar todas las acciones administrativas
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="log_retention_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retención de Logs (días)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="log_failed_attempts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Log Intentos Fallidos</FormLabel>
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
                  name="log_admin_actions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Log Acciones Admin</FormLabel>
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
                  name="log_user_actions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Log Acciones Usuario</FormLabel>
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

          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración de Backups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enable_automatic_backup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Backup Automático</FormLabel>
                      <FormDescription>
                        Realizar backups automáticos de la base de datos
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="backup_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia de Backup</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backup_retention_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retención (días)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backup_encryption"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Encriptación</FormLabel>
                        <FormDescription>
                          Encriptar backups
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

export default AdminSecuritySettings;
