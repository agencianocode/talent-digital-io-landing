import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCustomization } from '@/hooks/useAdminCustomization';
import { Loader2, Save, Palette, Layout, Settings, Eye } from 'lucide-react';
import { useState } from 'react';

const AdminCustomizationSettings = () => {
  const { customization, loading, saving, updateCustomization } = useAdminCustomization();
  const [localChanges, setLocalChanges] = useState<any>({});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!customization) return null;

  const handleSave = async () => {
    await updateCustomization(localChanges);
    setLocalChanges({});
  };

  const getValue = (key: keyof typeof customization) => {
    return localChanges[key] !== undefined ? localChanges[key] : customization[key];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalización del Panel</h2>
          <p className="text-muted-foreground">Configura la apariencia y funcionalidades</p>
        </div>
        <Button onClick={handleSave} disabled={saving || Object.keys(localChanges).length === 0}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visual"><Palette className="mr-2 h-4 w-4" />Visual</TabsTrigger>
          <TabsTrigger value="content"><Eye className="mr-2 h-4 w-4" />Contenido</TabsTrigger>
          <TabsTrigger value="widgets"><Layout className="mr-2 h-4 w-4" />Widgets</TabsTrigger>
          <TabsTrigger value="features"><Settings className="mr-2 h-4 w-4" />Funciones</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza los colores y logo de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Plataforma</Label>
                <Input
                  value={getValue('platform_name')}
                  onChange={(e) => setLocalChanges({...localChanges, platform_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>URL del Logo</Label>
                <Input
                  value={getValue('platform_logo_url') || ''}
                  onChange={(e) => setLocalChanges({...localChanges, platform_logo_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color Primario</Label>
                  <Input
                    type="color"
                    value={getValue('primary_color')}
                    onChange={(e) => setLocalChanges({...localChanges, primary_color: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Secundario</Label>
                  <Input
                    type="color"
                    value={getValue('secondary_color')}
                    onChange={(e) => setLocalChanges({...localChanges, secondary_color: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Plataforma</CardTitle>
              <CardDescription>Configura textos y datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mensaje de Bienvenida</Label>
                <Textarea
                  value={getValue('welcome_message') || ''}
                  onChange={(e) => setLocalChanges({...localChanges, welcome_message: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción de la Plataforma</Label>
                <Textarea
                  value={getValue('platform_description') || ''}
                  onChange={(e) => setLocalChanges({...localChanges, platform_description: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email de Contacto</Label>
                  <Input
                    type="email"
                    value={getValue('contact_email') || ''}
                    onChange={(e) => setLocalChanges({...localChanges, contact_email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono de Contacto</Label>
                  <Input
                    value={getValue('contact_phone') || ''}
                    onChange={(e) => setLocalChanges({...localChanges, contact_phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL de Soporte</Label>
                <Input
                  value={getValue('support_url') || ''}
                  onChange={(e) => setLocalChanges({...localChanges, support_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widgets del Dashboard</CardTitle>
              <CardDescription>Controla qué elementos se muestran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'show_stats_cards', label: 'Tarjetas de Estadísticas', desc: 'Muestra métricas principales' },
                { key: 'show_charts', label: 'Gráficos', desc: 'Visualizaciones de datos' },
                { key: 'show_activity_feed', label: 'Feed de Actividad', desc: 'Actividad reciente de la plataforma' },
                { key: 'show_quick_actions', label: 'Acciones Rápidas', desc: 'Botones de acceso rápido' },
                { key: 'show_registration_links', label: 'Links de Registro', desc: 'Enlaces de registro para compartir' }
              ].map((widget) => (
                <div key={widget.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{widget.label}</Label>
                    <p className="text-sm text-muted-foreground">{widget.desc}</p>
                  </div>
                  <Switch
                    checked={getValue(widget.key as any)}
                    onCheckedChange={(checked) => setLocalChanges({...localChanges, [widget.key]: checked})}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades</CardTitle>
              <CardDescription>Activa o desactiva características del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'enable_marketplace', label: 'Marketplace', desc: 'Sistema de servicios' },
                { key: 'enable_academy_features', label: 'Características de Academia', desc: 'Gestión de estudiantes' },
                { key: 'enable_notifications', label: 'Notificaciones', desc: 'Sistema de notificaciones' },
                { key: 'enable_chat', label: 'Chat', desc: 'Mensajería entre usuarios' }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{feature.label}</Label>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                  <Switch
                    checked={getValue(feature.key as any)}
                    onCheckedChange={(checked) => setLocalChanges({...localChanges, [feature.key]: checked})}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCustomizationSettings;
