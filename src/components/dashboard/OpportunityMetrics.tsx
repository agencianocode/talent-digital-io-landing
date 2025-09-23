import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Users, 
  Clock, 
  TrendingUp, 
  Eye, 
  MessageCircle,
  AlertCircle 
} from 'lucide-react';
import { useOpportunityDashboard } from '@/hooks/useOpportunityDashboard';


interface OpportunityMetricsProps {
  useMockData?: boolean;
}

export const OpportunityMetrics = ({ useMockData = true }: OpportunityMetricsProps) => {
  const { metrics, isLoading } = useOpportunityDashboard(useMockData);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Oportunidades Activas</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.activeOpportunities}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Postulaciones</p>
                <p className="text-3xl font-bold text-green-900">{metrics.totalApplications}</p>
                <p className="text-xs text-green-600">+{metrics.thisWeekApplications} esta semana</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Sin Revisar</p>
                <p className="text-3xl font-bold text-orange-900">{metrics.unreadApplications}</p>
                {metrics.unreadApplications > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Requiere atención
                  </Badge>
                )}
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">En Evaluación</p>
                <p className="text-3xl font-bold text-purple-900">{metrics.candidatesInEvaluation}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Tiempo de Respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Promedio</span>
                  <span className="text-2xl font-bold">{metrics.averageResponseTime} días</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Mejor que el 75% de empresas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Candidatos Contactados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-2xl font-bold">{metrics.contactedCandidates}</span>
                </div>
                <Progress 
                  value={metrics.totalApplications ? (metrics.contactedCandidates / metrics.totalApplications) * 100 : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.conversionRate}% de tasa de contacto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tasa de conversión</span>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.conversionRate} className="h-2 w-16" />
                  <span className="text-sm font-medium">{metrics.conversionRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Actividad semanal</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">+{metrics.thisWeekApplications}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
