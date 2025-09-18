import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfileSync } from '@/hooks/useProfileSync';

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

const BusinessProfile = () => {
  const {
    user,
    profile,
    updateProfile,
    updatePassword
  } = useSupabaseAuth();
  const { handleProfileUpdate } = useProfileSync();
  const [isLoading, setIsLoading] = useState(false);
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

  // Update form when profile or user_metadata changes
  useEffect(() => {
    if (profile || user?.user_metadata) {
      profileForm.setValue('name', profile?.full_name || user?.user_metadata?.full_name || '');
      profileForm.setValue('email', user?.email || '');
      profileForm.setValue('phone', profile?.phone || user?.user_metadata?.phone || '');
      profileForm.setValue('country', profile?.country || user?.user_metadata?.country || '');
      profileForm.setValue('city', profile?.city || user?.user_metadata?.city || '');
      profileForm.setValue('photo', profile?.avatar_url || user?.user_metadata?.avatar_url || '');
    }
  }, [profile, user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error('Debes estar autenticado para actualizar el perfil');
      return;
    }

    setIsLoading(true);
    try {
      const updateResult = await updateProfile({
        full_name: data.name,
        phone: data.phone || null,
        country: data.country || null,
        city: data.city || null
      });

      if (updateResult.error) {
        throw updateResult.error;
      }

      await handleProfileUpdate();
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Error al actualizar el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
    try {
      // Verificar contraseña actual primero (intentando hacer login)
      const { error: currentPasswordError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword
      });

      if (currentPasswordError) {
        toast.error('La contraseña actual es incorrecta');
        return;
      }

      // Si la verificación es exitosa, cambiar la contraseña
      const { error } = await updatePassword(data.newPassword);
      
      if (error) {
        console.error('Error updating password:', error);
        toast.error('Error al cambiar la contraseña: ' + error.message);
      } else {
        toast.success('Contraseña actualizada correctamente');
        passwordForm.reset();
      }
    } catch (error) {
      console.error('Error in password change:', error);
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!user || !file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen.');
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

      // Try to delete existing files
      try {
        const { data: existingFiles } = await supabase.storage.from('avatars').list(user.id + '/');
        if (existingFiles && existingFiles.length > 0) {
          const filePaths = existingFiles.map(file => `${user.id}/${file.name}`);
          await supabase.storage.from('avatars').remove(filePaths);
        }
      } catch (error) {
        console.error('No se pudieron eliminar archivos existentes:', error);
      }

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file!, {
        upsert: true
      });

      let publicUrl: string;
      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        if (uploadError.message.includes('permission') || uploadError.message.includes('row-level security')) {
          const alternativePath = `public/${user.id}.${fileExt}`;
          const { error: altUploadError } = await supabase.storage.from('avatars').upload(alternativePath, file!, {
            upsert: true
          });
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

      const { error: directUpdateError } = await supabase.from('profiles').update({
        avatar_url: publicUrl
      }).eq('user_id', user.id);

      if (directUpdateError) {
        throw directUpdateError;
      }

      // Update form value
      profileForm.setValue('photo', publicUrl);
      
      // Update profile through context which handles both Supabase and state
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
      
      console.log('Foto actualizada exitosamente');
      toast.success('Foto actualizada correctamente');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(`Error al subir la foto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileForm.watch('photo') || profile?.avatar_url || ''} alt="Foto de perfil" />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Cambiar Foto
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG hasta 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña Actual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="Contraseña actual"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
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
                            {...field}
                            type={showPasswords.new ? "text" : "password"}
                            placeholder="Nueva contraseña"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
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
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPasswords.confirm ? "text" : "password"}
                            placeholder="Confirmar nueva contraseña"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
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
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar Contraseña
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessProfile;
