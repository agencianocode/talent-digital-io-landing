import React from 'react';
import { OnboardingProvider, useOnboardingController } from './OnboardingController';
import { isTalentRole } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Sparkles, ArrowLeft, Settings, BarChart3 } from 'lucide-react';
import { TalentProfileWizard } from '@/components/wizard/TalentProfileWizard';
import { ProfileCompletenessDashboard } from '@/components/ProfileCompletenessDashboard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OnboardingContent: React.FC = () => {
  const { state, actions, userRole, completeness, loading } = useOnboardingController();

  // Redirect business users to their dashboard
  if (!isTalentRole(userRole)) {
    React.useEffect(() => {
      window.location.href = '/business-dashboard';
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Redirigiendo...</h2>
            <p className="text-muted-foreground">
              Te estamos llevando a tu dashboard empresarial.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración de perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        {state.showWelcome && state.currentView === 'welcome' && (
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
                <Button 
                  onClick={() => actions.setCurrentView('wizard')}
                  className="flex-1"
                >
                  Comenzar configuración
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    actions.setShowWelcome(false);
                    actions.navigateToDashboard();
                  }}
                >
                  Saltar por ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={actions.navigateToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {state.isFirstTimeUser ? 'Configuración Inicial' : 'Configuración de Perfil'}
              </h1>
              <p className="text-muted-foreground">
                {completeness < 50 
                  ? 'Completa tu perfil para encontrar mejores oportunidades' 
                  : 'Optimiza tu perfil profesional'
                }
              </p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-2">
            <Button
              variant={state.currentView === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => actions.setCurrentView('dashboard')}
              className="hidden sm:flex"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Progreso
            </Button>
            <Button
              variant={state.currentView === 'wizard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => actions.setCurrentView('wizard')}
              className="hidden sm:flex"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {state.currentView === 'welcome' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Sparkles className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">¡Empecemos!</h3>
              <p className="text-muted-foreground mb-6">
                Configuraremos tu perfil paso a paso para que puedas comenzar a recibir oportunidades.
              </p>
              <Button onClick={() => actions.setCurrentView('wizard')} className="w-full">
                Comenzar configuración
              </Button>
            </div>
          </div>
        )}

        {state.currentView === 'dashboard' && (
          <div className="space-y-6">
            <ProfileCompletenessDashboard />
          </div>
        )}

        {state.currentView === 'wizard' && (
          <div className="space-y-6">
            {/* Mobile View Switcher */}
            <div className="sm:hidden">
              <Tabs value={state.currentView} onValueChange={(value) => actions.setCurrentView(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dashboard">Progreso</TabsTrigger>
                  <TabsTrigger value="wizard">Configurar</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <TalentProfileWizard 
              onComplete={actions.handleWizardComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface UnifiedOnboardingFlowProps {
  isFirstTimeUser?: boolean;
}

export const UnifiedOnboardingFlow: React.FC<UnifiedOnboardingFlowProps> = ({ 
  isFirstTimeUser = false 
}) => {
  return (
    <OnboardingProvider initialIsFirstTimeUser={isFirstTimeUser}>
      <OnboardingContent />
    </OnboardingProvider>
  );
};