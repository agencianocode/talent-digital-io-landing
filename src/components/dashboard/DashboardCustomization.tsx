import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Download, 
  Building,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  Award
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

export interface DashboardWidget {
  id: string;
  title: string;
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  category: 'metrics' | 'analytics' | 'activity' | 'recommendations';
  requiredPlan?: 'free' | 'basic' | 'premium';
  icon: string;
  description: string;
}

export interface DashboardConfiguration {
  layout: 'grid' | 'list' | 'compact';
  theme: 'light' | 'dark' | 'auto';
  density: 'comfortable' | 'compact' | 'spacious';
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  widgets: Record<string, DashboardWidget>;
  customizations: {
    showWelcomeMessage: boolean;
    showTips: boolean;
    showBanners: boolean;
    primaryMetric: string;
  };
}

const defaultWidgets: Record<string, DashboardWidget> = {
  'total-opportunities': {
    id: 'total-opportunities',
    title: 'Total de Oportunidades',
    enabled: true,
    position: 0,
    size: 'small',
    category: 'metrics',
    icon: 'Briefcase',
    description: 'Número total de oportunidades publicadas'
  },
  'total-applications': {
    id: 'total-applications',
    title: 'Total de Aplicaciones',
    enabled: true,
    position: 1,
    size: 'small',
    category: 'metrics',
    icon: 'Users',
    description: 'Aplicaciones recibidas en total'
  },
  'active-opportunities': {
    id: 'active-opportunities',
    title: 'Oportunidades Activas',
    enabled: true,
    position: 2,
    size: 'small',
    category: 'metrics',
    icon: 'Target',
    description: 'Oportunidades actualmente publicadas'
  },
  'applications-this-month': {
    id: 'applications-this-month',
    title: 'Aplicaciones Este Mes',
    enabled: true,
    position: 3,
    size: 'small',
    category: 'metrics',
    icon: 'TrendingUp',
    description: 'Aplicaciones recibidas este mes'
  },
  'conversion-rate': {
    id: 'conversion-rate',
    title: 'Tasa de Conversión',
    enabled: true,
    position: 4,
    size: 'small',
    category: 'analytics',
    icon: 'Target',
    description: 'Porcentaje de conversión de aplicaciones'
  },
  'contract-type-metrics': {
    id: 'contract-type-metrics',
    title: 'Métricas por Tipo de Contrato',
    enabled: true,
    position: 5,
    size: 'large',
    category: 'analytics',
    requiredPlan: 'basic',
    icon: 'BarChart3',
    description: 'Análisis de aplicaciones por tipo de contrato'
  },
  'skills-demand': {
    id: 'skills-demand',
    title: 'Demanda de Skills',
    enabled: true,
    position: 6,
    size: 'medium',
    category: 'analytics',
    requiredPlan: 'basic',
    icon: 'Award',
    description: 'Habilidades más demandadas en tus oportunidades'
  },
  'salary-analytics': {
    id: 'salary-analytics',
    title: 'Análisis Salarial',
    enabled: false,
    position: 7,
    size: 'medium',
    category: 'analytics',
    requiredPlan: 'premium',
    icon: 'DollarSign',
    description: 'Estadísticas de rangos salariales'
  },
  'top-opportunities': {
    id: 'top-opportunities',
    title: 'Oportunidades Populares',
    enabled: true,
    position: 8,
    size: 'large',
    category: 'activity',
    icon: 'BarChart3',
    description: 'Oportunidades con más aplicaciones'
  },
  'recent-applications': {
    id: 'recent-applications',
    title: 'Aplicaciones Recientes',
    enabled: true,
    position: 9,
    size: 'large',
    category: 'activity',
    icon: 'Calendar',
    description: 'Últimas aplicaciones recibidas'
  },
  'recommended-profiles': {
    id: 'recommended-profiles',
    title: 'Perfiles Recomendados',
    enabled: true,
    position: 10,
    size: 'large',
    category: 'recommendations',
    icon: 'Users',
    description: 'Candidatos recomendados para tus oportunidades'
  }
};

const companyTemplates: Record<string, Partial<DashboardConfiguration>> = {
  startup: {
    layout: 'compact',
    density: 'compact',
    widgets: {
      ...defaultWidgets,
      'salary-analytics': { ...defaultWidgets['salary-analytics'], enabled: false },
      'contract-type-metrics': { ...defaultWidgets['contract-type-metrics'], enabled: false }
    },
    customizations: {
      showWelcomeMessage: true,
      showTips: true,
      showBanners: true,
      primaryMetric: 'total-applications'
    }
  },
  small: {
    layout: 'grid',
    density: 'comfortable',
    customizations: {
      showWelcomeMessage: true,
      showTips: true,
      showBanners: true,
      primaryMetric: 'applications-this-month'
    }
  },
  medium: {
    layout: 'grid',
    density: 'comfortable',
    customizations: {
      showWelcomeMessage: false,
      showTips: false,
      showBanners: true,
      primaryMetric: 'conversion-rate'
    }
  },
  large: {
    layout: 'grid',
    density: 'spacious',
    customizations: {
      showWelcomeMessage: false,
      showTips: false,
      showBanners: false,
      primaryMetric: 'total-opportunities'
    }
  },
  enterprise: {
    layout: 'grid',
    density: 'spacious',
    widgets: {
      ...defaultWidgets,
      'salary-analytics': { ...defaultWidgets['salary-analytics'], enabled: true },
      'contract-type-metrics': { ...defaultWidgets['contract-type-metrics'], enabled: true }
    },
    customizations: {
      showWelcomeMessage: false,
      showTips: false,
      showBanners: false,
      primaryMetric: 'contract-type-metrics'
    }
  }
};

interface DashboardCustomizationProps {
  currentConfig: DashboardConfiguration;
  onConfigChange: (config: DashboardConfiguration) => void;
  metrics?: any;
}

const DashboardCustomization: React.FC<DashboardCustomizationProps> = ({
  currentConfig,
  onConfigChange,
  metrics
}) => {
  const { user } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [tempConfig, setTempConfig] = useState<DashboardConfiguration>(currentConfig);

  const handleApplyTemplate = (companySize: keyof typeof companyTemplates) => {
    const template = companyTemplates[companySize];
    const newConfig: DashboardConfiguration = {
      ...currentConfig,
      ...template,
      companySize: companySize as DashboardConfiguration['companySize'],
      widgets: {
        ...currentConfig.widgets,
        ...template.widgets
      }
    };
    setTempConfig(newConfig);
  };

  const handleWidgetToggle = (widgetId: string) => {
    setTempConfig(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          enabled: !prev.widgets[widgetId].enabled
        }
      }
    }));
  };

  const handleSaveConfiguration = () => {
    onConfigChange(tempConfig);
    setIsCustomizing(false);
    toast.success('Configuración del dashboard guardada');
  };

  const exportDashboardReport = () => {
    if (!metrics) {
      toast.error('No hay datos para exportar');
      return;
    }

    const reportData = {
      company: activeCompany?.name,
      exportDate: new Date().toISOString(),
      period: 'current',
      metrics: {
        totalOpportunities: metrics.totalOpportunities,
        totalApplications: metrics.totalApplications,
        activeOpportunities: metrics.activeOpportunities,
        applicationsThisMonth: metrics.applicationsThisMonth,
        conversionRate: metrics.totalOpportunities > 0 
          ? ((metrics.totalApplications / metrics.totalOpportunities) * 100).toFixed(2)
          : 0,
        averageResponseTime: metrics.averageResponseTime,
        contractTypeMetrics: metrics.contractTypeMetrics,
        skillsDemand: metrics.skillsDemand,
        topOpportunities: metrics.topOpportunities
      }
    };

    // Convert to CSV format
    const csvContent = generateCSVReport(reportData);
    downloadCSV(csvContent, `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast.success('Reporte exportado exitosamente');
  };

  const generateCSVReport = (data: any) => {
    let csv = 'Dashboard Report\n';
    csv += `Company,${data.company}\n`;
    csv += `Export Date,${new Date(data.exportDate).toLocaleDateString()}\n\n`;
    
    // Basic metrics
    csv += 'Metric,Value\n';
    csv += `Total Opportunities,${data.metrics.totalOpportunities}\n`;
    csv += `Total Applications,${data.metrics.totalApplications}\n`;
    csv += `Active Opportunities,${data.metrics.activeOpportunities}\n`;
    csv += `Applications This Month,${data.metrics.applicationsThisMonth}\n`;
    csv += `Conversion Rate,${data.metrics.conversionRate}%\n`;
    csv += `Average Response Time,${data.metrics.averageResponseTime}\n\n`;
    
    // Contract type metrics
    if (data.metrics.contractTypeMetrics) {
      csv += 'Contract Type Metrics\n';
      csv += 'Contract Type,Opportunities,Applications\n';
      Object.entries(data.metrics.contractTypeMetrics).forEach(([type, metrics]: [string, any]) => {
        csv += `${type},${metrics.opportunities},${metrics.applications}\n`;
      });
      csv += '\n';
    }
    
    // Skills demand
    if (data.metrics.skillsDemand && data.metrics.skillsDemand.length > 0) {
      csv += 'Skills Demand\n';
      csv += 'Skill,Applications\n';
      data.metrics.skillsDemand.forEach((skill: any) => {
        csv += `${skill.skill},${skill.applications}\n`;
      });
      csv += '\n';
    }
    
    // Top opportunities
    if (data.metrics.topOpportunities && data.metrics.topOpportunities.length > 0) {
      csv += 'Top Opportunities\n';
      csv += 'Title,Applications,Views\n';
      data.metrics.topOpportunities.forEach((opp: any) => {
        csv += `"${opp.title}",${opp.applications},${opp.views}\n`;
      });
    }
    
    return csv;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getWidgetIcon = (iconName: string) => {
    const icons = {
      Briefcase: Building,
      Users,
      Target,
      TrendingUp,
      BarChart3,
      Calendar,
      DollarSign,
      Award
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Building;
    return <IconComponent className="h-4 w-4" />;
  };

  if (!isCustomizing) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCustomizing(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Personalizar Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportDashboardReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Personalización del Dashboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configura tu dashboard según las necesidades de tu empresa
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Size Templates */}
        <div className="space-y-4">
          <h4 className="font-medium">Plantillas por Tamaño de Empresa</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.keys(companyTemplates).map((size) => (
              <Button
                key={size}
                variant={tempConfig.companySize === size ? "default" : "outline"}
                size="sm"
                onClick={() => handleApplyTemplate(size as keyof typeof companyTemplates)}
                className="capitalize"
              >
                {size === 'startup' ? 'Startup' :
                 size === 'small' ? 'Pequeña' :
                 size === 'medium' ? 'Mediana' :
                 size === 'large' ? 'Grande' : 'Enterprise'}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Layout Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Configuración de Diseño</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Diseño</Label>
              <Select
                value={tempConfig.layout}
                onValueChange={(value: 'grid' | 'list' | 'compact') => 
                  setTempConfig(prev => ({ ...prev, layout: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Cuadrícula</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                  <SelectItem value="compact">Compacto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Densidad</Label>
              <Select
                value={tempConfig.density}
                onValueChange={(value: 'comfortable' | 'compact' | 'spacious') => 
                  setTempConfig(prev => ({ ...prev, density: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="comfortable">Cómodo</SelectItem>
                  <SelectItem value="spacious">Espacioso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actualización automática</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={tempConfig.autoRefresh}
                  onCheckedChange={(checked) => 
                    setTempConfig(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {tempConfig.autoRefresh ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Widgets Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Widgets del Dashboard</h4>
          <div className="space-y-3">
            {Object.values(tempConfig.widgets)
              .sort((a, b) => a.position - b.position)
              .map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {getWidgetIcon(widget.icon)}
                    <div>
                      <div className="font-medium text-sm">{widget.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {widget.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {widget.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {widget.size}
                        </Badge>
                        {widget.requiredPlan && (
                          <Badge variant="secondary" className="text-xs">
                            {widget.requiredPlan}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {widget.enabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={() => handleWidgetToggle(widget.id)}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setTempConfig(currentConfig);
              setIsCustomizing(false);
            }}
          >
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setTempConfig({ 
                ...currentConfig, 
                widgets: defaultWidgets,
                layout: 'grid',
                density: 'comfortable'
              })}
            >
              Restaurar Predeterminado
            </Button>
            <Button onClick={handleSaveConfiguration}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCustomization;