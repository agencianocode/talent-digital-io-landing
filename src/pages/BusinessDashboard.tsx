import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Building } from 'lucide-react';

interface CompanyData {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  logo_url: string | null;
  business_type: string | null;
}

interface UserProfile {
  professional_title: string | null;
  linkedin_url: string | null;
  phone: string | null;
  country_code: string | null;
  avatar_url: string | null;
  full_name: string | null;
}

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, hasCompletedBusinessOnboarding } = useSupabaseAuth();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || checkingOnboarding) return;

      try {
        // Obtener datos de la empresa
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          console.error('Error fetching company:', companyError);
        } else if (company) {
          setCompanyData(company);
        }

        // Obtener datos del perfil desde user_metadata
        setUserProfile({
          professional_title: user.user_metadata?.professional_title || null,
          linkedin_url: user.user_metadata?.linkedin_url || null,
          phone: user.user_metadata?.phone || null,
          country_code: user.user_metadata?.country_code || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, checkingOnboarding]);

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
      <div className="space-y-6">
        {/* Welcome Banner - 2 Column Design */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-green-50 rounded-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Content and Buttons */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0">
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
                  <h1 className="text-3xl font-bold text-slate-900">
                    Hola {userProfile?.full_name || 'Usuario'}! 👋
                  </h1>
                  <p className="text-base text-slate-600 mt-1">
                    Empezá a construir tu equipo en TalentoDigital.io
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 text-base">
                  Publicar Oportunidad
                </Button>
                <Button variant="outline" className="px-6 py-3 text-base border-slate-300 hover:bg-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tu perfil de empresa está al 70%</h2>
                <p className="text-sm text-slate-600 mb-4">Completalo para atraer más talento y generar confianza.</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700">Onboarding Completado</span>
                  </div>
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <Circle className="h-5 w-5 text-slate-300" />
                      <span className="text-slate-700">Perfil de Empresa Completo</span>
                    </div>
                    <Button variant="link" className="text-blue-600 p-0 h-auto">
                      Completar Perfil ahora
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="h-5 w-5 text-slate-300" />
                    <span className="text-slate-700">Publicar primera oportunidad</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="h-5 w-5 text-slate-300" />
                    <span className="text-slate-700">Invitar colegas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Benefits */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cuando publiques una oportunidad, acá vas a ver:</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Postulaciones recibidas</li>
                  <li>• Oportunidades activas</li>
                  <li>• Tiempo promedio de respuesta</li>
                </ul>
                <Button className="mt-4 bg-black hover:bg-gray-800 text-white">
                  Publicar Oportunidad
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Onboarding Call */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Agenda tu llamada de onboarding 😊</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Con una llamada gratuita nuestro equipo te ayuda en pocos minutos a:
                </p>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li>• Aprender a publicar oportunidades</li>
                  <li>• Optimizar tu perfil de empresa</li>
                  <li>• Sacarte el mayor provecho a la plataforma</li>
                  <li>• Resolver dudas</li>
                </ul>
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
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