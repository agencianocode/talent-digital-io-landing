import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Heart, 
  Eye, 
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  ArrowUpRight
} from 'lucide-react';

interface TalentMetricsProps {
  totalApplications: number;
  acceptedApplications: number;
  pendingApplications: number;
  savedOpportunities: number;
  profileViews: number;
  profileCompletion: number;
  recentApplications: Array<{
    id: string;
    opportunityTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
  }>;
  recommendedOpportunities: Array<{
    id: string;
    title: string;
    companyName: string;
    matchScore: number;
    salary: string;
  }>;
}

const TalentMetrics: React.FC<TalentMetricsProps> = ({
  totalApplications,
  acceptedApplications,
  pendingApplications,
  savedOpportunities,
  profileViews,
  profileCompletion,
  recentApplications,
  recommendedOpportunities
}) => {
  const acceptanceRate = totalApplications > 0 
    ? ((acceptedApplications / totalApplications) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aplicaciones</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {pendingApplications} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aceptación</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {acceptedApplications} aceptadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Guardadas</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              Para revisar más tarde
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistas del Perfil</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileViews}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              Este mes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso del perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progreso del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completitud del perfil</span>
              <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="w-full" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Información básica</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Experiencia laboral</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Educación</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span>Habilidades</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aplicaciones recientes y oportunidades recomendadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{application.opportunityTitle}</p>
                    <p className="text-xs text-muted-foreground">{application.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(application.appliedAt).toLocaleDateString()}
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Oportunidades Recomendadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Oportunidades Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{opportunity.title}</p>
                    <p className="text-xs text-muted-foreground">{opportunity.companyName}</p>
                    <p className="text-xs text-muted-foreground">{opportunity.salary}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {opportunity.matchScore}% match
                    </Badge>
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${opportunity.matchScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TalentMetrics; 