import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TalentOnboardingStep1 from '../components/TalentOnboardingStep1';
import TalentOnboardingStep2 from '../components/TalentOnboardingStep2';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';

interface TalentProfile {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  phoneCountryCode: string;
  profilePhoto?: File | null;
  profilePhotoUrl?: string | null;
}

interface ProfessionalInfo {
  category: string;
  category2?: string;
  title: string;
  experienceLevel: string;
  bio: string;
  skills: string[];
}

const TalentOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [talentProfile, setTalentProfile] = useState<TalentProfile>({
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    phoneCountryCode: '+57',
    profilePhoto: null,
    profilePhotoUrl: null
  });
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    category: '',
    category2: '',
    title: '',
    experienceLevel: '',
    bio: '',
    skills: []
  });

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acceso Requerido</h1>
          <p className="text-muted-foreground mb-6">
            Debes confirmar tu email para acceder al onboarding de talento.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/auth')} variant="default">
              Iniciar Sesión
            </Button>
            <Button onClick={() => navigate('/register-talent')} variant="outline">
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleStep1Complete = (data: TalentProfile) => {
    setTalentProfile(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = async (data: ProfessionalInfo) => {
    console.log('🚀 STEP 2 COMPLETE - Starting process...');
    
    try {
      console.log('🔍 Setting professional info...');
      setProfessionalInfo(data);
      
      // Get user from session to save basic info
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Save to talent_profiles table
        const { error: talentProfileError } = await supabase
          .from('talent_profiles')
          .upsert({
            user_id: session.user.id,
            first_name: talentProfile.firstName,
            last_name: talentProfile.lastName,
            full_name: `${talentProfile.firstName} ${talentProfile.lastName}`.trim(),
            country: talentProfile.country,
            phone: talentProfile.phone,
            phone_country_code: talentProfile.phoneCountryCode,
            avatar_url: talentProfile.profilePhotoUrl,
            category: data.category,
            category2: data.category2,
            title: data.title,
            experience_level: data.experienceLevel,
            bio: data.bio,
            skills: data.skills
          });

        if (talentProfileError) {
          console.error('Error saving talent profile:', talentProfileError);
        } else {
          console.log('✅ Talent profile saved successfully');
        }

        // Also save basic info to user_metadata for compatibility
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: talentProfile.firstName,
            last_name: talentProfile.lastName,
            full_name: `${talentProfile.firstName} ${talentProfile.lastName}`.trim(),
            country: talentProfile.country,
            phone: talentProfile.phone,
            phone_country_code: talentProfile.phoneCountryCode,
            avatar_url: talentProfile.profilePhotoUrl
          }
        });
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        } else {
          console.log('✅ User metadata updated successfully');
        }
      }
      
      console.log('🚀 SUCCESS! Navigating to dashboard...');
      toast.success('¡Perfil completado exitosamente!');
      
      // Navigate immediately to dashboard
      console.log('🚀 Attempting navigation to /talent-dashboard...');
      navigate('/talent-dashboard');
      console.log('🚀 Navigation called!');
      
    } catch (error) {
      console.error('🚀 ERROR in process:', error);
      toast.error('Error al completar el perfil. Intenta nuevamente.');
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigate('/user-selector');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Cambiar el tipo de cuenta
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              Configuración de cuenta de Talento
            </h1>
            <div className="w-32" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-border">
          {/* Steppers */}
          <div className="border-b border-border px-8 py-6">
            <div className="flex items-center justify-center space-x-8">
              {/* Step 1 */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <User className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">Perfil Personal</div>
                  <div className="text-xs text-muted-foreground">Paso {currentStep}/2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {currentStep === 1 && (
              <TalentOnboardingStep1
                onComplete={handleStep1Complete}
                initialData={talentProfile}
              />
            )}
            {currentStep === 2 && (
              <TalentOnboardingStep2
                onComplete={handleStep2Complete}
                initialData={professionalInfo}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentOnboarding;