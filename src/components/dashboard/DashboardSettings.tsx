import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Settings, 
  Layout, 
  Eye,
  EyeOff,
  Save,
  RotateCcw
} from 'lucide-react';

interface DashboardSettingsProps {
  onSave: (settings: DashboardSettings) => void;
  currentSettings: DashboardSettings;
}

export interface DashboardSettings {
  layout: 'grid' | 'list' | 'compact';
  theme: 'light' | 'dark' | 'system';
  showTrends: boolean;
  showIcons: boolean;
  refreshInterval: number;
  widgets: {
    [key: string]: {
      enabled: boolean;
      position: number;
    };
  };
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<DashboardSettings>(currentSettings);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave(settings);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSettings(currentSettings);
  };

  const updateWidget = (widgetId: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: prev.widgets[widgetId]
          ? { ...prev.widgets[widgetId], enabled }
          : { enabled, position: Object.keys(prev.widgets).length }
      }
    }));
  };

  const availableWidgets = [
    { id: 'total-opportunities', name: 'Total Oportunidades' },
    { id: 'total-applications', name: 'Total Aplicaciones' },
    { id: 'applications-this-month', name: 'Aplicaciones Este Mes' },
    { id: 'conversion-rate', name: 'Tasa de Conversión' },
    { id: 'top-opportunities', name: 'Oportunidades Más Populares' },
    { id: 'recent-applications', name: 'Aplicaciones Recientes' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Layout className="h-5 w-5" />
            Configuración del Dashboard
          </DialogTitle>
          <DialogDescription className="text-sm">
            Personaliza la apariencia y funcionalidad de tu dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Diseño</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label>Layout</Label>
                <Select 
                  value={settings.layout} 
                  onValueChange={(value: 'grid' | 'list' | 'compact') => 
                    setSettings(prev => ({ ...prev, layout: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid (Cuadrícula)</SelectItem>
                    <SelectItem value="list">Lista</SelectItem>
                    <SelectItem value="compact">Compacto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tema</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    setSettings(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Visualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <Label>Mostrar tendencias</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Muestra flechas de crecimiento en las métricas
                  </p>
                </div>
                <Switch
                  checked={settings.showTrends}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, showTrends: checked }))
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <Label>Mostrar iconos</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Muestra iconos en las tarjetas de métricas
                  </p>
                </div>
                <Switch
                  checked={settings.showIcons}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, showIcons: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Intervalo de actualización</Label>
                <Select 
                  value={settings.refreshInterval.toString()} 
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, refreshInterval: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Manual</SelectItem>
                    <SelectItem value="30000">30 segundos</SelectItem>
                    <SelectItem value="60000">1 minuto</SelectItem>
                    <SelectItem value="300000">5 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Widget Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Widgets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecciona qué widgets quieres mostrar en tu dashboard
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {availableWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {settings.widgets[widget.id]?.enabled ? (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{widget.name}</span>
                    </div>
                    <Switch
                      checked={settings.widgets[widget.id]?.enabled ?? true}
                      onCheckedChange={(checked) => updateWidget(widget.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardSettings; 