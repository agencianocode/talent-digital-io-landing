import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProfessionalData, ProfessionalCategory, Industry } from '@/hooks/useProfessionalData';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Briefcase, 
  Award, 
  GraduationCap,
  Building,
  Video,
  Globe,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import step components
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ProfessionalInfoStep } from './steps/ProfessionalInfoStep';
import { SkillsAndExperienceStep } from './steps/SkillsAndExperienceStep';
import { WorkExperienceStep } from './steps/WorkExperienceStep';
import { EducationStep } from './steps/EducationStep';
import { MultimediaStep } from './steps/MultimediaStep';
import { SocialLinksStep } from './steps/SocialLinksStep';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isOptional?: boolean;
}

export interface WizardData {
  // Basic info
  country: string;
  city: string;
  hide_location: boolean;
  phone: string;
  
  // Professional info
  primary_category_id: string;
  secondary_category_id: string;
  title: string;
  experience_level: string;
  bio: string;
  
  // Skills and industries
  skills: string[];
  industries_of_interest: string[];
  
  // Work experience
  work_experience: Array<{
    id?: string;
    company: string;
    company_directory_id?: string;
    position: string;
    description: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
  }>;
  
  // Education
  education: Array<{
    id?: string;
    institution: string;
    degree: string;
    field_of_study: string;
    description: string;
    graduation_year: number;
  }>;
  
  // Social links
  social_links: {
    linkedin?: string;
    youtube?: string;
    website?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };
  
  // Multimedia
  video_presentation_url: string;
  portfolio_url: string;
  
  // Rates
  hourly_rate_min: number;
  hourly_rate_max: number;
  currency: string;
  availability: string;
}

interface TalentProfileWizardProps {
  onComplete?: () => void;
}

export const TalentProfileWizard: React.FC<TalentProfileWizardProps> = ({ onComplete }) => {
  const { user, profile } = useSupabaseAuth();
  const { categories, industries, loading: dataLoading } = useProfessionalData();
  const { completeness, refreshCompleteness } = useProfileCompleteness();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
    country: '',
    city: '',
    hide_location: false,
    phone: '',
    primary_category_id: '',
    secondary_category_id: '',
    title: '',
    experience_level: '',
    bio: '',
    skills: [],
    industries_of_interest: [],
    work_experience: [],
    education: [],
    social_links: {},
    video_presentation_url: '',
    portfolio_url: '',
    hourly_rate_min: 25,
    hourly_rate_max: 100,
    currency: 'USD',
    availability: 'immediate'
  });

  const steps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Información Personal',
      description: 'Datos básicos y ubicación',
      icon: <User className="h-5 w-5" />,
      isCompleted: !!wizardData.country && !!wizardData.city,
    },
    {
      id: 'professional-info',
      title: 'Información Profesional',
      description: 'Categoría y especialización',
      icon: <Briefcase className="h-5 w-5" />,
      isCompleted: !!wizardData.primary_category_id && !!wizardData.title && !!wizardData.experience_level,
    },
    {
      id: 'skills',
      title: 'Habilidades',
      description: 'Skills e industrias de interés',
      icon: <Award className="h-5 w-5" />,
      isCompleted: wizardData.skills.length > 0 && !!wizardData.bio,
    },
    {
      id: 'work-experience',
      title: 'Experiencia Laboral',
      description: 'Historial profesional',
      icon: <Building className="h-5 w-5" />,
      isCompleted: wizardData.work_experience.length > 0,
    },
    {
      id: 'education',
      title: 'Educación',
      description: 'Formación académica',
      icon: <GraduationCap className="h-5 w-5" />,
      isCompleted: wizardData.education.length > 0,
      isOptional: true,
    },
    {
      id: 'multimedia',
      title: 'Portfolio & Media',
      description: 'Video y trabajos',
      icon: <Video className="h-5 w-5" />,
      isCompleted: !!wizardData.video_presentation_url || !!wizardData.portfolio_url,
      isOptional: true,
    },
    {
      id: 'social-links',
      title: 'Redes Sociales',
      description: 'Enlaces profesionales',
      icon: <Globe className="h-5 w-5" />,
      isCompleted: Object.values(wizardData.social_links).some(link => !!link),
      isOptional: true,
    },
  ];

  // Load existing data on mount
  useEffect(() => {
    loadExistingData();
  }, [user]);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load profile data
      const profileData = profile as any;
      if (profileData) {
        setWizardData(prev => ({
          ...prev,
          country: profileData.country || '',
          city: profileData.city || '',
          hide_location: profileData.hide_location || false,
          phone: profileData.phone || '',
          social_links: profileData.social_links || {},
          video_presentation_url: profileData.video_presentation_url || '',
        }));
      }

      // Load talent profile data
      const { data: talentProfile } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (talentProfile) {
        setWizardData(prev => ({
          ...prev,
          primary_category_id: talentProfile.primary_category_id || '',
          secondary_category_id: talentProfile.secondary_category_id || '',
          title: talentProfile.title || '',
          experience_level: talentProfile.experience_level || '',
          bio: talentProfile.bio || '',
          skills: talentProfile.skills || [],
          industries_of_interest: talentProfile.industries_of_interest || [],
          portfolio_url: talentProfile.portfolio_url || '',
          hourly_rate_min: talentProfile.hourly_rate_min || 25,
          hourly_rate_max: talentProfile.hourly_rate_max || 100,
          currency: talentProfile.currency || 'USD',
          availability: talentProfile.availability || 'immediate',
        }));

        // Load work experience
        const { data: workData } = await supabase
          .from('work_experience')
          .select('*')
          .eq('talent_profile_id', talentProfile.id)
          .order('start_date', { ascending: false });

        if (workData) {
          setWizardData(prev => ({
            ...prev,
            work_experience: workData.map(work => ({
              id: work.id,
              company: work.company || '',
              position: work.position || '',
              description: work.description || '',
              start_date: work.start_date || '',
              end_date: work.end_date || '',
              is_current: work.is_current || false,
            })),
          }));
        }

        // Load education
        const { data: educationData } = await supabase
          .from('education')
          .select('*')
          .eq('talent_profile_id', talentProfile.id)
          .order('graduation_year', { ascending: false });

        if (educationData) {
          setWizardData(prev => ({
            ...prev,
            education: educationData.map(edu => ({
              id: edu.id,
              institution: edu.institution || '',
              degree: edu.degree || '',
              field_of_study: edu.field_of_study || '',
              description: edu.description || '',
              graduation_year: edu.graduation_year || new Date().getFullYear(),
            })),
          }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWizardData = async (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
    
    // Auto-save profile and talent profile data to Supabase
    if (user?.id) {
      await saveCurrentData({ ...wizardData, ...updates });
    }
  };

  // Save profile and talent profile data to Supabase
  const saveCurrentData = async (data: WizardData) => {
    if (!user?.id) return;

    try {
      const { toast } = await import('@/hooks/use-toast');
      
      // Update profiles table
      const profileUpdates = {
        country: data.country,
        city: data.city,
        hide_location: data.hide_location,
        phone: data.phone,
        social_links: data.social_links,
        video_presentation_url: data.video_presentation_url,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
      }

      // Upsert talent profile with FK error handling
      const talentProfileData = {
        user_id: user.id,
        primary_category_id: data.primary_category_id || null,
        secondary_category_id: data.secondary_category_id || null,
        title: data.title,
        experience_level: data.experience_level,
        bio: data.bio,
        skills: data.skills,
        industries_of_interest: data.industries_of_interest,
        portfolio_url: data.portfolio_url,
        hourly_rate_min: data.hourly_rate_min,
        hourly_rate_max: data.hourly_rate_max,
        currency: data.currency,
        availability: data.availability,
      };

      const { data: existingTalentProfile } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingTalentProfile) {
        const { error: talentError } = await supabase
          .from('talent_profiles')
          .update(talentProfileData)
          .eq('user_id', user.id);

        if (talentError && talentError.code === '23503' && talentError.message?.includes('secondary_category_id')) {
          // Retry without secondary_category_id if FK constraint fails
          const { error: retryError } = await supabase
            .from('talent_profiles')
            .update({ ...talentProfileData, secondary_category_id: null })
            .eq('user_id', user.id);
          if (retryError) {
            console.error('Error updating talent profile (retry):', retryError);
            return;
          }
        } else if (talentError) {
          console.error('Error updating talent profile:', talentError);
          return;
        }
      } else {
        const { error: talentError } = await supabase
          .from('talent_profiles')
          .insert(talentProfileData);

        if (talentError && talentError.code === '23503' && talentError.message?.includes('secondary_category_id')) {
          // Retry without secondary_category_id if FK constraint fails
          const { error: retryError } = await supabase
            .from('talent_profiles')
            .insert({ ...talentProfileData, secondary_category_id: null });
          if (retryError) {
            console.error('Error creating talent profile (retry):', retryError);
            return;
          }
        } else if (talentError) {
          console.error('Error creating talent profile:', talentError);
          return;
        }
      }

      // Get the talent profile ID for work experience and education
      const { data: talentProfile } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (talentProfile) {
        // Save work experience
        if (data.work_experience.length > 0) {
          // Delete existing work experience
          await supabase
            .from('work_experience')
            .delete()
            .eq('talent_profile_id', talentProfile.id);

          // Insert new work experience
          const workExperienceData = data.work_experience.map(exp => ({
            talent_profile_id: talentProfile.id,
            company: exp.company,
            position: exp.position,
            description: exp.description,
            start_date: exp.start_date,
            end_date: exp.end_date || null,
            is_current: exp.is_current,
          }));

          const { error: workError } = await supabase
            .from('work_experience')
            .insert(workExperienceData);

          if (workError) {
            console.error('Error saving work experience:', workError);
          }
        }

        // Save education
        if (data.education.length > 0) {
          // Delete existing education
          await supabase
            .from('education')
            .delete()
            .eq('talent_profile_id', talentProfile.id);

          // Insert new education
          const educationData = data.education.map(edu => ({
            talent_profile_id: talentProfile.id,
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.field_of_study,
            description: edu.description || '',
            graduation_year: edu.graduation_year,
          }));

          const { error: eduError } = await supabase
            .from('education')
            .insert(educationData);

          if (eduError) {
            console.error('Error saving education:', eduError);
          }
        }
      }

    } catch (error) {
      console.error('Error saving wizard data:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const canProceedToNext = () => {
    const step = steps[currentStep];
    return step.isCompleted || step.isOptional;
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data: wizardData,
      updateData: updateWizardData,
      categories,
      industries,
      onNext: nextStep,
      onPrev: prevStep,
    };

    switch (steps[currentStep].id) {
      case 'basic-info':
        return <BasicInfoStep {...stepProps} />;
      case 'professional-info':
        return <ProfessionalInfoStep {...stepProps} />;
      case 'skills':
        return <SkillsAndExperienceStep {...stepProps} />;
      case 'work-experience':
        return <WorkExperienceStep {...stepProps} />;
      case 'education':
        return <EducationStep {...stepProps} />;
      case 'multimedia':
        return <MultimediaStep {...stepProps} />;
      case 'social-links':
        return <SocialLinksStep {...stepProps} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
            <Button onClick={nextStep} className="mt-4">
              Continuar
            </Button>
          </div>
        );
    }
  };

  if (dataLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando perfil profesional...</p>
        </div>
      </div>
    );
  }

  const requiredSteps = steps.filter(step => !step.isOptional);
  const completedRequiredSteps = requiredSteps.filter(step => step.isCompleted).length;
  const progressPercentage = Math.min((completedRequiredSteps / requiredSteps.length) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Perfil Profesional</h1>
        <p className="text-muted-foreground">
          Completa tu perfil para destacar entre los mejores talentos
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso General</span>
              <Badge variant={completeness >= 80 ? 'default' : 'secondary'}>
                {completeness}% Completo
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Navigation arrows */}
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('steps-container');
                  if (container) {
                    const cardWidth = 268; // w-64 + gap
                    container.scrollLeft -= cardWidth;
                  }
                }}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Paso {currentStep + 1} de {steps.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('steps-container');
                  if (container) {
                    const cardWidth = 268; // w-64 + gap
                    container.scrollLeft += cardWidth;
                  }
                }}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Steps container - Always horizontal scroll */}
            <div 
              id="steps-container"
              className="overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              <div className="flex gap-3 min-w-max px-1">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`flex-shrink-0 w-64 p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                      currentStep === index
                        ? 'border-primary bg-primary/5'
                        : step.isCompleted
                        ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                        : 'border-muted bg-background'
                    }`}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        currentStep === index
                          ? 'bg-primary text-primary-foreground'
                          : step.isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.isCompleted ? <Check className="h-4 w-4" /> : step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{step.description}</p>
                        {step.isOptional && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Opcional
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex space-x-2">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedToNext()}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={async () => {
                try {
                  // Final save and refresh completeness
                  await saveCurrentData(wizardData);
                  await refreshCompleteness();
                  
                  const { toast } = await import('@/hooks/use-toast');
                  toast({
                    title: "¡Perfil completado!",
                    description: "Tu perfil profesional ha sido guardado exitosamente.",
                  });
                  
                   // Clean localStorage flags to prevent redirection loops
                   try {
                     localStorage.removeItem('onboarding.returnToStep');
                     localStorage.removeItem('onboarding.currentStep');
                   } catch {}
                   
                   onComplete?.();
                   // Navigate to onboarding or dashboard
                   navigate('/onboarding');
                } catch (error) {
                  console.error('Error completing wizard:', error);
                  const { toast } = await import('@/hooks/use-toast');
                  toast({
                    title: "Error",
                    description: "Hubo un error al guardar tu perfil. Inténtalo de nuevo.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Finalizar Wizard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};