import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { useProfileSync } from '@/hooks/useProfileSync';

import { ProfileCompletenessDashboard } from '@/components/ProfileCompletenessDashboard';
import { TalentProfileWizard } from '@/components/wizard/TalentProfileWizard';
import { OnboardingSteps } from '@/components/OnboardingSteps';
import { shouldShowAdvancedView } from '@/lib/onboarding-utils';
import { 
  GraduationCap, 
  Rocket, 
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
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL LOGIC BEFORE THIS
  const { profile, user } = useSupabaseAuth();
  const { completeness, breakdown, loading } = useProfileCompleteness();
  const { syncProfile } = useProfileSync();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore last visited onboarding step
  useEffect(() => {
    try {
      const saved = localStorage.getItem('onboarding.currentStep');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed)) {
          setCurrentStep(parsed);
        }
      }
    } catch {}
  }, []);

  // Persist current step
  useEffect(() => {
    try {
      localStorage.setItem('onboarding.currentStep', String(currentStep));
    } catch {}
  }, [currentStep]);

  // Initialize data when component mounts
  useEffect(() => {
    const initialize = async () => {
      if (user?.id && !isInitialized) {
        try {
          // Wrap async operations in startTransition to avoid suspense errors
          startTransition(() => {
            syncProfile().then(() => {
              setIsInitialized(true);
            }).catch((error) => {
              console.error('Error initializing onboarding:', error);
              setIsInitialized(true); // Set to true even on error to prevent infinite loop
            });
          });
        } catch (error) {
          console.error('Error initializing onboarding:', error);
          setIsInitialized(true);
        }
      }
    };
    
    initialize();
  }, [user?.id, syncProfile, isInitialized]);

  // Callback functions
  const handleStepAction = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
  }, []);

  const handleProfessionalStep = useCallback(() => {
    setShowWizard(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    navigate('/talent-dashboard');
  }, [navigate]);

  const handleWizardComplete = useCallback(async () => {
    setShowWizard(false);
    // Wrap async operation in startTransition
    startTransition(() => {
      syncProfile().catch((error) => {
        console.error('Error syncing after wizard completion:', error);
      });
    });
  }, [syncProfile]);

  // Derived state calculations (after all hooks)
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
      action: () => {
        try { localStorage.setItem('onboarding.returnToStep', 'professional'); } catch {}
        navigate('/settings/profile?tab=personal&from=onboarding');
      }
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
      id: 'complete',
      title: '¡Perfil Completo!',
      description: 'Tu perfil está listo para recibir oportunidades',
      icon: <Target className="h-6 w-6" />,
      completed: completeness >= 80,
      estimatedTime: '¡Hecho!',
      action: () => navigate('/talent-dashboard')
    }
  ];

  // If user returns from Basic Info, jump to Professional step
  useEffect(() => {
    try {
      const flag = localStorage.getItem('onboarding.returnToStep');
      if (flag === 'professional') {
        const professionalIndex = onboardingSteps.findIndex((s) => s.id === 'professional');
        if (professionalIndex !== -1 && isBasicComplete) {
          setCurrentStep(professionalIndex);
          localStorage.removeItem('onboarding.returnToStep');
        }
      }
    } catch {}
  }, [isInitialized, isBasicComplete]);

  // Auto-advance effect (using fixed dependencies and startTransition)
  useEffect(() => {
    if (isInitialized && currentStep < onboardingSteps.length && onboardingSteps[currentStep]?.completed) {
      const nextStepIndex = onboardingSteps.findIndex((step, index) => index > currentStep && !step.completed);
      if (nextStepIndex !== -1) {
        startTransition(() => {
          setCurrentStep(nextStepIndex);
        });
      }
    }
  }, [isInitialized, currentStep, completeness, isBasicComplete, onboardingSteps.length]);

  // Ensure we position user on the next incomplete step (forward-only)
  useEffect(() => {
    if (!isInitialized) return;
    const target = !isBasicComplete ? 1 : completeness < 30 ? 2 : 3;
    if (currentStep < target) {
      setCurrentStep(target);
    }
  }, [isInitialized, isBasicComplete, completeness, currentStep]);
 
   // RENDER LOGIC STARTS HERE - ALL HOOKS MUST BE CALLED BEFORE THIS POINT
   
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="wizard">Wizard Completo</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProfileCompletenessDashboard />
        </TabsContent>

        <TabsContent value="wizard">
          <TalentProfileWizard onComplete={handleWizardComplete} />
        </TabsContent>
      </Tabs>
    );
  }

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
                disabled={currentStep >= (onboardingSteps.length - 1)}
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