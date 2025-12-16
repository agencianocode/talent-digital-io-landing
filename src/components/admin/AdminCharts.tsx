import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Building, Briefcase } from 'lucide-react';

interface ChartData {
  date: string;
  users: number;
  companies: number;
  opportunities: number;
  applications: number;
  activeUsers: number;
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
    const values = data.map(d => d[key] as number);
    const maxValue = Math.max(...values, 1); // Ensure at least 1 to avoid division by 0
    const totalValue = values.reduce((sum, v) => sum + v, 0);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{title}</h4>
          <span className="text-xl font-bold" style={{ color }}>
            {totalValue}
          </span>
        </div>
        <div className="flex items-end gap-1 h-32 bg-muted/20 p-2 rounded-lg">
          {data.slice(-7).map((item, index) => {
            const value = item[key] as number;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const displayHeight = height > 0 ? Math.max(height, 8) : 0; // Ensure visible bars
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1 relative group">
                <div className="relative w-full flex items-end justify-center h-24">
                  {value > 0 && (
                    <>
                      <div 
                        className="w-full rounded-t transition-all duration-200 group-hover:opacity-80"
                        style={{ 
                          height: `${displayHeight}%`, 
                          backgroundColor: color,
                          minHeight: '8px'
                        }}
                      />
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {value} {value === 1 ? title.slice(0, -1) : title}
                      </div>
                    </>
                  )}
                  {value === 0 && (
                    <div className="w-full h-1 bg-muted rounded" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.date + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}
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

      {/* Usuarios Activos por Mes */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Activos por Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            renderSimpleChart(chartData, 'activeUsers', 'Usuarios Activos', '#06b6d4')
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
