import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Cog, 
  Database, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Globe,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const systemSettingsSchema = z.object({
  // Platform Settings
  platform_name: z.string().min(1, 'El nombre de la plataforma es requerido'),
  platform_description: z.string().optional(),
  platform_logo_url: z.string().url().optional().or(z.literal('')),
  
  // User Limits
  max_users_per_company: z.coerce.number().min(1, 'Debe ser al menos 1'),
  max_opportunities_per_company: z.coerce.number().min(1, 'Debe ser al menos 1'),
  max_marketplace_services_per_user: z.coerce.number().min(1, 'Debe ser al menos 1'),
  
  // System Settings
  maintenance_mode: z.boolean(),
  registration_enabled: z.boolean(),
  email_verification_required: z.boolean(),
  
  // Email Settings
  smtp_host: z.string().optional(),
  smtp_port: z.number().optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  from_email: z.string().email().optional().or(z.literal('')),
  
  // Feature Flags
  enable_marketplace: z.boolean(),
  enable_opportunities: z.boolean(),
  enable_messaging: z.boolean(),
  enable_notifications: z.boolean(),
});

type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;

const AdminSystemSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categories, setCategories] = useState<Array<{id: string, name: string, type: 'opportunity' | 'marketplace'}>>([]);
  const [newCategory, setNewCategory] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');

  const form = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      platform_name: 'TalentoDigital.io',
      platform_description: '',
      platform_logo_url: '',
      max_users_per_company: 10,
      max_opportunities_per_company: 50,
      max_marketplace_services_per_user: 20,
      maintenance_mode: false,
      registration_enabled: true,
      email_verification_required: true,
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      from_email: '',
      enable_marketplace: true,
      enable_opportunities: true,
      enable_messaging: true,
      enable_notifications: true,
    }
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadCategories();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load system settings from Supabase
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', 'system');

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
      console.error('Error loading settings:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Load opportunity categories
      const { data: oppCategories } = await supabase
        .from('opportunity_categories')
        .select('id, name')
        .order('name');

      // Load marketplace categories
      const { data: marketCategories } = await supabase
        .from('marketplace_categories')
        .select('id, name')
        .order('name');

      const allCategories = [
        ...(oppCategories || []).map(cat => ({ ...cat, type: 'opportunity' as const })),
        ...(marketCategories || []).map(cat => ({ ...cat, type: 'marketplace' as const }))
      ];

      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onSubmit = async (data: SystemSettingsFormData) => {
    setIsSaving(true);
    setSaveMessage(null); // Clear previous message
    try {
      // Save settings to Supabase
      const settingsToSave = Object.entries(data).map(([key, value]) => {
        let type: 'boolean' | 'number' | 'string' = 'string';
        if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'number' && !Number.isNaN(value)) {
          type = 'number';
        }
        return {
          key,
          value: value !== undefined && value !== null ? String(value) : '',
          type,
          category: 'system'
        };
      });

      // Delete existing settings
      await supabase
        .from('admin_settings')
        .delete()
        .eq('category', 'system');

      // Insert new settings
      const { error } = await supabase
        .from('admin_settings')
        .insert(settingsToSave);

      if (error) throw error;

      // Show success message
      setSaveMessage({ type: 'success', text: 'Configuración del sistema guardada correctamente' });
      toast.success('Configuración guardada correctamente');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración del sistema' });
      toast.error('Error al guardar la configuración');
      
      // Clear error message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = async (type: 'opportunity' | 'marketplace') => {
    if (!newCategory.trim()) return;

    try {
      const tableName = type === 'opportunity' ? 'opportunity_categories' : 'marketplace_categories';
      const { error } = await supabase
        .from(tableName)
        .insert({ name: newCategory.trim() });

      if (error) throw error;

      setNewCategory('');
      loadCategories();
      toast.success('Categoría agregada correctamente');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Error al agregar la categoría');
    }
  };

  const deleteCategory = async (id: string, type: 'opportunity' | 'marketplace') => {
    try {
      const tableName = type === 'opportunity' ? 'opportunity_categories' : 'marketplace_categories';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadCategories();
      toast.success('Categoría eliminada correctamente');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('system-assets')
        .getPublicUrl(filePath);

      setLogoPreview(publicUrl);
      form.setValue('platform_logo_url', publicUrl);
      toast.success('Logo subido correctamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    setUploadingFavicon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('system-assets')
        .getPublicUrl(filePath);

      setFaviconPreview(publicUrl);
      // Store favicon URL in settings
      await supabase
        .from('admin_settings')
        .upsert({
          key: 'platform_favicon_url',
          value: publicUrl,
          type: 'string',
          category: 'system'
        }, { onConflict: 'key,category' });

      toast.success('Favicon subido correctamente');
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast.error('Error al subir el favicon');
    } finally {
      setUploadingFavicon(false);
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
          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración de la Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="platform_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Plataforma</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="TalentoDigital.io" />
                    </FormControl>
                    <FormDescription>
                      Nombre que aparecerá en la plataforma
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la Plataforma</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descripción de la plataforma" />
                    </FormControl>
                    <FormDescription>
                      Descripción que aparecerá en la página principal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <FormLabel>Logo de la Plataforma</FormLabel>
                  <div className="mt-2 space-y-3">
                    {(logoPreview || form.watch('platform_logo_url')) && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={logoPreview || form.watch('platform_logo_url')} 
                          alt="Logo preview" 
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingLogo}
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        {uploadingLogo ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Logo
                          </>
                        )}
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                    <FormDescription>
                      Sube el logo de la plataforma (formatos: PNG, JPG, SVG)
                    </FormDescription>
                  </div>
                </div>

                <div>
                  <FormLabel>Favicon de la Plataforma</FormLabel>
                  <div className="mt-2 space-y-3">
                    {faviconPreview && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={faviconPreview} 
                          alt="Favicon preview" 
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingFavicon}
                        onClick={() => document.getElementById('favicon-upload')?.click()}
                      >
                        {uploadingFavicon ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Subir Favicon
                          </>
                        )}
                      </Button>
                      <input
                        id="favicon-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFaviconUpload}
                      />
                    </div>
                    <FormDescription>
                      Sube el favicon de la plataforma (32x32px recomendado)
                    </FormDescription>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Límites del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="max_users_per_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo Usuarios por Empresa</FormLabel>
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
                  name="max_opportunities_per_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo Oportunidades por Empresa</FormLabel>
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
                  name="max_marketplace_services_per_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo Servicios por Usuario</FormLabel>
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

          {/* System Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Funcionalidades del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maintenance_mode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Modo Mantenimiento</FormLabel>
                        <FormDescription>
                          Activar para mostrar página de mantenimiento
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
                  name="registration_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Registro Habilitado</FormLabel>
                        <FormDescription>
                          Permitir nuevos registros de usuarios
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
                  name="email_verification_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Verificación de Email Requerida</FormLabel>
                        <FormDescription>
                          Requerir verificación de email para activar cuenta
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
                  name="enable_marketplace"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Marketplace Habilitado</FormLabel>
                        <FormDescription>
                          Activar funcionalidad del marketplace
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
                  name="enable_opportunities"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Oportunidades Habilitadas</FormLabel>
                        <FormDescription>
                          Activar funcionalidad de oportunidades
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
                  name="enable_messaging"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mensajería Habilitada</FormLabel>
                        <FormDescription>
                          Activar sistema de mensajería
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

          {/* Categories Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestión de Categorías
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Opportunity Categories */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Categorías de Oportunidades
                </h4>
                <div className="space-y-2">
                  {categories.filter(cat => cat.type === 'opportunity').map(category => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{category.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id, 'opportunity')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nueva categoría de oportunidad"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => addCategory('opportunity')}
                      disabled={!newCategory.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Marketplace Categories */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Categorías del Marketplace
                </h4>
                <div className="space-y-2">
                  {categories.filter(cat => cat.type === 'marketplace').map(category => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{category.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id, 'marketplace')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nueva categoría del marketplace"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => addCategory('marketplace')}
                      disabled={!newCategory.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
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

export default AdminSystemSettings;
