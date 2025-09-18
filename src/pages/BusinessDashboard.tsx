import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Building } from 'lucide-react';
import { useProfileProgress } from '@/hooks/useProfileProgress';


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
                    Empezá a construir tu equipo en TalentoDigital.io
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={() => navigate('/business-dashboard/opportunities/new')}
                >
                  Publicar Oportunidad
                </Button>
                <Button 
                  variant="outline" 
                  className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base border-slate-300 hover:bg-black hover:text-white"
                  onClick={() => navigate('/business-dashboard/talent')}
                >
                  Buscar Talento
                </Button>
              </div>
            </div>

            {/* Right Column - Video/Graphic Placeholder */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Decorative Background Elements */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-20"></div>
                <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-blue-200 rounded-full opacity-30"></div>
                
                {/* Video/Content Placeholder */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 w-72 h-44 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Video Tutorial</p>
                      <p className="text-xs text-slate-500">Cómo empezar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Left Column - Profile Progress */}
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
                            onClick={() => navigate('/settings/profile?tab=corporate')}
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

      </div>
  );
};

export default BusinessDashboard;