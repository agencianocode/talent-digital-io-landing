import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase,
  Calendar,
  Filter
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportFilters {
  dateRange: 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  includeMetrics: string[];
  format: 'csv' | 'pdf' | 'json';
  groupBy: 'day' | 'week' | 'month';
}

interface AnalyticsExportProps {
  metrics?: any;
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = ({ metrics }) => {
  const { user } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'last_month',
    includeMetrics: ['applications', 'opportunities', 'contract_types', 'skills'],
    format: 'csv',
    groupBy: 'week'
  });

  const availableMetrics = [
    { id: 'applications', label: 'Aplicaciones', icon: Users },
    { id: 'opportunities', label: 'Oportunidades', icon: Briefcase },
    { id: 'contract_types', label: 'Tipos de Contrato', icon: BarChart3 },
    { id: 'skills', label: 'Demanda de Skills', icon: TrendingUp },
    { id: 'salary_ranges', label: 'Rangos Salariales', icon: BarChart3 },
    { id: 'response_times', label: 'Tiempos de Respuesta', icon: Calendar },
    { id: 'conversion_rates', label: 'Tasas de Conversión', icon: TrendingUp }
  ];

  const getDateRange = () => {
    const now = new Date();
    switch (filters.dateRange) {
      case 'last_week':
        return { start: subDays(now, 7), end: now };
      case 'last_month':
        return { start: subMonths(now, 1), end: now };
      case 'last_quarter':
        return { start: subMonths(now, 3), end: now };
      case 'last_year':
        return { start: subMonths(now, 12), end: now };
      case 'custom':
        return { 
          start: filters.startDate || subMonths(now, 1), 
          end: filters.endDate || now 
        };
      default:
        return { start: subMonths(now, 1), end: now };
    }
  };

  const fetchDetailedAnalytics = async () => {
    if (!activeCompany?.id) return null;

    const { start, end } = getDateRange();

    try {
      // Fetch detailed data based on selected metrics
      const promises = [];

      if (filters.includeMetrics.includes('applications')) {
        promises.push(
          supabase
            .from('applications')
            .select(`
              id, status, created_at, updated_at,
              opportunities!inner(title, company_id, contract_type, category)
            `)
            .eq('opportunities.company_id', activeCompany.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
        );
      }

      if (filters.includeMetrics.includes('opportunities')) {
        promises.push(
          supabase
            .from('opportunities')
            .select('*')
            .eq('company_id', activeCompany.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
        );
      }

      const results = await Promise.all(promises);
      return {
        applications: filters.includeMetrics.includes('applications') ? results[0]?.data || [] : [],
        opportunities: filters.includeMetrics.includes('opportunities') ? 
          (results[filters.includeMetrics.includes('applications') ? 1 : 0]?.data || []) : []
      };
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      return null;
    }
  };

  const generateCSVReport = (data: any) => {
    let csv = `Analytics Report - ${activeCompany?.name}\n`;
    csv += `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}\n`;
    csv += `Period: ${format(getDateRange().start, 'dd/MM/yyyy', { locale: es })} - ${format(getDateRange().end, 'dd/MM/yyyy', { locale: es })}\n\n`;

    // Summary metrics
    if (metrics) {
      csv += 'RESUMEN EJECUTIVO\n';
      csv += 'Métrica,Valor\n';
      csv += `Total Oportunidades,${metrics.totalOpportunities || 0}\n`;
      csv += `Oportunidades Activas,${metrics.activeOpportunities || 0}\n`;
      csv += `Total Aplicaciones,${metrics.totalApplications || 0}\n`;
      csv += `Aplicaciones Este Mes,${metrics.applicationsThisMonth || 0}\n`;
      csv += `Tiempo Promedio Respuesta,${metrics.averageResponseTime || 'N/A'}\n`;
      csv += `Candidatos Contactados,${metrics.candidatesContacted || 0}\n\n`;
    }

    // Applications data
    if (filters.includeMetrics.includes('applications') && data.applications) {
      csv += 'APLICACIONES DETALLADAS\n';
      csv += 'ID,Fecha,Estado,Oportunidad,Tipo Contrato,Categoría\n';
      data.applications.forEach((app: any) => {
        csv += `${app.id},${format(new Date(app.created_at), 'dd/MM/yyyy', { locale: es })},${app.status},"${app.opportunities?.title || 'N/A'}",${app.opportunities?.contract_type || 'N/A'},${app.opportunities?.category || 'N/A'}\n`;
      });
      csv += '\n';
    }

    // Contract type analysis
    if (filters.includeMetrics.includes('contract_types') && metrics?.contractTypeMetrics) {
      csv += 'ANÁLISIS POR TIPO DE CONTRATO\n';
      csv += 'Tipo,Oportunidades,Aplicaciones,Ratio\n';
      Object.entries(metrics.contractTypeMetrics).forEach(([type, data]: [string, any]) => {
        const ratio = data.opportunities > 0 ? (data.applications / data.opportunities).toFixed(2) : '0';
        csv += `${type},${data.opportunities},${data.applications},${ratio}\n`;
      });
      csv += '\n';
    }

    // Skills demand
    if (filters.includeMetrics.includes('skills') && metrics?.skillsDemand) {
      csv += 'DEMANDA DE SKILLS\n';
      csv += 'Skill,Aplicaciones\n';
      metrics.skillsDemand.forEach((skill: any) => {
        csv += `${skill.skill},${skill.applications}\n`;
      });
      csv += '\n';
    }

    // Salary analysis
    if (filters.includeMetrics.includes('salary_ranges') && metrics?.salaryRanges) {
      csv += 'ANÁLISIS SALARIAL\n';
      csv += 'Rango Mínimo,Rango Máximo,Moneda,Aplicaciones\n';
      metrics.salaryRanges.forEach((range: any) => {
        csv += `${range.min},${range.max},${range.currency},${range.applications}\n`;
      });
      csv += '\n';
    }

    return csv;
  };

  const generateJSONReport = (data: any) => {
    const { start, end } = getDateRange();
    
    return JSON.stringify({
      report: {
        company: activeCompany?.name,
        generatedAt: new Date().toISOString(),
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          range: filters.dateRange
        },
        filters: filters.includeMetrics,
        summary: metrics ? {
          totalOpportunities: metrics.totalOpportunities,
          activeOpportunities: metrics.activeOpportunities,
          totalApplications: metrics.totalApplications,
          applicationsThisMonth: metrics.applicationsThisMonth,
          averageResponseTime: metrics.averageResponseTime,
          candidatesContacted: metrics.candidatesContacted,
          conversionRate: metrics.totalOpportunities > 0 
            ? ((metrics.totalApplications / metrics.totalOpportunities) * 100).toFixed(2)
            : 0
        } : {},
        detailedData: {
          applications: data.applications || [],
          opportunities: data.opportunities || [],
          contractTypeMetrics: metrics?.contractTypeMetrics || {},
          skillsDemand: metrics?.skillsDemand || [],
          salaryAnalysis: {
            ranges: metrics?.salaryRanges || [],
            average: metrics?.averageSalary || 0
          }
        }
      }
    }, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!activeCompany?.id) {
      toast.error('No hay empresa seleccionada');
      return;
    }

    if (filters.includeMetrics.length === 0) {
      toast.error('Selecciona al menos una métrica para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const detailedData = await fetchDetailedAnalytics();
      
      if (!detailedData) {
        toast.error('Error al obtener los datos');
        return;
      }

      const { start, end } = getDateRange();
      const dateStr = `${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}`;
      
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (filters.format) {
        case 'csv':
          content = generateCSVReport(detailedData);
          filename = `analytics_${activeCompany.name}_${dateStr}.csv`;
          mimeType = 'text/csv;charset=utf-8;';
          break;
        case 'json':
          content = generateJSONReport(detailedData);
          filename = `analytics_${activeCompany.name}_${dateStr}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;
        default:
          throw new Error('Formato no soportado');
      }

      downloadFile(content, filename, mimeType);
      toast.success('Reporte exportado exitosamente');

      // Track export analytics
      console.log('Analytics Export:', {
        companyId: activeCompany.id,
        userId: user?.id,
        format: filters.format,
        metrics: filters.includeMetrics,
        dateRange: filters.dateRange,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Genera reportes detallados de las métricas de tu empresa
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Selection */}
        <div className="space-y-3">
          <h4 className="font-medium">Período de Análisis</h4>
          <Select
            value={filters.dateRange}
            onValueChange={(value: ReportFilters['dateRange']) => 
              setFilters(prev => ({ ...prev, dateRange: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_week">Última semana</SelectItem>
              <SelectItem value="last_month">Último mes</SelectItem>
              <SelectItem value="last_quarter">Último trimestre</SelectItem>
              <SelectItem value="last_year">Último año</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha inicio</label>
                <DatePicker
                  selected={filters.startDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha fin</label>
                <DatePicker
                  selected={filters.endDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Metrics Selection */}
        <div className="space-y-3">
          <h4 className="font-medium">Métricas a Incluir</h4>
          <div className="grid grid-cols-1 gap-3">
            {availableMetrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <div key={metric.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={metric.id}
                    checked={filters.includeMetrics.includes(metric.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters(prev => ({
                          ...prev,
                          includeMetrics: [...prev.includeMetrics, metric.id]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          includeMetrics: prev.includeMetrics.filter(m => m !== metric.id)
                        }));
                      }
                    }}
                  />
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor={metric.id} className="text-sm font-medium cursor-pointer">
                    {metric.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Format and Options */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Formato</h4>
              <Select
                value={filters.format}
                onValueChange={(value: ReportFilters['format']) => 
                  setFilters(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="json">JSON (Datos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Agrupar por</h4>
              <Select
                value={filters.groupBy}
                onValueChange={(value: ReportFilters['groupBy']) => 
                  setFilters(prev => ({ ...prev, groupBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Día</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium text-sm">Vista Previa del Reporte</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Período: {format(getDateRange().start, 'dd/MM/yyyy', { locale: es })} - {format(getDateRange().end, 'dd/MM/yyyy', { locale: es })}</p>
            <p>• Métricas: {filters.includeMetrics.length} seleccionadas</p>
            <p>• Formato: {filters.format.toUpperCase()}</p>
            <p>• Agrupación: Por {filters.groupBy}</p>
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport}
          disabled={isExporting || filters.includeMetrics.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generando reporte...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExport;