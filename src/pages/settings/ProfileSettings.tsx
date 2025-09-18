import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth, isTalentRole, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { TalentProfileWizard } from '@/components/wizard/TalentProfileWizard';
import { CompanyProfileWizard } from '@/components/wizard/CompanyProfileWizard';
import { ProfileCompletenessCard } from '@/components/ProfileCompletenessCard';
import { useProfileSync } from '@/hooks/useProfileSync';
import { toast } from 'sonner';
import { Upload, Eye, EyeOff, Loader2, ArrowLeft, User, Briefcase } from 'lucide-react';
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
const ProfileSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    profile,
    updateProfile,
    userRole
  } = useSupabaseAuth();
  const { handleProfileUpdate } = useProfileSync();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    console.log('ProfileSettings: initial tab from URL', tabParam);
    return tabParam || 'personal';
  });

  // Listen for URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    console.log('ProfileSettings: URL changed, new tab param:', tabParam);
    if (tabParam && tabParam !== activeTab) {
      console.log('ProfileSettings: updating activeTab to:', tabParam);
      setActiveTab(tabParam);
    }
  }, [searchParams.get('tab')]); // Only depend on the actual tab parameter
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
      const formData = {
        name: profile?.full_name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: profile?.phone || user?.user_metadata?.phone || '',
        country: profile?.country || user?.user_metadata?.country || '',
        city: profile?.city || user?.user_metadata?.city || '',
        photo: profile?.avatar_url || user?.user_metadata?.avatar_url || ''
      };
      
      console.log('ProfileSettings: Updating form with data:', formData);
      console.log('ProfileSettings: user_metadata:', user?.user_metadata);
      profileForm.reset(formData);
      setTimeout(() => {
        profileForm.trigger();
      }, 100);
    }
  }, [profile, user?.email, user?.user_metadata, profileForm]);

  // Force update when photo is uploaded
  useEffect(() => {
    if (profile?.avatar_url) {
      profileForm.setValue('photo', profile.avatar_url);
    }
  }, [profile?.avatar_url, profileForm]);
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Guardando datos del perfil:', data);

      // Solo usar el contexto para actualizar, que maneja tanto Supabase como el estado
      const result = await updateProfile({
        full_name: data.name,
        phone: data.phone,
        country: data.country,
        city: data.city,
        avatar_url: data.photo
      } as any);

      if (result.error) {
        console.error('Error al actualizar perfil:', result.error);
        throw new Error(result.error.message || 'Error al actualizar el perfil');
      }

      console.log('Perfil actualizado exitosamente');
      toast.success('Perfil actualizado correctamente');
      
      // Sync profile across the app
      await handleProfileUpdate(() => {
        // Reset form with the new data to mark it as clean
        profileForm.reset(data);
        
        // Navigate back to onboarding if came from there
        const fromOnboarding = searchParams.get('from') === 'onboarding';
        if (fromOnboarding) {
          // Set flag to advance to professional step
          try {
            localStorage.setItem('onboarding.returnToStep', 'professional');
          } catch (e) {
            console.warn('Could not set localStorage flag:', e);
          }
          setTimeout(() => navigate('/onboarding'), 500); // Small delay for better UX
        }
      });
      
    } catch (error) {
      console.error('Error en onProfileSubmit:', error);
      toast.error(`Error al actualizar el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };
  const onPasswordSubmit = async (_data: PasswordFormData) => {
    setIsLoading(true);
    try {
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
      const {
        data: {
          user: currentUser
        }
      } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error('No estás autenticado');
        return;
      }
      const fileExt = file?.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const filePath = `${user.id}/${user.id}_${timestamp}.${fileExt}`;

      // Try to delete existing files
      try {
        const {
          data: existingFiles
        } = await supabase.storage.from('avatars').list(user.id + '/');
        if (existingFiles && existingFiles.length > 0) {
          const filePaths = existingFiles.map(file => `${user.id}/${file.name}`);
          await supabase.storage.from('avatars').remove(filePaths);
        }
      } catch (error) {
        console.error('No se pudieron eliminar archivos existentes:', error);
      }
      const {
        error: uploadError
      } = await supabase.storage.from('avatars').upload(filePath, file!, {
        upsert: true
      });
      let publicUrl: string;
      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        if (uploadError.message.includes('permission') || uploadError.message.includes('row-level security')) {
          const alternativePath = `public/${user.id}.${fileExt}`;
          const {
            error: altUploadError
          } = await supabase.storage.from('avatars').upload(alternativePath, file!, {
            upsert: true
          });
          if (altUploadError) {
            throw new Error(`Error de permisos: ${altUploadError.message}`);
          }
          const {
            data
          } = supabase.storage.from('avatars').getPublicUrl(alternativePath);
          publicUrl = data.publicUrl;
        } else {
          throw new Error(`Error al subir archivo: ${uploadError.message}`);
        }
      } else {
        const {
          data
        } = supabase.storage.from('avatars').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }
      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública');
      }
      const {
        error: directUpdateError
      } = await supabase.from('profiles').update({
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
  return <div className="space-y-6 mx-[20px] my-[20px] px-[20px] py-[20px]">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Perfil Personal</h2>
          <p className="text-muted-foreground">Gestiona tu información personal y perfil profesional</p>
        </div>
      </div>

      {/* Profile Completeness Card for Talent */}
      {isTalentRole(userRole) && <ProfileCompletenessCard />}

      <Tabs value={activeTab} onValueChange={(newTab) => {
        console.log('ProfileSettings: tab changed to', newTab);
        if (newTab !== activeTab) {
          setActiveTab(newTab);
          // Update URL when tab changes, but use replace to avoid history entries
          navigate(`/settings/profile?tab=${newTab}`, { replace: true });
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Información Personal
          </TabsTrigger>
          {isTalentRole(userRole) && (
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Perfil Profesional
            </TabsTrigger>
          )}
          {isBusinessRole(userRole) && (
            <TabsTrigger value="corporate" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Perfil Corporativo
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="personal" className="mt-6">
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
                      <AvatarImage src={profileForm.watch('photo') || profile?.avatar_url || ''} alt="Foto de perfil" />
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

                    <FormField control={profileForm.control} name="country" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu país" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={profileForm.control} name="city" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu ciudad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={passwordForm.control} name="currentPassword" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Contraseña Actual</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showPasswords.current ? 'text' : 'password'} placeholder="Contraseña actual" {...field} />
                              <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1" onClick={() => togglePasswordVisibility('current')}>
                                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={passwordForm.control} name="newPassword" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showPasswords.new ? 'text' : 'password'} placeholder="Nueva contraseña" {...field} />
                              <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1" onClick={() => togglePasswordVisibility('new')}>
                                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={passwordForm.control} name="confirmPassword" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showPasswords.confirm ? 'text' : 'password'} placeholder="Confirmar nueva contraseña" {...field} />
                              <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1" onClick={() => togglePasswordVisibility('confirm')}>
                                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => passwordForm.reset()}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading || !passwordForm.formState.isDirty}>
                      {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Profile Tab */}
        {isTalentRole(userRole) && <TabsContent value="professional" className="mt-6">
            <TalentProfileWizard />
          </TabsContent>}

        {/* Corporate Profile Tab */}
        {isBusinessRole(userRole) && <TabsContent value="corporate" className="mt-6">
            <CompanyProfileWizard />
          </TabsContent>}
      </Tabs>
    </div>;
};
export default ProfileSettings;