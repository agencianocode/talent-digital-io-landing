import React, { useState, useEffect } from 'react';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { ProfileCompletenessDashboard } from '@/components/ProfileCompletenessDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Sparkles } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { userRole, profile } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if this is a first-time user (coming from registration)
  useEffect(() => {
    // Check if user came from registration or has very low profile completeness
    const isFromRegistration = document.referrer.includes('/register-talent') || 
                              location.state?.fromRegistration ||
                              (profile?.profile_completeness || 0) < 20;
    setIsFirstTimeUser(isFromRegistration);
  }, [profile, location]);

  // Redirect if not talent role
  if (!isTalentRole(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground mb-4">
              El onboarding está disponible solo para perfiles de talento.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner for First-Time Users */}
        {isFirstTimeUser && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">¡Bienvenido a TalentoDigital.io!</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Te guiaremos paso a paso para crear un perfil profesional que te ayude a encontrar las mejores oportunidades.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setIsFirstTimeUser(false)} className="flex-1">
                  Comenzar configuración
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsFirstTimeUser(false);
                    navigate('/talent-dashboard');
                  }}
                >
                  Saltar por ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/talent-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isFirstTimeUser ? 'Configuración Inicial de Perfil' : 'Configuración de Perfil'}
            </h1>
            <p className="text-muted-foreground">
              {isFirstTimeUser 
                ? 'Completa tu perfil profesional para empezar a recibir oportunidades' 
                : 'Completa tu perfil para encontrar mejores oportunidades'
              }
            </p>
          </div>
        </div>

        {/* Main Content */}
        <OnboardingWizard isFirstTimeUser={isFirstTimeUser} />
      </div>
    </div>
  );
};

export default OnboardingPage;