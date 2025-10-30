import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCustomization } from '@/hooks/useAdminCustomization';
import { Loader2, Save, Layout, Settings } from 'lucide-react';
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

      <Tabs defaultValue="widgets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="widgets"><Layout className="mr-2 h-4 w-4" />Widgets Dashboard</TabsTrigger>
          <TabsTrigger value="sidebar"><Settings className="mr-2 h-4 w-4" />Menú Lateral</TabsTrigger>
        </TabsList>


        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widgets del Dashboard</CardTitle>
              <CardDescription>Controla qué elementos se muestran en el dashboard principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'show_stats_cards', label: 'Tarjetas de Estadísticas', desc: 'Muestra métricas principales del sistema' },
                { key: 'show_charts', label: 'Gráficos', desc: 'Visualizaciones de datos y tendencias' },
                { key: 'show_activity_feed', label: 'Feed de Actividad', desc: 'Actividad reciente de la plataforma' },
                { key: 'show_quick_actions', label: 'Acciones Rápidas', desc: 'Botones de acceso rápido a funciones' },
                { key: 'show_registration_links', label: 'Links de Registro', desc: 'Enlaces de registro para compartir' }
              ].map((widget) => (
                <div key={widget.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">{widget.label}</Label>
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

        <TabsContent value="sidebar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Elementos del Menú Lateral</CardTitle>
              <CardDescription>Controla qué opciones aparecen en el sidebar del panel administrativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'show_dashboard', label: '📊 Dashboard', desc: 'Vista general del panel' },
                { key: 'show_upgrade_requests', label: '✅ Solicitudes Upgrade', desc: 'Gestión de solicitudes de actualización' },
                { key: 'show_users', label: '👥 Usuarios', desc: 'Gestión de usuarios del sistema' },
                { key: 'show_companies', label: '🏢 Empresas', desc: 'Gestión de empresas registradas' },
                { key: 'show_opportunities', label: '💼 Oportunidades', desc: 'Moderación de oportunidades publicadas' },
                { key: 'show_marketplace_menu', label: '🛍️ Marketplace', desc: 'Gestión del marketplace de servicios' },
                { key: 'show_chat', label: '💬 Mensajes', desc: 'Sistema de mensajería administrativa' },
                { key: 'show_notifications', label: '🔔 Notificaciones', desc: 'Centro de notificaciones' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={getValue(item.key as any)}
                    onCheckedChange={(checked) => setLocalChanges({...localChanges, [item.key]: checked})}
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
