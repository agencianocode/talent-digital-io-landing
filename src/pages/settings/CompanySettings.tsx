
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import UpgradeRequestButton from '@/components/UpgradeRequestButton';

const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  website: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
  location: z.string().min(2, 'La ubicación es requerida'),
  logo: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const CompanySettings = () => {
  const { company, updateCompany } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      description: company?.description || '',
      website: company?.website || '',
      location: company?.location || '',
      logo: company?.logo_url || '',
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        if (form.formState.isValid && form.formState.isDirty) {
          handleAutoSave(value as CompanyFormData);
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleAutoSave = async (data: CompanyFormData) => {
    try {
      await updateCompany(data);
      toast.success('Cambios guardados automáticamente');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      await updateCompany(data);
      toast.success('Información de la empresa actualizada');
      form.reset(data);
    } catch (error) {
      toast.error('Error al actualizar la información');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = () => {
    // Simulate file upload
    const fakeUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${company?.name || 'Company'}`;
    form.setValue('logo', fakeUrl);
    toast.success('Logo actualizado (simulado)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Información de la Empresa</h2>
        <p className="text-muted-foreground">Gestiona la información básica de tu empresa</p>
      </div>

      {/* Upgrade Request Button */}
      <UpgradeRequestButton />

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {form.watch('logo') ? (
                    <img src={form.watch('logo')} alt="Company logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Button type="button" variant="outline" onClick={handleLogoUpload}>
                    Subir Logo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG hasta 2MB</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe tu empresa y lo que hace"
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tuempresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad, País" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Descartar Cambios
                </Button>
                <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;
