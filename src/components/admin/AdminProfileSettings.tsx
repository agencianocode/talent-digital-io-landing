import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { Upload, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  photo: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const AdminProfileSettings: React.FC = () => {
  const { user, profile, updateProfile, updatePassword } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.full_name || user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || user?.user_metadata?.phone || '',
      country: profile?.country || user?.user_metadata?.country || '',
      city: profile?.city || user?.user_metadata?.city || '',
      photo: profile?.avatar_url || user?.user_metadata?.avatar_url || ''
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (profile || user?.user_metadata) {
      const formData = {
        name: profile?.full_name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: profile?.phone || user?.user_metadata?.phone || '',
        country: profile?.country || user?.user_metadata?.country || '',
        city: profile?.city || user?.user_metadata?.city || '',
        photo: profile?.avatar_url || user?.user_metadata?.avatar_url || ''
      };
      
      profileForm.reset(formData);
    }
  }, [profile, user?.email, user?.user_metadata]);

  useEffect(() => {
    if (profile?.avatar_url) {
      profileForm.setValue('photo', profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setSaveMessage(null); // Clear previous message
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const result = await updateProfile({
        full_name: data.name,
        phone: data.phone,
        country: data.country,
        city: data.city,
        avatar_url: data.photo
      } as any);

      if (result.error) {
        throw new Error(result.error.message || 'Error al actualizar el perfil');
      }

      // Show success message
      setSaveMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      toast.success('Perfil actualizado correctamente');
      
      // Don't reset the form to avoid navigation issues
      // profileForm.reset(data);
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setSaveMessage({ type: 'error', text: `Error al actualizar el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}` });
      toast.error(`Error al actualizar el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) {
      toast.error('Debes estar autenticado para cambiar la contraseña');
      return;
    }

    setIsLoading(true);
    setSaveMessage(null); // Clear previous message
    try {
      const { error: currentPasswordError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword
      });

      if (currentPasswordError) {
        setSaveMessage({ type: 'error', text: 'La contraseña actual es incorrecta' });
        toast.error('La contraseña actual es incorrecta');
        setTimeout(() => setSaveMessage(null), 5000);
        return;
      }

      const { error } = await updatePassword(data.newPassword);
      
      if (error) {
        setSaveMessage({ type: 'error', text: 'Error al cambiar la contraseña: ' + error.message });
        toast.error('Error al cambiar la contraseña: ' + error.message);
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        setSaveMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
        toast.success('Contraseña actualizada correctamente');
        
        // Don't reset the form to avoid navigation issues
        // passwordForm.reset();
        
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setSaveMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
      toast.error('Error al cambiar la contraseña');
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!user || !file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no admitido. Tipos permitidos: PNG, JPG');
      return;
    }

    // Validar tamaño del archivo
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('El archivo excede el tamaño permitido. Máximo: 2MB');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error('No estás autenticado');
        return;
      }

      const fileExt = file?.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const filePath = `${user.id}/${user.id}_${timestamp}.${fileExt}`;

      try {
        const { data: existingFiles } = await supabase.storage.from('avatars').list(user.id + '/');
        if (existingFiles && existingFiles.length > 0) {
          const filePaths = existingFiles.map(f => `${user.id}/${f.name}`);
          await supabase.storage.from('avatars').remove(filePaths);
        }
      } catch (error) {
        console.error('No se pudieron eliminar archivos existentes:', error);
      }

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file!, { upsert: true });
      
      let publicUrl: string;
      if (uploadError) {
        if (uploadError.message.includes('permission') || uploadError.message.includes('row-level security')) {
          const alternativePath = `public/${user.id}.${fileExt}`;
          const { error: altUploadError } = await supabase.storage.from('avatars').upload(alternativePath, file!, { upsert: true });
          
          if (altUploadError) {
            throw new Error(`Error de permisos: ${altUploadError.message}`);
          }
          
          const { data } = supabase.storage.from('avatars').getPublicUrl(alternativePath);
          publicUrl = data.publicUrl;
        } else {
          throw new Error(`Error al subir archivo: ${uploadError.message}`);
        }
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }

      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública');
      }

      const { error: directUpdateError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      if (directUpdateError) {
        throw directUpdateError;
      }

      profileForm.setValue('photo', publicUrl);
      
      if (updateProfile) {
        const updateResult = await updateProfile({
          full_name: profile?.full_name || '',
          phone: profile?.phone || '',
          avatar_url: publicUrl
        });
        
        if (updateResult.error) {
          console.error('Error actualizando contexto:', updateResult.error);
        }
      }
      
      toast.success('Foto actualizada correctamente');
    } catch (error: any) {
      const errorMsg = error?.message || 'Error desconocido';
      toast.error(`Error al subir la foto: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileForm.watch('photo') || profile?.avatar_url || ''} alt="Foto de perfil" />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" asChild disabled={isLoading}>
                      <span className="flex items-center cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar Foto
                        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      </span>
                    </Button>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handlePhotoUpload} 
                      disabled={isLoading} 
                    />
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG hasta 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">El email no se puede modificar</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu país" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? 'text' : 'password'}
                          placeholder="Tu contraseña actual"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? 'text' : 'password'}
                          placeholder="Tu nueva contraseña"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          placeholder="Confirma tu nueva contraseña"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Contraseña
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
