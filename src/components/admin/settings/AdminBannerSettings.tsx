import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAdminCustomization } from '@/hooks/useAdminCustomization';
import { Monitor, ExternalLink, Video, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const AdminBannerSettings: React.FC = () => {
  const { customization, loading, saving, updateCustomization } = useAdminCustomization();
  const [localChanges, setLocalChanges] = useState<Record<string, any>>({});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customization) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No se pudo cargar la configuración
      </div>
    );
  }

  const handleSave = async () => {
    const success = await updateCustomization(localChanges);
    if (success) {
      setLocalChanges({});
    }
  };

  const getValue = (key: string): any => {
    return localChanges.hasOwnProperty(key) ? localChanges[key] : customization[key as keyof typeof customization];
  };

  const handleChange = (key: string, value: any) => {
    setLocalChanges(prev => ({ ...prev, [key]: value }));
  };

  const validateVideoUrl = (url: string): string => {
    // Convert YouTube/Vimeo URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/') && !url.includes('/video/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const handleVideoUrlBlur = () => {
    const currentUrl = getValue('banner_video_url');
    const validatedUrl = validateVideoUrl(currentUrl);
    if (validatedUrl !== currentUrl) {
      handleChange('banner_video_url', validatedUrl);
      toast.success('URL convertida a formato embed');
    }
  };

  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div className="space-y-6">
      {/* Save Button */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            size="lg"
            className="w-full sm:w-auto"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      )}

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Vista Previa del Banner
          </CardTitle>
          <CardDescription>
            Así se verá el banner en el Business Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-green-50 rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Left Column - Content */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Hola Usuario! 👋
                  </h2>
                  {getValue('banner_show_welcome_text') && (
                    <p className="text-base text-slate-600">
                      {getValue('banner_welcome_text')}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Video/Button */}
              {(getValue('banner_show_video') || getValue('banner_show_call_button')) && (
                <div className="space-y-3">
                  {getValue('banner_show_video') && (
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 w-full h-48">
                      <iframe
                        className="w-full h-full"
                        src={getValue('banner_video_url')}
                        title="Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {getValue('banner_show_call_button') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      disabled
                    >
                      {getValue('banner_call_button_text')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Configuración del Video
          </CardTitle>
          <CardDescription>
            Personaliza el video tutorial del banner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar video en el banner</Label>
              <p className="text-sm text-muted-foreground">
                Habilita o deshabilita el video del banner
              </p>
            </div>
            <div className="switch-mobile-oval">
              <Switch
                checked={getValue('banner_show_video')}
                onCheckedChange={(checked) => handleChange('banner_show_video', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_video_url">URL del Video (YouTube o Vimeo)</Label>
            <div className="flex gap-2">
              <Input
                id="banner_video_url"
                type="url"
                value={getValue('banner_video_url')}
                onChange={(e) => handleChange('banner_video_url', e.target.value)}
                onBlur={handleVideoUrlBlur}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={!getValue('banner_show_video')}
              />
              {getValue('banner_video_url') && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(getValue('banner_video_url'), '_blank')}
                  disabled={!getValue('banner_show_video')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa la URL de YouTube o Vimeo. Se convertirá automáticamente al formato embed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Text Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Texto del Banner
          </CardTitle>
          <CardDescription>
            Personaliza el mensaje de bienvenida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar texto de bienvenida</Label>
              <p className="text-sm text-muted-foreground">
                Activa o desactiva el mensaje de bienvenida en el banner
              </p>
            </div>
            <div className="switch-mobile-oval">
              <Switch
                checked={getValue('banner_show_welcome_text')}
                onCheckedChange={(checked) => handleChange('banner_show_welcome_text', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_welcome_text">Mensaje de Bienvenida</Label>
            <Input
              id="banner_welcome_text"
              value={getValue('banner_welcome_text')}
              onChange={(e) => handleChange('banner_welcome_text', e.target.value)}
              placeholder="Empezá a construir tu equipo..."
              maxLength={100}
              disabled={!getValue('banner_show_welcome_text')}
            />
            <p className="text-xs text-muted-foreground">
              {getValue('banner_welcome_text').length}/100 caracteres
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Call Button Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Botón de Llamada
          </CardTitle>
          <CardDescription>
            Configura el botón de agendamiento de llamadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar botón de llamada</Label>
              <p className="text-sm text-muted-foreground">
                Habilita o deshabilita el botón de agendamiento
              </p>
            </div>
            <div className="switch-mobile-oval">
              <Switch
                checked={getValue('banner_show_call_button')}
                onCheckedChange={(checked) => handleChange('banner_show_call_button', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_call_url">URL de Calendly/Agendamiento</Label>
            <div className="flex gap-2">
              <Input
                id="banner_call_url"
                type="url"
                value={getValue('banner_call_url')}
                onChange={(e) => handleChange('banner_call_url', e.target.value)}
                placeholder="https://calendly.com/..."
                disabled={!getValue('banner_show_call_button')}
              />
              {getValue('banner_call_url') && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(getValue('banner_call_url'), '_blank')}
                  disabled={!getValue('banner_show_call_button')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              URL de Calendly, Cal.com u otro sistema de agendamiento
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_call_button_text">Texto del Botón</Label>
            <Input
              id="banner_call_button_text"
              value={getValue('banner_call_button_text')}
              onChange={(e) => handleChange('banner_call_button_text', e.target.value)}
              placeholder="📞 Agendar llamada..."
              maxLength={50}
              disabled={!getValue('banner_show_call_button')}
            />
            <p className="text-xs text-muted-foreground">
              {getValue('banner_call_button_text').length}/50 caracteres
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBannerSettings;
