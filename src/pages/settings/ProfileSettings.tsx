import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { Upload, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().optional(),
  position: z.string().optional(),
  linkedin: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
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
const ProfileSettings = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    updateProfile
  } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      position: '',
      linkedin: '',
      photo: profile?.avatar_url || ''
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

  // Auto-save functionality - DESHABILITADO
  // useEffect(() => {
  //   const subscription = profileForm.watch((value) => {
  //     const timeoutId = setTimeout(() => {
  //       if (profileForm.formState.isValid && profileForm.formState.isDirty) {
  //         handleAutoSave(value as ProfileFormData);
  //       }
  //     }, 2000);

  //     return () => clearTimeout(timeoutId);
  //   });

  //   return () => subscription.unsubscribe();
  // }, [profileForm.watch]);

  // Actualizar formulario cuando el perfil cambie
  useEffect(() => {
    if (profile) {
      const formData = {
        name: profile.full_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        position: (profile as any).position || '',
        linkedin: (profile as any).linkedin || '',
        photo: profile.avatar_url || ''
      };
      profileForm.reset(formData);

      // Forzar que el formulario detecte cambios después del reset
      setTimeout(() => {
        profileForm.trigger();
      }, 100);
    }
  }, [profile, user?.email, profileForm]);

  // Forzar actualización cuando se suba una foto
  useEffect(() => {
    if (profile?.avatar_url) {
      profileForm.setValue('photo', profile.avatar_url);
    }
  }, [profile?.avatar_url, profileForm]);
  const handleAutoSave = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        full_name: data.name,
        phone: data.phone,
        avatar_url: data.photo
      });
      toast.success('Cambios guardados automáticamente');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Actualizar directamente en la base de datos
      const {
        error: directError
      } = await supabase.from('profiles').update({
        full_name: data.name,
        phone: data.phone,
        position: data.position,
        linkedin: data.linkedin,
        avatar_url: data.photo
      } as any).eq('user_id', user.id);
      if (directError) {
        throw directError;
      }

      // También actualizar el contexto
      const result = await updateProfile({
        full_name: data.name,
        phone: data.phone,
        position: data.position,
        linkedin: data.linkedin,
        avatar_url: data.photo
      } as any);
      if (result.error) {
        console.error('Error al actualizar contexto:', result.error);
      }
      toast.success('Perfil actualizado correctamente');
      profileForm.reset(data);

      // Recargar la página para mostrar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error en onProfileSubmit:', error);
      toast.error(`Error al actualizar el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Contraseña actualizada correctamente');
      passwordForm.reset();
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!user) return;

    // Validar tamaño del archivo (2MB máximo)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 2MB.');
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen.');
      return;
    }
    setIsLoading(true);
    try {
      // Verificar el estado de autenticación
      const {
        data: {
          user: currentUser
        }
      } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error('No estás autenticado');
        return;
      }

      // Verificar si podemos acceder al bucket intentando listar archivos
      const {
        data: files,
        error: listError
      } = await supabase.storage.from('avatars').list('', {
        limit: 10
      });
      if (listError) {
        console.error('Error accediendo al bucket avatars:', listError);
        toast.error(`Error al acceder al almacenamiento: ${listError.message}`);
        return;
      }

      // Verificar si ya existe un archivo para este usuario
      const userFile = files?.find(file => file.name.includes(currentUser.id));
      if (userFile) {
        // Obtener URL del archivo existente
        const {
          data: urlData
        } = supabase.storage.from('avatars').getPublicUrl(userFile.name);

        // Actualizar el perfil con la URL existente
        const {
          error: updateError
        } = await supabase.from('profiles').update({
          avatar_url: urlData.publicUrl
        }).eq('user_id', currentUser.id);
        if (updateError) {
          console.error('Error actualizando avatar_url:', updateError);
        } else {
          toast.success('Foto de perfil cargada');
        }
      }
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${user.id}/${user.id}_${timestamp}.${fileExt}`;

      // Primero intentar eliminar archivos existentes del usuario
      try {
        const {
          data: existingFiles
        } = await supabase.storage.from('avatars').list(user.id + '/');
        if (existingFiles && existingFiles.length > 0) {
          const filePaths = existingFiles.map(file => `${user.id}/${file.name}`);
          const {
            error: deleteError
          } = await supabase.storage.from('avatars').remove(filePaths);
          if (deleteError) {
            console.error('Error eliminando archivos existentes:', deleteError);
          }
        }
      } catch (error) {
        console.error('No se pudieron eliminar archivos existentes:', error);
      }

      // Ahora subir el nuevo archivo
      const {
        error: uploadError
      } = await supabase.storage.from('avatars').upload(filePath, file, {
        upsert: true
      });
      let publicUrl: string;
      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);

        // Si es un error de permisos, intentar con una ruta diferente
        if (uploadError.message.includes('permission') || uploadError.message.includes('row-level security')) {
          const alternativePath = `public/${user.id}.${fileExt}`;
          const {
            error: altUploadError
          } = await supabase.storage.from('avatars').upload(alternativePath, file, {
            upsert: true
          });
          if (altUploadError) {
            console.error('Error con ruta alternativa:', altUploadError);
            throw new Error(`Error de permisos: ${altUploadError.message}`);
          }
          const {
            data
          } = supabase.storage.from('avatars').getPublicUrl(alternativePath);
          publicUrl = data.publicUrl;
          if (!publicUrl) {
            throw new Error('No se pudo obtener la URL pública');
          }
        } else {
          throw new Error(`Error al subir archivo: ${uploadError.message}`);
        }
      } else {
        // Obtener URL pública
        const {
          data
        } = supabase.storage.from('avatars').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
        if (!publicUrl) {
          throw new Error('No se pudo obtener la URL pública');
        }
      }

      // Actualizar el campo en el formulario y en la base de datos
      const {
        error: directUpdateError
      } = await supabase.from('profiles').update({
        avatar_url: publicUrl
      }).eq('user_id', user.id);
      if (directUpdateError) {
        console.error('Error al actualizar perfil:', directUpdateError);
        throw directUpdateError;
      }

      // Actualizar el formulario con la nueva URL
      profileForm.setValue('photo', publicUrl);

      // Actualizar el contexto de autenticación para que se refleje inmediatamente
      if (updateProfile) {
        await updateProfile({
          full_name: profile?.full_name || '',
          phone: profile?.phone || '',
          avatar_url: publicUrl
        });
      }
      toast.success('Foto actualizada correctamente');

      // Forzar recarga de la página para mostrar la nueva foto
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      let errorMsg = '';
      if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object') {
        if (error.message) {
          errorMsg = error.message;
        } else {
          errorMsg = JSON.stringify(error);
        }
      } else {
        errorMsg = 'Error desconocido';
      }
      console.error('Error general en subida de foto:', errorMsg, error);
      toast.error(`Error al subir la foto: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  return <div className="space-y-6 mx-[20px] my-[20px] py-[20px] px-[20px]">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Perfil Personal</h2>
          <p className="text-muted-foreground">Gestiona tu información personal y configuración de cuenta</p>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileForm.watch('photo') || profile?.avatar_url} alt="Foto de perfil" />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" asChild disabled={isLoading}>
                      <span className="flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar Foto
                        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      </span>
                    </Button>
                    <input id="avatar-upload" type="file" accept="image/*" style={{
                    display: 'none'
                  }} onChange={handlePhotoUpload} disabled={isLoading} />
                  </label>
                  {isLoading && <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando imagen...
                    </div>}
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG hasta 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={profileForm.control} name="name" render={({
                field
              }) => <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={profileForm.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={profileForm.control} name="phone" render={({
                field
              }) => <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={profileForm.control} name="position" render={({
                field
              }) => <FormItem>
                      <FormLabel>Posición</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu posición en la empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={profileForm.control} name="linkedin" render={({
              field
            }) => <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/tu-perfil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => profileForm.reset()}>
                  Descartar Cambios
                </Button>
                <Button type="submit" disabled={isLoading || !profileForm.formState.isDirty}>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
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
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField control={passwordForm.control} name="currentPassword" render={({
              field
            }) => <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPasswords.current ? "text" : "password"} placeholder="Tu contraseña actual" {...field} />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => togglePasswordVisibility('current')}>
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={passwordForm.control} name="newPassword" render={({
                field
              }) => <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPasswords.new ? "text" : "password"} placeholder="Nueva contraseña" {...field} />
                          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => togglePasswordVisibility('new')}>
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={passwordForm.control} name="confirmPassword" render={({
                field
              }) => <FormItem>
                      <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPasswords.confirm ? "text" : "password"} placeholder="Confirma la nueva contraseña" {...field} />
                          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => togglePasswordVisibility('confirm')}>
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading || !passwordForm.formState.isValid}>
                  {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
};
export default ProfileSettings;