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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { ImageCropper } from '@/components/ImageCropper';
import { MediaGallery } from '@/components/MediaGallery';
import { TeamOverview } from '@/components/TeamOverview';
import { useProfessionalData } from '@/hooks/useProfessionalData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Building, 
  MapPin, 
  Loader2, 
  Users, 
  DollarSign, 
  Factory, 
  Globe, 
  Link2,
  Image
} from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(2, 'La ubicación es requerida'),
  logo_url: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  annual_revenue_range: z.string().optional(),
  website: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  social_links: z.object({
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

// Import MediaItem from the component
import type { MediaItem } from '@/components/MediaGallery';

const companySizeOptions = [
  { value: 'startup', label: '1-10 empleados (Startup)' },
  { value: 'small', label: '11-50 empleados (Pequeña)' },
  { value: 'medium', label: '51-200 empleados (Mediana)' },
  { value: 'large', label: '201-1000 empleados (Grande)' },
  { value: 'enterprise', label: '1000+ empleados (Corporativo)' },
];

const revenueOptions = [
  { value: 'seed', label: 'Pre-ingresos / Semilla' },
  { value: 'under_100k', label: 'Menos de $100K USD' },
  { value: '100k_500k', label: '$100K - $500K USD' },
  { value: '500k_1m', label: '$500K - $1M USD' },
  { value: '1m_5m', label: '$1M - $5M USD' },
  { value: '5m_10m', label: '$5M - $10M USD' },
  { value: '10m_plus', label: 'Más de $10M USD' },
];

export const CompanyProfileWizard: React.FC = () => {
  const { user } = useSupabaseAuth();
  const { activeCompany: company, refreshCompanies } = useCompany();
  const { updateCompany, createCompany } = useSupabaseAuth();
  const { industries } = useProfessionalData();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      description: company?.description || '',
      location: company?.location || '',
      logo_url: company?.logo_url || '',
      industry: company?.industry || '',
      size: company?.size || '',
      annual_revenue_range: company?.annual_revenue_range || '',
      website: company?.website || '',
      social_links: company?.social_links || {
        linkedin: '',
        instagram: '',
        youtube: '',
        twitter: '',
      },
    }
  });

  // Refresh company data on component mount
  useEffect(() => {
    if (user && !company) {
      refreshCompanies();
    }
  }, [user, company, refreshCompanies]);

  // Update form when company data changes
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        description: company.description || '',
        location: company.location || '',
        logo_url: company.logo_url || '',
        industry: company.industry || '',
        size: company.size || '',
        annual_revenue_range: company.annual_revenue_range || '',
        website: company.website || '',
        social_links: company.social_links || {
          linkedin: '',
          instagram: '',
          youtube: '',
          twitter: '',
        },
      });

      // Load gallery items from company
      if (company.gallery_urls && company.gallery_urls.length > 0) {
        setMediaItems(company.gallery_urls);
      }
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      // Convert media items to gallery URLs format
      const gallery_urls = mediaItems;

      const companyData = {
        ...data,
        gallery_urls,
      };

      if (company?.id) {
        // Update existing company
        await updateCompany(companyData);
        toast.success('Perfil corporativo actualizado');
      } else {
        // Create new company - ensure name is provided
        const result = await createCompany({
          name: data.name,
          description: data.description,
          location: data.location,
          logo_url: data.logo_url,
          industry: data.industry,
          size: data.size,
          annual_revenue_range: data.annual_revenue_range,
          website: data.website,
          social_links: data.social_links,
          gallery_urls,
        });
        if (result.error) {
          throw result.error;
        }
        
        // Refresh company context to load the new company
        await refreshCompanies();
        toast.success('Empresa creada exitosamente');
      }
      
      form.reset(data);
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error(company?.id ? 'Error al actualizar el perfil' : 'Error al crear la empresa');
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

  const handleLogoCropComplete = async (croppedImageUrl: string) => {
    setIsLoading(true);
    try {
      // Convert blob URL to actual file
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], 'company-logo.jpg', { type: 'image/jpeg' });
      
      // Upload to Supabase storage
      const fileExt = 'jpg';
      const timestamp = Date.now();
      const filePath = `company-logos/${user?.id}_${timestamp}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Set the permanent URL in the form
      form.setValue('logo_url', data.publicUrl);
      toast.success('Logo subido correctamente');
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo');
    } finally {
      setIsLoading(false);
      setIsCropperOpen(false);
      setLogoFile(null);
    }
  };

  const handleAddMediaItem = (item: Omit<MediaItem, 'id'>) => {
    const newItem: MediaItem = {
      ...item,
      id: `media-${Date.now()}`,
    };
    setMediaItems(prev => [...prev, newItem]);
  };

  const handleRemoveMediaItem = (itemId: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateMediaItem = (itemId: string, updates: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Building className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Perfil Corporativo</h1>
        <p className="text-muted-foreground">
          Administra la información completa de tu empresa
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="classification" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Clasificación
              </TabsTrigger>
              <TabsTrigger value="digital" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Presencia Digital
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Galería
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Equipo
              </TabsTrigger>
            </TabsList>

            {/* General Information Tab */}
            <TabsContent value="general" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classification Tab */}
            <TabsContent value="classification" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clasificación Empresarial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Industry */}
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Factory className="h-4 w-4" />
                          Industria
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una industria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.id} value={industry.name}>
                                {industry.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Company Size */}
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Tamaño de la Empresa
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tamaño" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companySizeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Annual Revenue */}
                  <FormField
                    control={form.control}
                    name="annual_revenue_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Facturación Anual
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el rango de facturación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {revenueOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Digital Presence Tab */}
            <TabsContent value="digital" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Presencia Digital</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Website */}
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Sitio Web
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://miempresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Redes Sociales
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="social_links.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/company/miempresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="social_links.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/miempresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="social_links.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/@miempresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="social_links.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter (X)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/miempresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="mt-6">
              <MediaGallery
                items={mediaItems}
                onAddItem={handleAddMediaItem}
                onRemoveItem={handleRemoveMediaItem}
                onUpdateItem={handleUpdateMediaItem}
                maxItems={10}
              />
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="mt-6">
              {company?.id ? (
                <TeamOverview companyId={company.id} />
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Guarda la información de la empresa primero para gestionar el equipo.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Submit Button - Fixed at bottom */}
            <div className="flex justify-end gap-4 mt-8 p-4 bg-background border-t sticky bottom-0">
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
          </Tabs>
        </form>
      </Form>


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