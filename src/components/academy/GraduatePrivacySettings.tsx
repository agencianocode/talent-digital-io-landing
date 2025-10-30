import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Eye, EyeOff, FileText } from 'lucide-react';

interface PrivacySettings {
  share_progress: boolean;
  show_in_directory: boolean;
  share_applications: boolean;
}

export const GraduatePrivacySettings = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGraduate, setIsGraduate] = useState(false);
  const [academyName, setAcademyName] = useState<string | null>(null);
  const [settings, setSettings] = useState<PrivacySettings>({
    share_progress: true,
    show_in_directory: true,
    share_applications: true,
  });

  useEffect(() => {
    if (user?.email) {
      loadSettings();
    }
  }, [user?.email]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('academy_students')
        .select(`
          privacy_settings,
          companies:academy_id (
            name
          )
        `)
        .eq('student_email', user!.email!)
        .eq('status', 'graduated')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsGraduate(true);
        setAcademyName((data as any).companies?.name || null);
        
        if (data.privacy_settings) {
          const privacyData = typeof data.privacy_settings === 'object' && data.privacy_settings !== null
            ? data.privacy_settings as Record<string, any>
            : {};
          
          setSettings({
            share_progress: privacyData.share_progress ?? true,
            show_in_directory: privacyData.show_in_directory ?? true,
            share_applications: privacyData.share_applications ?? true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('academy_students')
        .update({
          privacy_settings: settings as any
        })
        .eq('student_email', user!.email!)
        .eq('status', 'graduated');

      if (error) throw error;

      toast({
        title: 'Configuración guardada',
        description: 'Tus preferencias de privacidad se han actualizado',
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

  if (!isGraduate) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Esta configuración solo está disponible para graduados de academias
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Privacidad con Academia</CardTitle>
        </div>
        <CardDescription>
          Controla qué información compartes con {academyName || 'tu academia'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="share_applications">Compartir Aplicaciones</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Permite que la academia vea las oportunidades a las que aplicas y su estado
              </p>
            </div>
            <Switch
              id="share_applications"
              checked={settings.share_applications}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, share_applications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show_in_directory">Aparecer en Directorio Público</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu perfil aparecerá en el directorio público de graduados de la academia
              </p>
            </div>
            <Switch
              id="show_in_directory"
              checked={settings.show_in_directory}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, show_in_directory: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="share_progress">Compartir Progreso Profesional</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                La academia podrá ver estadísticas generales sobre tu progreso laboral
              </p>
            </div>
            <Switch
              id="share_progress"
              checked={settings.share_progress}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, share_progress: checked })
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Configuración
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            💡 <strong>Nota:</strong> Estos ajustes te ayudan a controlar tu privacidad. 
            La academia usa esta información para mejorar sus programas y ayudarte en tu carrera profesional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
