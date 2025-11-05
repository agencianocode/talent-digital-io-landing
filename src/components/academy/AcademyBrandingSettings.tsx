import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette } from 'lucide-react';

interface AcademyBrandingSettingsProps {
  academyId: string;
}

export const AcademyBrandingSettings = ({ academyId }: AcademyBrandingSettingsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [brandColor, setBrandColor] = useState('#1976d2');
  const [secondaryColor, setSecondaryColor] = useState('#42a5f5');
  const [tagline, setTagline] = useState('');
  const [academySlug, setAcademySlug] = useState('');
  const [publicDirectoryEnabled, setPublicDirectoryEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [academyId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('brand_color, secondary_color, academy_tagline, academy_slug, public_directory_enabled')
        .eq('id', academyId)
        .single();

      if (error) throw error;

      if (data) {
        setBrandColor(data.brand_color || '#1976d2');
        setSecondaryColor(data.secondary_color || '#42a5f5');
        setTagline(data.academy_tagline || '');
        setAcademySlug(data.academy_slug || '');
        setPublicDirectoryEnabled(data.public_directory_enabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('companies')
        .update({
          brand_color: brandColor,
          secondary_color: secondaryColor,
          academy_tagline: tagline.trim() || null,
          academy_slug: academySlug.trim() || null,
          public_directory_enabled: publicDirectoryEnabled,
        })
        .eq('id', academyId);

      if (error) throw error;

      toast({
        title: 'Guardado exitoso',
        description: 'La configuración de branding se ha actualizado',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <CardTitle>Personalización de Marca</CardTitle>
        </div>
        <CardDescription>
          Configura los colores, lema y URL de tu academia para personalizar tu directorio público
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brandColor">Color Principal</Label>
            <div className="flex gap-2">
              <Input
                id="brandColor"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#1976d2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Color Secundario</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#42a5f5"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Lema de la Academia</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ej: Formando el talento del futuro"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL del Directorio Público</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">app.talentodigital.io/academy/</span>
            <Input
              id="slug"
              value={academySlug}
              onChange={(e) => setAcademySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="mi-academia"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            La URL se genera automáticamente desde el nombre de tu academia
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="publicDirectory">Directorio Público Habilitado</Label>
            <p className="text-sm text-muted-foreground">
              Permite que el público vea tu directorio de graduados
            </p>
          </div>
          <Switch
            id="publicDirectory"
            checked={publicDirectoryEnabled}
            onCheckedChange={setPublicDirectoryEnabled}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Vista previa del directorio:
            {academySlug && (
              <a 
                href={`${window.location.origin}/academy/${academySlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline"
              >
                Ver página pública
              </a>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
