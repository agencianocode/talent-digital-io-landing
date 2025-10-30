import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Building } from 'lucide-react';
import { useProfileProgress } from '@/hooks/useProfileProgress';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { BusinessMetrics } from '@/components/dashboard/BusinessMetrics';
import { useRealApplications } from '@/hooks/useRealApplications';
import { supabase } from '@/integrations/supabase/client';
import RecommendedProfiles from '@/components/dashboard/RecommendedProfiles';
import { useAdminCustomization } from '@/hooks/useAdminCustomization';


const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, hasCompletedBusinessOnboarding } = useSupabaseAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const { 
    companyData, 
    userProfile, 
    loading, 
    getTasksStatus, 
    getCompletionPercentage,
    getNextIncompleteTask
  } = useProfileProgress();
  
  const { opportunities } = useSupabaseOpportunities();
  const { metrics: applicationMetrics } = useRealApplications();
  const { customization } = useAdminCustomization();

  // Map de postulantes por oportunidad desde métricas reales
  const applicantsByOpportunity = useMemo<Record<string, number>>(() => {
    return applicationMetrics?.applicationsByOpportunity || {};
  }, [applicationMetrics]);

  // Vistas por oportunidad (conteo de registros en opportunity_views o suma de shares)
  const [viewsByOpportunity, setViewsByOpportunity] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const activeOpportunityIds = opportunities
          .filter(opp => opp.status === 'active')
          .map(opp => opp.id);

        if (activeOpportunityIds.length === 0) {
          setViewsByOpportunity({});
          return;
        }

        // 1) Intentar usar tabla de vistas granulares
        const { data: viewsRows, error: viewsErr } = await (supabase as any)
          .from('opportunity_views')
          .select('opportunity_id');

        let aggregated: Record<string, number> = {};
        if (!viewsErr && viewsRows) {
          viewsRows.forEach((row: any) => {
            if (!activeOpportunityIds.includes(row.opportunity_id)) return;
            aggregated[row.opportunity_id] = (aggregated[row.opportunity_id] || 0) + 1;
          });
        } else {
          // 2) Fallback: sumar views_count desde opportunity_shares si existe
          const { data: sharesRows, error: sharesErr } = await (supabase as any)
            .from('opportunity_shares')
            .select('opportunity_id, views_count');
          if (sharesErr) throw sharesErr;
          (sharesRows || []).forEach((row: any) => {
            if (!activeOpportunityIds.includes(row.opportunity_id)) return;
            aggregated[row.opportunity_id] = (aggregated[row.opportunity_id] || 0) + (row.views_count || 0);
          });
        }

        setViewsByOpportunity(aggregated);
      } catch (err) {
        console.error('Error obteniendo vistas de oportunidades:', err);
        setViewsByOpportunity({});
      }
    };

    fetchViews();
  }, [opportunities]);
  
  // Calcular solo las oportunidades activas para el dashboard
  const activeOpportunitiesCount = opportunities.filter(opp => opp.status === 'active').length;

  // Verificar onboarding antes de mostrar dashboard
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const isOnboardingComplete = await hasCompletedBusinessOnboarding(user.id);
        
        if (!isOnboardingComplete) {
          // Si no ha completado onboarding, redirigir
          navigate('/company-onboarding');
          return;
        }
        
        setCheckingOnboarding(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, hasCompletedBusinessOnboarding, navigate]);


  if (loading || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">
          {checkingOnboarding ? 'Verificando configuración...' : 'Cargando...'}
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-3 sm:space-y-4 p-2 sm:p-4 lg:p-6">
        {/* Welcome Banner - 2 Column Design */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-green-50 rounded-xl p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 items-center">
            {/* Left Column - Content and Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0">
                  {companyData?.logo_url ? (
                    <img 
                      src={companyData.logo_url} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Building className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                    Hola {userProfile?.full_name || 'Usuario'}! 👋
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">
                    {customization?.banner_welcome_text || 'Empezá a construir tu equipo en TalentoDigital.io'}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="default"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={() => navigate('/business-dashboard/opportunities/new')}
                >
                  Publicar Oportunidad
                </Button>
                <Button 
                  variant="outline" 
                  className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={() => navigate('/business-dashboard/talent-discovery')}
                >
                  Buscar Talento
                </Button>
              </div>
            </div>

            {/* Right Column - Video Tutorial Real */}
            {(customization?.banner_show_video !== false) && (
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  {/* Video Tutorial */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 w-80 h-48">
                    <iframe
                      className="w-full h-full"
                      src={customization?.banner_video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                      title="Tutorial TalentoDigital"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  
                  {/* Botón alternativo para llamada personalizada */}
                  {(customization?.banner_show_call_button !== false) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full text-xs"
                      onClick={() => window.open(customization?.banner_call_url || 'https://calendly.com/talentodigital', '_blank')}
                    >
                      {customization?.banner_call_button_text || '📞 Agendar llamada personalizada'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Conditional based on profile completion */}
        {getCompletionPercentage() < 100 ? (
          // Incomplete Profile View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Profile Completion */}
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-2">Tu perfil de empresa está al {getCompletionPercentage()}%</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3">Completalo para atraer más talento y generar confianza.</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${getCompletionPercentage()}%`}}></div>
                  </div>
                  
                  <div className="space-y-1">
                    {getTasksStatus().map((task) => {
                      // Determinar si este es el paso actual (primer incompleto)
                      const nextIncompleteTask = getNextIncompleteTask();
                      const isCurrentStep = !task.completed && nextIncompleteTask?.id === task.id;
                      
                      return (
                        <div 
                          key={task.id} 
                          className={`flex items-center gap-2 sm:gap-3 justify-between p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                            isCurrentStep 
                              ? 'bg-gray-100 shadow-lg border-l-4 border-blue-500 border border-gray-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            {task.completed ? (
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isCurrentStep ? 'text-blue-500' : 'text-slate-300'}`} />
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                              <span className={`text-sm sm:text-base ${isCurrentStep ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                {task.title}
                              </span>
                              {isCurrentStep && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium self-start sm:self-center">
                                  Paso actual
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {task.id === 'profile' && !task.completed && (
                            <Button 
                              variant="link" 
                              className="text-blue-600 p-0 h-auto ml-1 sm:ml-3 text-xs sm:text-sm"
                              onClick={() => navigate('/business-dashboard/company-details')}
                            >
                              <span className="hidden sm:inline">Completar Perfil ahora</span>
                              <span className="sm:hidden">Completar</span>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Publishing Benefits */}
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Cuando publiques una oportunidad, acá vas a ver:</h3>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                    <li>• Postulaciones recibidas</li>
                    <li>• Oportunidades activas</li>
                    <li>• Tiempo promedio de respuesta</li>
                  </ul>
                  <Button 
                    className="mt-2 sm:mt-3 bg-black hover:bg-gray-800 text-white text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                    onClick={() => navigate('/business-dashboard/opportunities/new')}
                  >
                    Publicar Oportunidad
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Onboarding Call */}
            <div>
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Agenda tu llamada de onboarding 😊</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">
                    Con una llamada gratuita nuestro equipo te ayuda en pocos minutos a:
                  </p>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-600 mb-3">
                    <li>• Aprender a publicar oportunidades</li>
                    <li>• Optimizar tu perfil de empresa</li>
                    <li>• Sacarte el mayor provecho a la plataforma</li>
                    <li>• Resolver dudas</li>
                  </ul>
                  <Button 
                    className="w-full bg-black hover:bg-gray-800 text-white text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                    onClick={() => window.open('https://calendly.com/talentodigital', '_blank')}
                  >
                    Agendar Llamada
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Complete Profile View - Full Dashboard
          <div className="space-y-6">
            {/* Enhanced Metrics */}
            <BusinessMetrics />

            {/* Active Opportunities Section */}
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Oportunidades Activas</h3>
                  <Button 
                    variant="link" 
                    className="text-blue-600 p-0 h-auto text-sm sm:text-base self-start sm:self-center"
                    onClick={() => navigate('/business-dashboard/opportunities')}
                  >
                    Ver todas
                  </Button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {activeOpportunitiesCount === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-slate-500">
                      <p className="text-sm sm:text-base">No hay oportunidades activas</p>
                      <Button 
                        className="mt-2 sm:mt-3 bg-black hover:bg-gray-800 text-white text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                        onClick={() => navigate('/business-dashboard/opportunities/new')}
                      >
                        Crear primera oportunidad
                      </Button>
                    </div>
                  ) : (
                    opportunities
                      .filter(opp => opp.status === 'active')
                      .slice(0, 3) // Mostrar máximo 3 en el dashboard
                      .map((opportunity) => (
                        <div key={opportunity.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {companyData?.logo_url ? (
                                <img 
                                  src={companyData.logo_url} 
                                  alt="Company Logo" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building className="h-6 w-6 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 text-sm sm:text-base truncate">{opportunity.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 mt-1">
                                <span className="truncate max-w-[120px] sm:max-w-none">{opportunity.companies?.name || 'Tu empresa'}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-xs">Hace {new Date(opportunity.created_at).toLocaleDateString()}</span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Activa</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mt-1.5 sm:mt-1">
                                <span className="flex items-center gap-1">
                                  👁️ <span>{viewsByOpportunity[opportunity.id] || 0} vistas</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  👤 <span>{applicantsByOpportunity[opportunity.id] || 0} Postulantes</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap"
                            onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}/applicants`)}
                          >
                            Ver Postulantes
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Profiles Section */}
            <RecommendedProfiles />
          </div>
        )}

      </div>
  );
};

export default BusinessDashboard;