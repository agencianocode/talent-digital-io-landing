import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Linkedin, Youtube, Github, Twitter, ExternalLink, CheckCircle, Instagram } from 'lucide-react';
import { WizardData } from '../TalentProfileWizard';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const urlSchema = z.string().url('Debe ser una URL válida').optional().or(z.literal(''));

const socialLinksSchema = z.object({
  linkedin: urlSchema,
  youtube: urlSchema,
  website: urlSchema,
  github: urlSchema,
  twitter: urlSchema,
  instagram: urlSchema,
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

interface SocialLinksStepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export const SocialLinksStep: React.FC<SocialLinksStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const { updateProfile } = useSupabaseAuth();
  const form = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      linkedin: data.social_links?.linkedin || '',
      youtube: data.social_links?.youtube || '',
      website: data.social_links?.website || '',
      github: data.social_links?.github || '',
      twitter: data.social_links?.twitter || '',
      instagram: data.social_links?.instagram || '',
    },
  });

  const onSubmit = async (formData: SocialLinksFormData) => {
    const socialLinks = {
      linkedin: formData.linkedin || undefined,
      youtube: formData.youtube || undefined,
      website: formData.website || undefined,
      github: formData.github || undefined,
      twitter: formData.twitter || undefined,
      instagram: formData.instagram || undefined,
    };

    // Use updateProfile from context to ensure profile is refreshed
    await updateProfile({ social_links: socialLinks } as any);
    
    // Also update wizard data
    await updateData({ social_links: socialLinks });
    onNext();
  };

  const socialPlatforms = [
    {
      name: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      placeholder: 'https://linkedin.com/in/tu-perfil',
      description: 'Tu perfil profesional más importante',
      color: 'text-blue-600',
      priority: 'high',
    },
    {
      name: 'github' as keyof SocialLinksFormData,
      label: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      placeholder: 'https://github.com/tu-usuario',
      description: 'Repositorio de código y proyectos',
      color: 'text-gray-800',
      priority: 'high',
    },
    {
      name: 'website' as keyof SocialLinksFormData,
      label: 'Sitio Web Personal',
      icon: <Globe className="h-5 w-5" />,
      placeholder: 'https://tu-sitio-web.com',
      description: 'Tu sitio web o blog personal',
      color: 'text-green-600',
      priority: 'medium',
    },
    {
      name: 'youtube' as keyof SocialLinksFormData,
      label: 'YouTube',
      icon: <Youtube className="h-5 w-5" />,
      placeholder: 'https://youtube.com/@tu-canal',
      description: 'Canal con contenido profesional',
      color: 'text-red-600',
      priority: 'medium',
    },
    {
      name: 'instagram' as keyof SocialLinksFormData,
      label: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      placeholder: 'https://instagram.com/tu-usuario',
      description: 'Perfil profesional (no personal)',
      color: 'text-pink-600',
      priority: 'medium',
    },
    {
      name: 'twitter' as keyof SocialLinksFormData,
      label: 'Twitter (X)',
      icon: <Twitter className="h-5 w-5" />,
      placeholder: 'https://twitter.com/tu-usuario',
      description: 'Perfil para networking profesional',
      color: 'text-blue-400',
      priority: 'low',
    },
  ];

  const getCompletedLinksCount = () => {
    const values = form.getValues();
    return Object.values(values).filter(value => value && value.length > 0).length;
  };

  const validateUrl = (url: string, platform: string) => {
    if (!url) return true;
    
    const platformValidations: Record<string, RegExp> = {
      linkedin: /^https:\/\/(www\.)?linkedin\.com\//,
      github: /^https:\/\/(www\.)?github\.com\//,
      youtube: /^https:\/\/(www\.)?youtube\.com\//,
      twitter: /^https:\/\/(www\.)?(twitter\.com|x\.com)\//,
      instagram: /^https:\/\/(www\.)?instagram\.com\//,
    };

    const validation = platformValidations[platform];
    return validation ? validation.test(url) : true;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Redes Sociales Profesionales
        </h2>
        <p className="text-muted-foreground">
          Conecta tu presencia digital para mayor credibilidad
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Progreso de Enlaces</CardTitle>
              <CardDescription>
                {getCompletedLinksCount()} de {socialPlatforms.length} plataformas conectadas
              </CardDescription>
            </div>
            <Badge variant={getCompletedLinksCount() >= 2 ? 'default' : 'secondary'}>
              {getCompletedLinksCount() >= 2 ? 'Completo' : 'En progreso'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            {socialPlatforms.map((platform) => (
              <Card key={platform.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${platform.color}`}>
                        {platform.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {platform.label}
                          {platform.priority === 'high' && (
                            <Badge variant="outline" className="text-xs">
                              Recomendado
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {platform.description}
                        </CardDescription>
                      </div>
                    </div>
                        {form.watch(platform.name as keyof SocialLinksFormData) && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name={platform.name as keyof SocialLinksFormData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del perfil</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder={platform.placeholder}
                              {...field}
                              className="pr-10"
                            />
                            {field.value && (
                              <a
                                href={field.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                        {field.value && !validateUrl(field.value, platform.name) && (
                          <p className="text-sm text-destructive">
                            URL no válida para {platform.label}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Consejos para tus redes sociales profesionales:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>LinkedIn:</strong> Mantén tu perfil actualizado y profesional</li>
                <li>• <strong>GitHub:</strong> Muestra proyectos activos y código limpio</li>
                <li>• <strong>Portfolio:</strong> Destaca tus mejores trabajos con descripciones</li>
                <li>• <strong>Instagram:</strong> Usa como portafolio visual, evita contenido personal</li>
                <li>• <strong>YouTube:</strong> Comparte conocimientos y tutoriales</li>
                <li>• <strong>Twitter:</strong> Participa en conversaciones de tu industria</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                <strong>Importante:</strong> Asegúrate de que todos tus perfiles reflejen una imagen profesional coherente.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Anterior
            </Button>
            <Button type="submit">
              Finalizar Perfil
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};