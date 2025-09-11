import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Upload, Link, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { WizardData } from '../TalentProfileWizard';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

const multimediaSchema = z.object({
  video_presentation_url: z.string().optional(),
  portfolio_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

type MultimediaFormData = z.infer<typeof multimediaSchema>;

interface MultimediaStepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export const MultimediaStep: React.FC<MultimediaStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(
    data.video_presentation_url || null
  );

  const form = useForm<MultimediaFormData>({
    resolver: zodResolver(multimediaSchema),
    defaultValues: {
      video_presentation_url: data.video_presentation_url,
      portfolio_url: data.portfolio_url,
    },
  });

  const onSubmit = async (formData: MultimediaFormData) => {
    await updateData({
      video_presentation_url: uploadedVideo || formData.video_presentation_url || '',
      portfolio_url: formData.portfolio_url || '',
    });
    onNext();
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Formato no válido',
        description: 'Solo se permiten archivos MP4, WebM u OGG',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: 'Archivo muy grande',
        description: 'El video no puede exceder 50MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/video-presentation-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setUploadedVideo(publicUrl);
      form.setValue('video_presentation_url', publicUrl);
      
      toast({
        title: 'Video subido exitosamente',
        description: 'Tu video de presentación ha sido guardado',
      });
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Error al subir video',
        description: error.message || 'Hubo un problema al subir el video',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Portfolio y Multimedia
        </h2>
        <p className="text-muted-foreground">
          Muestra tu trabajo y personalidad a través de contenido visual
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Video Presentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Video de Presentación
              </CardTitle>
              <CardDescription>
                Un video personal de 1-3 minutos donde te presentes profesionalmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedVideo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Video subido exitosamente</span>
                  </div>
                  <video 
                    controls 
                    className="w-full max-w-md rounded-lg"
                    src={uploadedVideo}
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedVideo(null);
                      form.setValue('video_presentation_url', '');
                    }}
                  >
                    Cambiar video
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sube tu video de presentación</p>
                      <p className="text-xs text-muted-foreground">
                        MP4, WebM u OGG (máximo 50MB)
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <Button 
                        type="button" 
                        className="mt-4" 
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          {isUploading ? 'Subiendo...' : 'Seleccionar archivo'}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Consejos para tu video:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Presenta tu experiencia y especialidades</li>
                        <li>• Menciona tus logros más importantes</li>
                        <li>• Explica qué valor aportas a los proyectos</li>
                        <li>• Mantén un tono profesional pero auténtico</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolio URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Portfolio Online
              </CardTitle>
              <CardDescription>
                Enlace a tu portfolio, sitio web personal o repositorio de trabajos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="portfolio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Portfolio</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://mi-portfolio.com o https://github.com/usuario"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Puede ser tu sitio web, GitHub, Behance, Dribbble, LinkedIn, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Plataformas recomendadas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'GitHub',
                    'Behance',
                    'Dribbble',
                    'Portfolio personal',
                    'LinkedIn',
                    'Figma',
                  ].map((platform) => (
                    <Badge key={platform} variant="outline">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Image className="h-4 w-4" />
            <AlertDescription>
              <strong>¿Por qué es importante el contenido multimedia?</strong>
              <p className="mt-1 text-sm">
                Los perfiles con video de presentación y portfolio tienen hasta 5x más probabilidades 
                de ser contactados por empresas. Muestran tu personalidad y habilidades de manera directa.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Anterior
            </Button>
            <Button type="submit">
              Continuar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};