import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Eye, 
  Calendar,
  Briefcase,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  AlertCircle
} from 'lucide-react';

interface BusinessMetricsProps {
  totalOpportunities: number;
  totalApplications: number;
  applicationsInActiveOpportunities: number;
  activeOpportunities: number;
  pendingApplications: number;
  unreviewedApplications: number;
  applicationsThisMonth: number;
  applicationsLastMonth: number;
  averageResponseTime: string;
  candidatesContacted: number;
  candidatesInEvaluation: number;
  topOpportunities: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
  }>;
  recentApplications: Array<{
    id: string;
    opportunityTitle: string;
    applicantName: string;
    status: string;
    createdAt: string;
  }>;
}

const BusinessMetrics: React.FC<BusinessMetricsProps> = ({
  totalOpportunities,
  totalApplications,
  applicationsInActiveOpportunities,
  activeOpportunities,
  pendingApplications,
  unreviewedApplications,
  applicationsThisMonth,
  applicationsLastMonth,
  averageResponseTime,
  candidatesContacted,
  candidatesInEvaluation,
  topOpportunities,
  recentApplications
}) => {
  const applicationGrowth = applicationsThisMonth - applicationsLastMonth;
  const growthPercentage = applicationsLastMonth > 0 
    ? ((applicationGrowth / applicationsLastMonth) * 100).toFixed(1)
    : 0;

  const isGrowthPositive = applicationGrowth >= 0;

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Activas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {totalOpportunities} publicadas en total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Postulaciones Recibidas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsInActiveOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {unreviewedApplications} sin revisar
            </p>
          </CardContent>
        </Card>

        <Card className={unreviewedApplications > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Aplicaciones Este Mes
              {unreviewedApplications > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  <Bell className="h-3 w-3 mr-1" />
                  {unreviewedApplications} nuevas
                </Badge>
              )}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsThisMonth}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {unreviewedApplications} sin revisar
              </p>
              {unreviewedApplications > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => window.open('/business-dashboard/applications?status=pending', '_blank')}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Revisar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOpportunities > 0 ? ((totalApplications / totalOpportunities) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Aplicaciones por oportunidad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen detallado */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Postulaciones en oportunidades activas</span>
                <span className="font-bold">{applicationsInActiveOpportunities}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Oportunidades activas</span>
                <span className="font-bold">{activeOpportunities}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Promedio de tiempo para responder</span>
                <span className="font-bold">{averageResponseTime}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Candidatos contactados</span>
                <span className="font-bold">{candidatesContacted}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{candidatesInEvaluation}</div>
                  <div className="text-sm text-muted-foreground">Candidatos en evaluación</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">Conversión actual</div>
                <div className="text-lg font-semibold">
                  {totalOpportunities > 0 ? ((totalApplications / totalOpportunities) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top oportunidades y aplicaciones recientes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Oportunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Oportunidades Más Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOpportunities && topOpportunities.length > 0 ? (
                topOpportunities.map((opportunity, index) => (
                  <div key={opportunity.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{opportunity.title}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {opportunity.applications} aplicaciones
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {opportunity.views} vistas
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/business-dashboard/applications?opportunity=${opportunity.id}`, '_blank')}
                      >
                        Ver Postulantes
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay oportunidades con aplicaciones aún</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aplicaciones Recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aplicaciones Recientes
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('/business-dashboard/applications', '_blank')}
            >
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{application.applicantName}</p>
                      <p className="text-xs text-muted-foreground">{application.opportunityTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          application.status === 'pending' ? 'secondary' :
                          application.status === 'accepted' ? 'default' :
                          application.status === 'rejected' ? 'destructive' : 'outline'
                        }
                        className={application.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                      >
                        {application.status === 'pending' ? 'Pendiente' :
                         application.status === 'accepted' ? 'Aceptada' :
                         application.status === 'rejected' ? 'Rechazada' : application.status}
                      </Badge>
                      {application.status === 'pending' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => window.open(`/business-dashboard/applications?application=${application.id}`, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay aplicaciones recientes</p>
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessMetrics; 