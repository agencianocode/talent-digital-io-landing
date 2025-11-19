import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, Users, Briefcase, Star, TestTube } from 'lucide-react';
import { OpportunityMetrics } from './OpportunityMetrics';
import { OpportunityList } from './OpportunityList';
import { useProfileProgress } from '@/hooks/useProfileProgress';
import { useCompany } from '@/contexts/CompanyContext';

export const OpportunityDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [useMockData, setUseMockData] = useState(false);
  const { getCompletionPercentage } = useProfileProgress();

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
        
        <div className="flex gap-3">
          <Button 
            variant={useMockData ? "default" : "outline"}
            onClick={() => setUseMockData(!useMockData)}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {useMockData ? 'Datos de Prueba' : 'Datos Reales'}
          </Button>
          {useCompany().canCreateOpportunities() && (
            <Button onClick={handleCreateOpportunity} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Publicar Oportunidad
            </Button>
          )}
        </div>
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

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Oportunidades
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <OpportunityMetrics useMockData={useMockData} />
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Nueva aplicación recibida</p>
                      <p className="text-xs text-gray-500">Developer Full Stack React/Node - hace 2 horas</p>
                    </div>
                  </div>
                  <Badge variant="outline">Nueva</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Oportunidad publicada</p>
                      <p className="text-xs text-gray-500">Especialista en Marketing Digital - hace 1 día</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Activa</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Candidato destacado</p>
                      <p className="text-xs text-gray-500">Diseñador UX/UI - hace 3 días</p>
                    </div>
                  </div>
                  <Badge variant="outline">Revisar</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <OpportunityList onApplicationsView={handleApplicationsView} useMockData={useMockData} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Categoría</CardTitle>
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
                <CardTitle>Tendencias de Aplicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Esta semana</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">+12%</span>
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
                    <span className="text-sm font-medium">24 aplicaciones</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
