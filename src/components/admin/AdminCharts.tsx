import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Building, Briefcase } from 'lucide-react';

interface ChartData {
  date: string;
  users: number;
  companies: number;
  opportunities: number;
  applications: number;
}

interface AdminChartsProps {
  chartData: ChartData[];
  isLoading?: boolean;
}

const AdminCharts: React.FC<AdminChartsProps> = ({ chartData, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Simple chart implementation (in a real app, you'd use a charting library like recharts)
  const renderSimpleChart = (data: ChartData[], key: keyof Omit<ChartData, 'date'>, title: string, color: string) => {
    const maxValue = Math.max(...data.map(d => d[key] as number));
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="flex items-end gap-1 h-32">
          {data.slice(-7).map((item, index) => {
            const value = item[key] as number;
            const height = (value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full rounded-t"
                  style={{ 
                    height: `${height}%`, 
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                  title={`${new Date(item.date).toLocaleDateString()}: ${value}`}
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(item.date).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crecimiento de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crecimiento de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            renderSimpleChart(chartData, 'users', 'Nuevos Usuarios', '#10b981')
          )}
        </CardContent>
      </Card>

      {/* Crecimiento de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Crecimiento de Empresas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            renderSimpleChart(chartData, 'companies', 'Nuevas Empresas', '#3b82f6')
          )}
        </CardContent>
      </Card>

      {/* Oportunidades Publicadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Oportunidades Publicadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            renderSimpleChart(chartData, 'opportunities', 'Nuevas Oportunidades', '#8b5cf6')
          )}
        </CardContent>
      </Card>

      {/* Aplicaciones Recibidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aplicaciones Recibidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            renderSimpleChart(chartData, 'applications', 'Nuevas Aplicaciones', '#f59e0b')
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
