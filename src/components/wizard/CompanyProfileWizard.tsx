import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { ImageCropper } from '@/components/ImageCropper';
import { MediaGallery } from '@/components/MediaGallery';
import { useProfessionalData } from '@/hooks/useProfessionalData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Building, 
  MapPin, 
  Loader2, 
  DollarSign, 
  Factory, 
  Globe, 
  Link2,
  Image,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
  Edit,
  Plus,
  Users2,
  ArrowLeft
} from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(2, 'La ubicación es requerida'),
  logo_url: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  annual_revenue_range: z.string().optional(),
  website: z.string()
    .optional()
    .transform((val) => {
      if (!val || val === '') return '';
      // Si ya tiene protocolo, devolverlo tal cual
      if (val.startsWith('http://') || val.startsWith('https://')) {
        return val;
      }
      // Si no tiene protocolo, agregar https://
      return `https://${val}`;
    })
    .pipe(z.string().url('Debe ser una URL válida').optional().or(z.literal(''))),
  social_links: z.object({
    linkedin: z.string()
      .optional()
      .transform((val) => {
        if (!val || val === '') return '';
        if (val.startsWith('http://') || val.startsWith('https://')) {
          return val;
        }
        return `https://${val}`;
      }),
    instagram: z.string()
      .optional()
      .transform((val) => {
        if (!val || val === '') return '';
        if (val.startsWith('http://') || val.startsWith('https://')) {
          return val;
        }
        return `https://${val}`;
      }),
    youtube: z.string()
      .optional()
      .transform((val) => {
        if (!val || val === '') return '';
        if (val.startsWith('http://') || val.startsWith('https://')) {
          return val;
        }
        return `https://${val}`;
      }),
    twitter: z.string()
      .optional()
      .transform((val) => {
        if (!val || val === '') return '';
        if (val.startsWith('http://') || val.startsWith('https://')) {
          return val;
        }
        return `https://${val}`;
      }),
  }).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

// Import MediaItem from the component
import type { MediaItem } from '@/components/MediaGallery';

const companySizeOptions = [
  { value: '1', label: '1 (unipersonal / freelance)' },
  { value: '2-10', label: '2 – 10 empleados' },
  { value: '11-50', label: '11 – 50 empleados' },
  { value: '51-200', label: '51 – 200 empleados' },
  { value: '201-500', label: '201 – 500 empleados' },
  { value: '501-1000', label: '501 – 1.000 empleados' },
  { value: '1000+', label: '+1.000 empleados' },
];

const revenueOptions = [
  { value: 'under_100k', label: 'Menos de $100K' },
  { value: '500k_2m', label: '$500K – $2M' },
  { value: '2m_10m', label: '$2M – $10M' },
  { value: '10m_50m', label: '$10M – $50M' },
  { value: '50m_plus', label: 'Más de $50M' },
];

export const CompanyProfileWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { activeCompany: company, refreshCompanies } = useCompany();
  const { createCompany } = useSupabaseAuth();
  const { industries } = useProfessionalData();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [editingSocialLink, setEditingSocialLink] = useState<string | null>(null);
  const [tempSocialUrl, setTempSocialUrl] = useState('');
  const [hasSocialLinksChanges, setHasSocialLinksChanges] = useState(false);
  const [hasGalleryChanges, setHasGalleryChanges] = useState(false);
  const [initialMediaItemsCount, setInitialMediaItemsCount] = useState(0);

  // Handle social link editing
  const handleEditSocialLink = (platform: string, currentUrl: string) => {
    setEditingSocialLink(platform);
    setTempSocialUrl(currentUrl || '');
  };

  const handleSaveSocialLink = () => {
    if (editingSocialLink) {
      form.setValue(`social_links.${editingSocialLink}` as any, tempSocialUrl, { 
        shouldDirty: true, 
        shouldTouch: true, 
        shouldValidate: true 
      });
      setHasSocialLinksChanges(true);
      console.log(`Saving social link ${editingSocialLink}:`, tempSocialUrl);
      console.log('Current form values:', form.getValues());
      setEditingSocialLink(null);
      setTempSocialUrl('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSocialLink(null);
    setTempSocialUrl('');
  };

  const handleRemoveSocialLink = (platform: string) => {
    form.setValue(`social_links.${platform}` as any, '', { 
      shouldDirty: true, 
      shouldTouch: true, 
      shouldValidate: true 
    });
    setHasSocialLinksChanges(true);
  };

  // Local function to update company directly
  const updateCompanyDirectly = async (data: any) => {
    if (!company?.id) {
      throw new Error('No company ID available');
    }

    console.log('Updating company with ID:', company.id);
    console.log('Data being sent to database:', data);
    console.log('Social links in data:', data.social_links);

    const { error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', company.id);

    if (error) {
      console.error('Error updating company:', error);
      throw error;
    }

    console.log('Company updated successfully');
    return { error: null };
  };

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
      const galleryData = (company as any).media_gallery || (company as any).gallery_urls || [];
      if (galleryData && galleryData.length > 0) {
        setMediaItems(galleryData);
        setInitialMediaItemsCount(galleryData.length);
      } else {
        setMediaItems([]);
        setInitialMediaItemsCount(0);
      }
      
      // Reset social links changes state when company data loads
      setHasSocialLinksChanges(false);
      setHasGalleryChanges(false);
    }
  }, [company, form]);

  // Detectar cambios en la galería comparando con el estado inicial
  useEffect(() => {
    if (mediaItems.length !== initialMediaItemsCount) {
      setHasGalleryChanges(true);
    }
  }, [mediaItems.length, initialMediaItemsCount]);

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      // Convert media items to gallery format
      const media_gallery = mediaItems;

      const companyData = {
        ...data,
        media_gallery,
      };

      console.log('Submitting company data:', companyData);
      console.log('Social links data:', data.social_links);
      console.log('Form is dirty:', form.formState.isDirty);
      console.log('Has social links changes:', hasSocialLinksChanges);

      if (company?.id) {
        // Update existing company directly
        const result = await updateCompanyDirectly(companyData);
        if (result.error) {
          console.error('Error updating company:', result.error);
          throw result.error;
        }
        // Refresh company data to show updated information
        await refreshCompanies();
        setHasSocialLinksChanges(false);
        setHasGalleryChanges(false);
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
          media_gallery,
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
      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de archivo no admitido. Tipos permitidos: PNG, JPG');
        return;
      }
      
      // Validar tamaño del archivo
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El archivo excede el tamaño permitido. Máximo: 2MB');
        return;
      }

      const url = URL.createObjectURL(file);
      setLogoFile(url);
      setIsCropperOpen(true);
    }
  };

  // Función helper para comprimir imágenes
  const compressImage = async (blob: Blob, quality: number = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar si es muy grande (máx 1200px)
        let width = img.width;
        let height = img.height;
        const maxSize = 1200;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (compressedBlob) => {
            URL.revokeObjectURL(url);
            if (compressedBlob) {
              resolve(compressedBlob);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error al cargar imagen'));
      };
      
      img.src = url;
    });
  };

  const handleLogoCropComplete = async (croppedImageUrl: string) => {
    setIsLoading(true);
    try {
      // Convert blob URL to actual file
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      console.log('📊 Tamaño original:', (blob.size / 1024).toFixed(2), 'KB');
      
      // Comprimir la imagen antes de subir
      const compressedBlob = await compressImage(blob, 0.7); // 70% calidad
      
      console.log('📊 Tamaño comprimido:', (compressedBlob.size / 1024).toFixed(2), 'KB');
      
      // Verificar que no exceda el límite después de comprimir
      if (compressedBlob.size > 2 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande incluso después de comprimir. Usa una imagen más pequeña.');
        return;
      }
      
      // Create file from compressed blob
      const file = new File([compressedBlob], 'company-logo.jpg', { type: 'image/jpeg' });
      
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
      
      // Set the permanent URL in the form and mark as dirty
      form.setValue('logo_url', data.publicUrl, { 
        shouldDirty: true, 
        shouldTouch: true 
      });
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
    console.log('Adding media item:', newItem);
    setMediaItems(prev => {
      const updated = [...prev, newItem];
      console.log('Updated media items:', updated);
      return updated;
    });
    setHasGalleryChanges(true);
    console.log('hasGalleryChanges set to true');
  };

  const handleRemoveMediaItem = (itemId: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== itemId));
    setHasGalleryChanges(true);
  };

  const handleUpdateMediaItem = (itemId: string, updates: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
    setHasGalleryChanges(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate('/business-dashboard/company-details')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Detalles
      </Button>

      {/* Header */}
      <div className="text-center space-y-2">
        <Building className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Perfil Corporativo</h1>
        <p className="text-muted-foreground">
          Administra la información completa de tu empresa
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 flex-shrink-0">
                  {form.watch('logo_url') ? (
                    <img 
                      src={form.watch('logo_url')} 
                      alt="Logo de la empresa"
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                      {company?.name?.charAt(0)?.toUpperCase() || <Building className="h-8 w-8 text-muted-foreground" />}
                    </div>
                  )}
                </div>
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
                        placeholder="Describí brevemente a qué se dedica tu empresa, su propósito o qué la hace diferente." 
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

          {/* Classification Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Clasificación
              </CardTitle>
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
                      <Users2 className="h-4 w-4" />
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

          {/* Digital Presence Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Presencia Digital
              </CardTitle>
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
                
                {/* Social Media Icons Display */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', placeholder: 'https://linkedin.com/company/miempresa' },
                    { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', placeholder: 'https://instagram.com/miempresa' },
                    { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600', placeholder: 'https://youtube.com/@miempresa' },
                    { key: 'twitter', label: 'Twitter (X)', icon: Twitter, color: 'text-gray-600', placeholder: 'https://twitter.com/miempresa' }
                  ].map(({ key, label, icon: Icon, color, placeholder }) => {
                    const currentUrl = form.watch(`social_links.${key}` as any) || '';
                    const isEditing = editingSocialLink === key;
                    
                    return (
                      <div key={key} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-6 w-6 ${color}`} />
                            <span className="font-medium">{label}</span>
                          </div>
                          {currentUrl && !isEditing && (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(currentUrl, '_blank')}
                                className="h-8 w-8 p-0"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSocialLink(key, currentUrl)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              placeholder={placeholder}
                              value={tempSocialUrl}
                              onChange={(e) => setTempSocialUrl(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveSocialLink}
                                className="flex-1"
                              >
                                Guardar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="flex-1"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : currentUrl ? (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate flex-1 mr-2">
                              {currentUrl}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSocialLink(key)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSocialLink(key, '')}
                            className="w-full flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Agregar {label}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Galería
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MediaGallery
                items={mediaItems}
                onAddItem={handleAddMediaItem}
                onRemoveItem={handleRemoveMediaItem}
                onUpdateItem={handleUpdateMediaItem}
                maxItems={10}
              />
            </CardContent>
          </Card>

          {/* Submit Button - Fixed at bottom */}
          <div className="flex justify-end gap-4 p-4 bg-background border-t sticky bottom-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                form.reset();
                setHasSocialLinksChanges(false);
                setHasGalleryChanges(false);
              }}
              disabled={isLoading}
            >
              Descartar Cambios
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (!form.formState.isDirty && !hasSocialLinksChanges && !hasGalleryChanges)}
              onClick={() => {
                console.log('=== SAVE BUTTON STATE ===');
                console.log('Form is dirty:', form.formState.isDirty);
                console.log('Has social links changes:', hasSocialLinksChanges);
                console.log('Has gallery changes:', hasGalleryChanges);
                console.log('Media items count:', mediaItems.length);
                console.log('Button should be enabled:', form.formState.isDirty || hasSocialLinksChanges || hasGalleryChanges);
              }}
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
