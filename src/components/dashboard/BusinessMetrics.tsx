import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Eye, 
  Calendar,
  Briefcase,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface BusinessMetricsProps {
  totalOpportunities: number;
  totalApplications: number;
  activeOpportunities: number;
  pendingApplications: number;
  applicationsThisMonth: number;
  applicationsLastMonth: number;
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
  activeOpportunities,
  pendingApplications,
  applicationsThisMonth,
  applicationsLastMonth,
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
            <CardTitle className="text-sm font-medium">Total Oportunidades</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {activeOpportunities} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aplicaciones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {isGrowthPositive ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              {growthPercentage}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aplicaciones Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {pendingApplications} pendientes
            </p>
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
                  <Badge variant="secondary">
                    {opportunity.applications > 0 
                      ? ((opportunity.applications / opportunity.views) * 100).toFixed(1)
                      : 0}%
                  </Badge>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aplicaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
                      <div className="space-y-4">
            {recentApplications && recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{application.applicantName}</p>
                    <p className="text-xs text-muted-foreground">{application.opportunityTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      application.status === 'pending' ? 'secondary' :
                      application.status === 'accepted' ? 'default' :
                      application.status === 'rejected' ? 'destructive' : 'outline'
                    }
                  >
                    {application.status === 'pending' ? 'Pendiente' :
                     application.status === 'accepted' ? 'Aceptada' :
                     application.status === 'rejected' ? 'Rechazada' : application.status}
                  </Badge>
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