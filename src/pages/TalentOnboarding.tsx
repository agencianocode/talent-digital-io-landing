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

  const handleStep1Complete = async (data: TalentProfile) => {
    console.log('🚀 STEP 1 COMPLETE - Data received:', data);
    
    try {
      // Get user session to save data immediately
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Upload profile photo if exists
        let avatarUrl: string | null = null;
        if (data.profilePhoto) {
          console.log('📸 Uploading profile photo in Step 1...');
          const fileExt = data.profilePhoto.name.split('.').pop();
          const fileName = `${session.user.id}/avatar.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, data.profilePhoto, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            
            avatarUrl = publicUrl;
            console.log('📸 Photo uploaded successfully in Step 1:', publicUrl);
          } else {
            console.error('❌ Photo upload error in Step 1:', uploadError);
          }
        }
        
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        
        // Save to profiles table IMMEDIATELY
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: session.user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            phone: data.phone,
            country: data.country,
            city: data.city,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error('❌ Error saving profile in Step 1:', profileError);
        } else {
          console.log('✅ Profile saved successfully in Step 1');
        }
        
        // Also update auth user metadata IMMEDIATELY
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: fullName,
            avatar_url: avatarUrl,
            country: data.country,
            city: data.city,
            phone: data.phone,
            phone_country_code: data.phoneCountryCode
          }
        });

        if (metadataError) {
          console.error('❌ Error updating user metadata in Step 1:', metadataError);
        } else {
          console.log('✅ User metadata updated successfully in Step 1');
        }

        // Update academy_students if applicable
        if (session.user.email) {
          await supabase
            .from('academy_students')
            .update({ student_name: fullName })
            .eq('student_email', session.user.email)
            .eq('student_name', session.user.email);
        }
      }
    } catch (error) {
      console.error('❌ Error in handleStep1Complete:', error);
      // Don't block navigation on error, just log it
    }
    
    setTalentProfile(data);
    setCurrentStep(2);
  };

  // Mapear el valor del formulario al valor que acepta la base de datos
  // La base de datos acepta: '0-1', '1-3', '3-6', '6+' (según TalentEditProfile.tsx)
  const mapExperienceLevel = (formValue: string): string => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TalentOnboarding.tsx:83',message:'mapExperienceLevel called',data:{formValue,formValueType:typeof formValue,formValueLength:formValue?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const mapping: Record<string, string> = {
      'Principiante: 0-1 año': '0-1',
      'Intermedio: 1-3 años': '1-3',
      'Avanzado: 3-6 años': '3-6',
      'Experto: +6 años': '6+'
    };
    
    // #region agent log
    const mappedValue = mapping[formValue] || formValue;
    fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TalentOnboarding.tsx:95',message:'mapExperienceLevel result',data:{formValue,mappedValue,hasMapping:!!mapping[formValue]},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    return mappedValue;
  };

  const handleStep2Complete = async (data: ProfessionalInfo) => {
    console.log('🚀 STEP 2 COMPLETE - Starting process...');
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TalentOnboarding.tsx:93',message:'handleStep2Complete entry',data:{experience:data.experience,experienceType:typeof data.experience},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    try {
      console.log('🔍 Setting professional info...');
      setProfessionalInfo(data);
      
      // Get user from session to save basic info
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const mappedExperience = mapExperienceLevel(data.experience);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TalentOnboarding.tsx:112',message:'Before upsert talent_profiles',data:{originalExperience:data.experience,mappedExperience,userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // Save to talent_profiles table with title, bio, skills, and experience_level
        const { error: talentProfileError } = await supabase
          .from('talent_profiles')
          .upsert({
            user_id: session.user.id,
            title: data.title,
            bio: data.bio,
            skills: data.skills,
            experience_level: mappedExperience,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TalentOnboarding.tsx:125',message:'After upsert talent_profiles',data:{error:talentProfileError?.message,errorCode:talentProfileError?.code,experienceLevelSent:mappedExperience},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion

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
            category: data.category,
            category2: data.category2 || null,
            title: data.title,
            experience_level: mapExperienceLevel(data.experience),
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
        let avatarUrl = null;
        if (talentProfile.profilePhoto) {
          console.log('📸 Uploading profile photo...');
          const fileExt = talentProfile.profilePhoto.name.split('.').pop();
          const fileName = `${session.user.id}/avatar.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, talentProfile.profilePhoto, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            
            avatarUrl = publicUrl;
            console.log('📸 Photo uploaded successfully:', publicUrl);
          } else {
            console.error('❌ Photo upload error:', uploadError);
          }
        }
        
        // Always update profiles table with ALL data (including avatar if uploaded)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: session.user.id,
            full_name: `${talentProfile.firstName} ${talentProfile.lastName}`.trim(),
            avatar_url: avatarUrl,
            phone: talentProfile.phone,
            country: talentProfile.country,
            city: talentProfile.city,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error('❌ Error updating profile:', profileError);
        } else {
          console.log('✅ Profile updated successfully', avatarUrl ? 'with photo' : 'without photo');
        }
        
        // Update user metadata with avatar_url if photo was uploaded
        if (avatarUrl) {
          await supabase.auth.updateUser({
            data: {
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString()
            }
          });
        }

        // Actualizar academy_students si el usuario vino de una invitación de academia
        // y su nombre actual es el email (placeholder temporal)
        const fullName = `${talentProfile.firstName} ${talentProfile.lastName}`.trim();
        if (session.user.email) {
          const { error: academyUpdateError } = await supabase
            .from('academy_students')
            .update({ student_name: fullName })
            .eq('student_email', session.user.email)
            .eq('student_name', session.user.email); // Solo actualizar si el nombre actual es el email

          if (academyUpdateError) {
            console.error('Error updating academy student name:', academyUpdateError);
          } else {
            console.log('✅ Academy student name updated (if applicable)');
          }
        }

        // Verificar si hay una oportunidad pendiente para redirigir
        const pendingOpportunity = localStorage.getItem('pending_opportunity');
        const postOnboardingRedirect = sessionStorage.getItem('post_onboarding_redirect');
        
        if (pendingOpportunity) {
          // Limpiar el storage
          localStorage.removeItem('pending_opportunity');
          sessionStorage.removeItem('post_onboarding_redirect');
          
          toast.success('¡Onboarding completado! Te llevamos a la oportunidad que te interesaba.');
          navigate(`/talent-dashboard/opportunities/${pendingOpportunity}`);
        } else if (postOnboardingRedirect && postOnboardingRedirect.includes('/opportunity/')) {
          // Extraer el ID de la URL de redirect
          const opportunityId = postOnboardingRedirect.split('/opportunity/')[1];
          sessionStorage.removeItem('post_onboarding_redirect');
          
          toast.success('¡Onboarding completado! Te llevamos a la oportunidad que te interesaba.');
          navigate(`/talent-dashboard/opportunities/${opportunityId}`);
        } else {
          toast.success('¡Onboarding completado exitosamente!');
          navigate('/talent-dashboard');
        }
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentOnboarding;