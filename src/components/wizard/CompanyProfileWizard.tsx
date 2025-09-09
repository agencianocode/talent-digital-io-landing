import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ImageCropper } from '@/components/ImageCropper';
import { toast } from 'sonner';
import { Upload, Building, MapPin, Loader2 } from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(2, 'La ubicación es requerida'),
  logo_url: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export const CompanyProfileWizard: React.FC = () => {
  const { company, updateCompany } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      description: company?.description || '',
      location: company?.location || '',
      logo_url: company?.logo_url || '',
    }
  });

  // Update form when company data changes
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        description: company.description || '',
        location: company.location || '',
        logo_url: company.logo_url || '',
      });
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      await updateCompany(data);
      toast.success('Perfil corporativo actualizado');
      form.reset(data);
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 2MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen.');
        return;
      }

      const url = URL.createObjectURL(file);
      setLogoFile(url);
      setIsCropperOpen(true);
    }
  };

  const handleLogoCropComplete = (croppedImageUrl: string) => {
    form.setValue('logo_url', croppedImageUrl);
    setIsCropperOpen(false);
    setLogoFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Building className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Perfil Corporativo</h1>
        <p className="text-muted-foreground">
          Información básica de tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={form.watch('logo_url')} alt="Logo de la empresa" />
                  <AvatarFallback className="text-lg bg-primary/10">
                    {company?.name?.charAt(0)?.toUpperCase() || <Building className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label htmlFor="logo-upload">
                    <Button type="button" variant="outline" asChild disabled={isLoading}>
                      <span className="flex items-center cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar Logo
                        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      </span>
                    </Button>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleLogoUpload} 
                      disabled={isLoading} 
                    />
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG hasta 2MB
                  </p>
                </div>
              </div>

              {/* Company Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mi Empresa S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicación
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ciudad de México, México" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la Empresa</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe brevemente tu empresa, sus servicios y valores..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                  disabled={isLoading}
                >
                  Descartar Cambios
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !form.formState.isDirty}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Image Cropper */}
      {logoFile && (
        <ImageCropper
          src={logoFile}
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setLogoFile(null);
          }}
          onCropComplete={handleLogoCropComplete}
          aspect={1}
        />
      )}
    </div>
  );
};