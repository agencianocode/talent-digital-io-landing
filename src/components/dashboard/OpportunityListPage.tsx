import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Star } from 'lucide-react';
import { OpportunityList } from './OpportunityList';
import { useProfileProgress } from '@/hooks/useProfileProgress';
import { useCompany } from '@/contexts/CompanyContext';

export const OpportunityListPage = () => {
  const navigate = useNavigate();
  const { getCompletionPercentage } = useProfileProgress();
  const { canCreateOpportunities } = useCompany();

  const handleApplicationsView = (opportunityId: string) => {
    console.log('🔍 Navigating to applicants for opportunity:', opportunityId);
    navigate(`/business-dashboard/opportunities/${opportunityId}/applicants`);
  };

  const handleCreateOpportunity = () => {
    navigate('/business-dashboard/opportunities/new');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Oportunidades Publicadas
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona y monitorea todas tus oportunidades de trabajo
          </p>
        </div>
        
        {canCreateOpportunities() && (
          <div className="flex gap-3">
            <Button onClick={handleCreateOpportunity} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Publicar Oportunidad
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats Banner - Only show if profile is not 100% complete */}
      {getCompletionPercentage() < 100 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ¡Impulsa tu alcance de talento!
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Las empresas con logo y descripción completa reciben 3x más aplicaciones de calidad.
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-blue-800">Perfil de empresa activo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-blue-800">Optimización disponible</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{getCompletionPercentage()}%</div>
                  <div className="text-xs text-blue-600">Completitud</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-300 text-blue-700"
                  onClick={() => navigate('/business-dashboard/company-profile')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Optimizar Perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      <OpportunityList onApplicationsView={handleApplicationsView} />
    </div>
  );
};
