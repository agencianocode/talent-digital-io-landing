import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProfessionalData } from '@/hooks/useProfessionalData';
import { ProfileTemplates } from '@/components/ProfileTemplates';
import { ProfileCompletenessDashboard } from '@/components/ProfileCompletenessDashboard';
import { TalentProfileWizard } from '@/components/wizard/TalentProfileWizard';
import { 
  GraduationCap, 
  Rocket, 
  Star, 
  ArrowRight,
  CheckCircle,
  Play,
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
  const { profile, userRole } = useSupabaseAuth();
  const { categories } = useProfessionalData();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);

  // Check if user has completed basic onboarding
  const isBasicComplete = profile?.full_name && profile?.avatar_url;
  const isProfessionalComplete = (profile?.profile_completeness || 0) > 60;

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a la plataforma!',
      description: 'Configuremos tu perfil para que destagues entre miles de talentos',
      icon: <Rocket className="h-6 w-6" />,
      completed: false,
      estimatedTime: '1 min',
      action: () => setCurrentStep(1)
    },
    {
      id: 'basic-info',
      title: 'Información Básica',
      description: 'Completa tu nombre, foto y datos de contacto',
      icon: <BookOpen className="h-6 w-6" />,
      completed: Boolean(profile?.full_name && profile?.avatar_url),
      estimatedTime: '3 min',
      action: () => navigate('/settings/profile?tab=personal')
    },
    {
      id: 'professional',
      title: 'Perfil Profesional',
      description: 'Define tu especialidad, habilidades y experiencia',
      icon: <Target className="h-6 w-6" />,
      completed: Boolean((profile?.profile_completeness || 0) > 30),
      estimatedTime: '5 min',
      action: () => setShowWizard(true)
    },
    {
      id: 'templates',
      title: 'Usar Plantillas',
      description: 'Acelera el proceso usando plantillas pre-definidas',
      icon: <Star className="h-6 w-6" />,
      completed: false,
      estimatedTime: '2 min',
      action: () => setCurrentStep(4)
    },
    {
      id: 'complete',
      title: '¡Perfil Completo!',
      description: 'Tu perfil está listo para recibir oportunidades',
      icon: <CheckCircle className="h-6 w-6" />,
      completed: Boolean((profile?.profile_completeness || 0) >= 80),
      estimatedTime: '¡Hecho!',
      action: () => navigate('/talent-dashboard')
    }
  ];

  const getStepStatus = (index: number) => {
    if (onboardingSteps[index].completed) return 'completed';
    if (index === currentStep) return 'current';
    if (index < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    navigate('/talent-dashboard');
  };

  if (showWizard) {
    return <TalentProfileWizard />;
  }

  // Show full dashboard if user is already advanced
  if ((profile?.profile_completeness || 0) > 50) {
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
          <TalentProfileWizard />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">
            ¡Vamos a crear tu perfil perfecto!
          </CardTitle>
          <p className="text-blue-700">
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
      <div className="space-y-4">
        {onboardingSteps.map((step, index) => {
          const status = getStepStatus(index);
          const isActive = index === currentStep;
          
          return (
            <Card 
              key={step.id} 
              className={`transition-all duration-300 ${
                isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${status === 'completed' ? 'bg-green-50 border-green-200' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      {step.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completado
                        </Badge>
                      )}
                      {isActive && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Actual
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {step.estimatedTime}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  <div className="flex gap-2">
                    {isActive && !step.completed && (
                      <Button onClick={step.action} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Comenzar
                      </Button>
                    )}
                    
                    {step.completed && (
                      <Button variant="outline" onClick={step.action}>
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Step Content */}
      {currentStep === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Rocket className="h-16 w-16 mx-auto text-blue-600 mb-4" />
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

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Plantillas Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileTemplates 
              onApplyTemplate={(data) => {
                // Apply template data and proceed
                console.log('Applying template:', data);
                setCurrentStep(currentStep + 1);
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