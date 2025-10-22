import { useState } from 'react';
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
  city: string;
  phone: string;
  phoneCountryCode: string;
  profilePhoto?: File | null;
  profilePhotoUrl?: string | null;
}

interface ProfessionalInfo {
  category: string;
  category2?: string;
  title: string;
  experience: string;
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
    city: '',
    phone: '',
    phoneCountryCode: '+57',
    profilePhoto: null,
    profilePhotoUrl: null
  });
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    category: '',
    category2: '',
    title: '',
    experience: '',
    bio: '',
    skills: []
  });

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-4">Debes confirmar tu email para acceder al onboarding de talento.</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/auth')}>
              Iniciar Sesión
            </Button>
            <Button variant="outline" onClick={() => navigate('/register-talent')}>
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleStep1Complete = (data: TalentProfile) => {
    console.log('🚀 STEP 1 COMPLETE - Data received:', data);
    setTalentProfile(data);
    console.log('🚀 STEP 1 COMPLETE - Setting currentStep to 2');
    setCurrentStep(2);
    console.log('🚀 STEP 1 COMPLETE - currentStep should now be 2');
  };

  const handleStep2Complete = async (data: ProfessionalInfo) => {
    console.log('🚀 STEP 2 COMPLETE - Starting process...');
    
    try {
      console.log('🔍 Setting professional info...');
      setProfessionalInfo(data);
      
      // Get user from session to save basic info
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Save to talent_profiles table (only user_id to mark completion)
        const { error: talentProfileError } = await supabase
          .from('talent_profiles')
          .upsert({
            user_id: session.user.id,
            updated_at: new Date().toISOString()
          });

        if (talentProfileError) {
          console.error('❌ Error saving talent profile:', talentProfileError);
          throw talentProfileError;
        }

        console.log('✅ Talent profile saved successfully');

        // Save comprehensive user metadata
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            first_name: talentProfile.firstName,
            last_name: talentProfile.lastName,
            full_name: `${talentProfile.firstName} ${talentProfile.lastName}`.trim(),
            country: talentProfile.country,
            city: talentProfile.city,
            phone: talentProfile.phone,
            phone_country_code: talentProfile.phoneCountryCode,
            profile_photo_url: talentProfile.profilePhotoUrl,
            category: data.category,
            category2: data.category2 || null,
            title: data.title,
            experience_level: data.experience,
            bio: data.bio,
            skills: data.skills,
            updated_at: new Date().toISOString()
          }
        });

        if (metadataError) {
          console.error('❌ Error updating user metadata:', metadataError);
        } else {
          console.log('✅ User metadata updated successfully');
        }

        // Upload profile photo if exists
        if (talentProfile.profilePhoto) {
          const fileExt = talentProfile.profilePhoto.name.split('.').pop();
          const fileName = `${session.user.id}-profile.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, talentProfile.profilePhoto, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            
            // Update profiles table with comprehensive data
            await supabase
              .from('profiles')
              .upsert({
                user_id: session.user.id,
                full_name: `${talentProfile.firstName} ${talentProfile.lastName}`.trim(),
                profile_photo_url: publicUrl,
                phone: talentProfile.phone,
                country: talentProfile.country,
                city: talentProfile.city,
                updated_at: new Date().toISOString()
              });

            console.log('✅ Profile photo uploaded and saved');
          }
        } else {
          // Update profiles table even without photo
          await supabase
            .from('profiles')
            .upsert({
              user_id: session.user.id,
              full_name: `${talentProfile.firstName} ${talentProfile.lastName}`.trim(),
              phone: talentProfile.phone,
              country: talentProfile.country,
              city: talentProfile.city,
              updated_at: new Date().toISOString()
            });
        }

        toast.success('¡Onboarding completado exitosamente!');
        navigate('/talent-dashboard');
      } else {
        console.error('❌ No user session found');
        throw new Error('No user session found');
      }
    } catch (error: any) {
      console.error('❌ Error in handleStep2Complete:', error);
      toast.error(`Error al completar el onboarding: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 font-['Inter']">
      {/* Single Card Container - RESPONSIVE */}
      <div className="min-h-screen px-2 py-2 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-32px)] lg:min-h-[calc(100vh-48px)]">
          {/* Header Section - RESPONSIVE */}
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-[#f5f6fa] hover:bg-[#e8eaf0] rounded-lg px-3 py-2 sm:px-4 sm:py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline font-['Inter']" style={{fontSize: '13px'}}>{currentStep === 1 ? 'Cambiar el tipo de cuenta' : 'Atrás'}</span>
                <span className="sm:hidden font-['Inter']" style={{fontSize: '13px'}}>{currentStep === 1 ? 'Cambiar' : 'Atrás'}</span>
              </Button>
              <span className="font-medium text-slate-900 font-['Inter']" style={{fontSize: '14px'}}>Configuración de cuenta de Talento</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-8">
                {/* Perfil Personal */}
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      currentStep === 1 ? 'text-blue-600' : 'text-blue-600'
                    }`}>
                      Perfil Personal
                    </p>
                    <p className="text-xs text-gray-400">
                      Paso {currentStep}/2
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - CENTERED */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            <div className="flex justify-center">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
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
                {/* Debug info */}
                <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
                  Current Step: {currentStep}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentOnboarding;