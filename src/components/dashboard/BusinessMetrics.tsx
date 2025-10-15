import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  MessageCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useOpportunityDashboard } from '@/hooks/useOpportunityDashboard';
import { useNavigate } from 'react-router-dom';

interface BusinessMetricsProps {
  useMockData?: boolean;
}

export const BusinessMetrics = ({ useMockData = false }: BusinessMetricsProps) => {
  const { metrics, isLoading } = useOpportunityDashboard(useMockData);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/business-dashboard/opportunities')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">Oportunidades Activas</div>
            <div className="text-2xl font-bold">{metrics.activeOpportunities}</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/business-dashboard/applications')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">Postulaciones en Oportunidades Activas</div>
            <div className="text-2xl font-bold">{metrics.applicationsInActiveOpportunities || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.unreviewedApplications || 0} sin revisar / {metrics.applicationsInActiveOpportunities || 0} totales
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/business-dashboard/applications?filter=pending')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="text-sm text-muted-foreground">Candidatos en Evaluación</div>
            <div className="text-2xl font-bold">{metrics.candidatesInEvaluation || 0}</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/business-dashboard/messages')}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">Candidatos Contactados</div>
            <div className="text-2xl font-bold">{metrics.candidatesContacted || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total de Postulaciones</div>
                <div className="text-xl font-bold">{metrics.totalApplications}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Promedio de Tiempo de Respuesta</div>
                <div className="text-xl font-bold">{metrics.averageResponseTime || '0h'}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Postulaciones Este Mes</div>
                <div className="text-xl font-bold">{metrics.applicationsThisMonth || 0}</div>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Rendimiento por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tecnología</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Marketing</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-sm font-medium">72%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Diseño</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <span className="text-sm font-medium">68%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Tendencias de Aplicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Esta semana</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+{metrics.thisWeekApplications}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mes anterior</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">+8%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Promedio mensual</span>
                <span className="text-sm font-medium">{Math.floor(metrics.totalApplications / 2)} aplicaciones</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tasa de conversión</span>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.conversionRate} className="h-2 w-16" />
                  <span className="text-sm font-medium">{metrics.conversionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};