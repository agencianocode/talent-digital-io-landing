import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { useProfileSync } from '@/hooks/useProfileSync';
import { ProfileTemplates } from '@/components/ProfileTemplates';
import { ProfileCompletenessDashboard } from '@/components/ProfileCompletenessDashboard';
import { TalentProfileWizard } from '@/components/wizard/TalentProfileWizard';
import { OnboardingSteps } from '@/components/OnboardingSteps';
import { shouldShowAdvancedView, getNextIncompleteStep } from '@/lib/onboarding-utils';
import { 
  GraduationCap, 
  Rocket, 
  Star, 
  ArrowRight,
  BookOpen,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  estimatedTime: string;
  action: () => void;
}

interface OnboardingWizardProps {
  isFirstTimeUser?: boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isFirstTimeUser = false }) => {
  const { profile, user } = useSupabaseAuth();
  const { completeness, breakdown, loading } = useProfileCompleteness();
  const { syncProfile } = useProfileSync();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data when component mounts
  useEffect(() => {
    const initialize = async () => {
      if (user?.id && !isInitialized) {
        try {
          await syncProfile();
          setIsInitialized(true);
        } catch (error) {
          console.error('Error initializing onboarding:', error);
        }
      }
    };
    
    initialize();
  }, [user?.id, syncProfile, isInitialized]);

  // Safely check profile completion
  const profileData = profile as any;
  const isBasicComplete = Boolean(
    profile?.full_name && 
    profile?.avatar_url && 
    profile?.phone && 
    profileData?.country
  );

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a la plataforma!',
      description: 'Configuremos tu perfil para que destagues entre miles de talentos',
      icon: <Rocket className="h-6 w-6" />,
      completed: false,
      estimatedTime: '1 min',
      action: () => handleStepAction(1)
    },
    {
      id: 'basic-info',
      title: 'Información Básica',
      description: 'Completa tu nombre, foto y datos de contacto',
      icon: <BookOpen className="h-6 w-6" />,
      completed: isBasicComplete,
      estimatedTime: '3 min',
      action: () => navigate('/settings/profile?tab=personal&from=onboarding')
    },
    {
      id: 'professional',
      title: 'Perfil Profesional',
      description: 'Define tu especialidad, habilidades y experiencia',
      icon: <Target className="h-6 w-6" />,
      completed: completeness >= 30,
      estimatedTime: '5 min',
      action: () => handleProfessionalStep()
    },
    {
      id: 'templates',
      title: 'Usar Plantillas',
      description: 'Acelera el proceso usando plantillas pre-definidas',
      icon: <Star className="h-6 w-6" />,
      completed: false,
      estimatedTime: '2 min',
      action: () => handleStepAction(3)
    },
    {
      id: 'complete',
      title: '¡Perfil Completo!',
      description: 'Tu perfil está listo para recibir oportunidades',
      icon: <Target className="h-6 w-6" />,
      completed: completeness >= 80,
      estimatedTime: '¡Hecho!',
      action: () => navigate('/talent-dashboard')
    }
  ];

  const handleStepAction = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
  }, []);

  const handleProfessionalStep = useCallback(() => {
    setShowWizard(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, onboardingSteps.length]);

  const handleSkip = useCallback(() => {
    navigate('/talent-dashboard');
  }, [navigate]);

  const handleWizardComplete = useCallback(async () => {
    setShowWizard(false);
    try {
      await syncProfile();
    } catch (error) {
      console.error('Error syncing after wizard completion:', error);
    }
  }, [syncProfile]);

  // Show loading state during initialization
  if (!isInitialized || loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando tu perfil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWizard) {
    return <TalentProfileWizard onComplete={handleWizardComplete} />;
  }

  // Show full dashboard if user is already advanced
  if (shouldShowAdvancedView(completeness)) {
    return (
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="wizard">Wizard Completo</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProfileCompletenessDashboard />
        </TabsContent>

        <TabsContent value="templates">
          <ProfileTemplates />
        </TabsContent>

        <TabsContent value="wizard">
          <TalentProfileWizard onComplete={handleWizardComplete} />
        </TabsContent>
      </Tabs>
    );
  }

  // Auto-advance to next incomplete step if current step is completed
  useEffect(() => {
    if (isInitialized && onboardingSteps[currentStep]?.completed) {
      const nextStep = getNextIncompleteStep(onboardingSteps);
      if (nextStep !== -1 && nextStep !== currentStep) {
        setCurrentStep(nextStep);
      }
    }
  }, [isInitialized, currentStep, onboardingSteps]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            ¡Vamos a crear tu perfil perfecto!
          </CardTitle>
          <p className="text-muted-foreground">
            Te guiaremos paso a paso para crear un perfil que destaque
          </p>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso del Onboarding</span>
              <span className="text-sm text-muted-foreground">
                Paso {Math.min(currentStep + 1, onboardingSteps.length)} de {onboardingSteps.length}
              </span>
            </div>
            <Progress 
              value={(currentStep / (onboardingSteps.length - 1)) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <OnboardingSteps steps={onboardingSteps} currentStep={currentStep} />

      {/* Current Step Content */}
      {currentStep === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Rocket className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">¡Comencemos!</h2>
            <p className="text-muted-foreground mb-6">
              Crear un perfil completo te ayudará a encontrar mejores oportunidades laborales.
              El proceso toma solo unos minutos.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleNext} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Comenzar Configuración
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Saltar por ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Plantillas Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileTemplates 
              onApplyTemplate={async (data) => {
                try {
                  await syncProfile();
                  setCurrentStep(4);
                } catch (error) {
                  console.error('Error applying template:', error);
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Saltar Onboarding
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={currentStep >= onboardingSteps.length - 1}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};