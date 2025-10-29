import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, ExternalLink } from 'lucide-react';

interface HelpLinks {
  help_url: string;
  report_url: string;
  ideas_url: string;
}

const AdminHelpSettings = () => {
  const [links, setLinks] = useState<HelpLinks>({
    help_url: '',
    report_url: '',
    ideas_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHelpLinks();
  }, []);

  const loadHelpLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .eq('category', 'help_links');

      if (error) throw error;

      const linksObj: any = {};
      data?.forEach((setting) => {
        linksObj[setting.key] = setting.value as string;
      });

      setLinks(linksObj as HelpLinks);
    } catch (error: any) {
      console.error('Error loading help links:', error);
      toast.error('Error al cargar los enlaces de ayuda');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { category: 'help_links', key: 'help_url', value: links.help_url },
        { category: 'help_links', key: 'report_url', value: links.report_url },
        { category: 'help_links', key: 'ideas_url', value: links.ideas_url }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({
            ...update,
            value: update.value as any
          }, {
            onConflict: 'category,key'
          });

        if (error) throw error;
      }

      toast.success('Enlaces de ayuda actualizados correctamente');
    } catch (error: any) {
      console.error('Error saving help links:', error);
      toast.error('Error al guardar los enlaces de ayuda');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enlaces de Ayuda y Feedback</CardTitle>
          <CardDescription>
            Configura los enlaces externos que se mostrarán en el modal de ayuda. Los enlaces se abrirán en una nueva pestaña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="help_url">
              <div className="flex items-center gap-2">
                <span>Enlace de Ayuda</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </Label>
            <Input
              id="help_url"
              type="url"
              placeholder="mailto:support@example.com o https://help.example.com"
              value={links.help_url}
              onChange={(e) => setLinks({ ...links, help_url: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              URL para cuando los usuarios necesiten ayuda o soporte
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report_url">
              <div className="flex items-center gap-2">
                <span>Enlace para Reportar Problemas</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </Label>
            <Input
              id="report_url"
              type="url"
              placeholder="mailto:support@example.com o https://report.example.com"
              value={links.report_url}
              onChange={(e) => setLinks({ ...links, report_url: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              URL para reportar errores o problemas técnicos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ideas_url">
              <div className="flex items-center gap-2">
                <span>Enlace para Ideas y Sugerencias</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </Label>
            <Input
              id="ideas_url"
              type="url"
              placeholder="mailto:feedback@example.com o https://ideas.example.com"
              value={links.ideas_url}
              onChange={(e) => setLinks({ ...links, ideas_url: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              URL para recibir ideas y sugerencias de nuevas funcionalidades
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHelpSettings;
