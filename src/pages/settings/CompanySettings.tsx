import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { MediaGallery, MediaItem } from '@/components/MediaGallery';
import { TeamManagement } from '@/components/TeamManagement';
import { ImageCropper } from '@/components/ImageCropper';
import { toast } from 'sonner';
import { 
  Upload, 
  ArrowLeft, 
  Building, 
  Users, 
  Images, 
  Globe,
  DollarSign,
  MapPin,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook
} from 'lucide-react';
import UpgradeRequestButton from '@/components/UpgradeRequestButton';

const socialPlatforms = [
  { key: 'website', label: 'Sitio Web', icon: Globe, placeholder: 'https://tuempresa.com' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/...' },
  { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/...' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/...' }
];

const employeeCountRanges = [
  '1-10',
  '11-50', 
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

const revenueRanges = [
  'Menos de $100K',
  '$100K - $500K',
  '$500K - $1M',
  '$1M - $5M',
  '$5M - $10M',
  '$10M - $50M',
  'Más de $50M'
];

const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(2, 'La ubicación es requerida'),
  logo_url: z.string().optional(),
  employee_count_range: z.string().optional(),
  annual_revenue_range: z.string().optional(),
  business_type: z.string().optional(),
  social_links: z.record(z.string()).optional(),
  gallery_urls: z.array(z.object({
    id: z.string(),
    type: z.enum(['image', 'video', 'document', 'link']),
    url: z.string(),
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.string().optional()
  })).optional()
});

type CompanyFormData = z.infer<typeof companySchema>;

const CompanySettings = () => {
  const navigate = useNavigate();
  const { company, updateCompany } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
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
      employee_count_range: company?.employee_count_range || '',
      annual_revenue_range: company?.annual_revenue_range || '',
      business_type: company?.business_type || 'company',
      social_links: company?.social_links || {},
      gallery_urls: []
    }
  });

  // Initialize media gallery from company data
  useEffect(() => {
    if (company?.gallery_urls) {
      const items = Array.isArray(company.gallery_urls) 
        ? company.gallery_urls.map((item: any) => ({
            id: item.id || Math.random().toString(),
            type: item.type || 'image',
            url: item.url,
            title: item.title || 'Sin título',
            description: item.description,
            thumbnail: item.thumbnail
          }))
        : [];
      setMediaItems(items);
    }
  }, [company]);

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch(value => {
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
      await updateCompany({ ...data, gallery_urls: mediaItems });
      toast.success('Cambios guardados automáticamente');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      await updateCompany({ ...data, gallery_urls: mediaItems });
      toast.success('Información de la empresa actualizada');
      form.reset(data);
    } catch (error) {
      toast.error('Error al actualizar la información');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoFile(url);
      setIsCropperOpen(true);
    }
  };

  const handleLogoCropComplete = (croppedImageUrl: string) => {
    form.setValue('logo_url', croppedImageUrl);
    setIsCropperOpen(false);
    setLogoFile(null);
    toast.success('Logo actualizado');
  };

  const handleAddMediaItem = (item: Omit<MediaItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString() };
    setMediaItems(prev => [...prev, newItem]);
  };

  const handleRemoveMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    const currentLinks = form.getValues('social_links') || {};
    form.setValue('social_links', {
      ...currentLinks,
      [platform]: value
    });
  };

  return (
    <div className="space-y-6 mx-[5px] my-[5px] px-[20px] py-[20px]">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuración de la Empresa</h2>
          <p className="text-muted-foreground">Gestiona toda la información corporativa</p>
        </div>
      </div>

      {/* Upgrade Request Button */}
      <UpgradeRequestButton />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Multimedia
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Redes Sociales
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Equipo
          </TabsTrigger>
        </TabsList>

        {/* General Information Tab */}
        <TabsContent value="general">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload with Cropping */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {form.watch('logo_url') ? (
                        <img 
                          src={form.watch('logo_url')} 
                          alt="Company logo" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline">
                          Subir Logo
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG hasta 2MB. Se recortará automáticamente.
                      </p>
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
                            placeholder="Describe tu empresa, misión, valores y servicios" 
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

                    <FormField
                      control={form.control}
                      name="business_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Negocio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="startup">Startup</SelectItem>
                              <SelectItem value="company">Empresa</SelectItem>
                              <SelectItem value="corporation">Corporación</SelectItem>
                              <SelectItem value="nonprofit">Sin fines de lucro</SelectItem>
                              <SelectItem value="government">Gobierno</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employee_count_range"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Users className="h-4 w-4 inline mr-2" />
                            Número de Empleados
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rango" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employeeCountRanges.map(range => (
                                <SelectItem key={range} value={range}>
                                  {range} empleados
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="annual_revenue_range"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <DollarSign className="h-4 w-4 inline mr-2" />
                            Facturación Anual
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rango" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {revenueRanges.map(range => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Media Gallery Tab */}
        <TabsContent value="media">
          <MediaGallery
            items={mediaItems}
            onAddItem={handleAddMediaItem}
            onRemoveItem={handleRemoveMediaItem}
            onUpdateItem={handleUpdateMediaItem}
            maxItems={20}
          />
        </TabsContent>

        {/* Social Networks Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <p className="text-sm text-muted-foreground">
                Conecta tus perfiles de redes sociales y sitio web
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialPlatforms.map(platform => {
                const IconComponent = platform.icon;
                const currentValue = form.watch('social_links')?.[platform.key] || '';
                
                return (
                  <div key={platform.key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <IconComponent className="h-4 w-4" />
                      {platform.label}
                    </label>
                    <Input
                      placeholder={platform.placeholder}
                      value={currentValue}
                      onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                      className="w-full"
                    />
                  </div>
                );
              })}
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => form.handleSubmit(onSubmit)()}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Guardar Enlaces
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team">
          {company?.id && <TeamManagement companyId={company.id} />}
        </TabsContent>
      </Tabs>

      {/* Logo Cropper */}
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

export default CompanySettings;