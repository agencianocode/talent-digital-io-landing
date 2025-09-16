import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Camera, Globe, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CompanyOnboardingStep1 from '@/components/CompanyOnboardingStep1';
import CompanyOnboardingStep2 from '@/components/CompanyOnboardingStep2';

interface CompanyData {
  name: string;
  isIndividual: boolean;
}

interface ProfileData {
  professionalTitle: string;
  linkedinUrl: string;
  phoneNumber: string;
  location: string;
  profilePhoto?: File;
}

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    isIndividual: false
  });
  const [profileData, setProfileData] = useState<ProfileData>({
    professionalTitle: '',
    linkedinUrl: '',
    phoneNumber: '',
    location: ''
  });

  const handleStep1Complete = (data: CompanyData) => {
    setCompanyData(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = async (data: ProfileData) => {
    setProfileData(data);
    
    if (!user) {
      toast.error('Debes estar autenticado para completar el onboarding');
      return;
    }
    
    try {
      // 1. Crear la empresa
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: companyData.name,
          business_type: companyData.isIndividual ? 'individual' : 'company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (companyError) {
        throw companyError;
      }
      
      // 2. Actualizar el perfil del usuario
      const profileUpdates: any = {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        updated_at: new Date().toISOString()
      };
      
      if (data.professionalTitle) {
        profileUpdates.professional_title = data.professionalTitle;
      }
      
      if (data.linkedinUrl) {
        profileUpdates.linkedin_url = data.linkedinUrl;
      }
      
      if (data.phoneNumber) {
        profileUpdates.phone = data.phoneNumber;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // 3. Subir foto de perfil si existe
      if (data.profilePhoto) {
        const fileExt = data.profilePhoto.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, data.profilePhoto);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          
          await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('user_id', user.id);
        }
      }
      
      toast.success('¡Onboarding completado exitosamente!');
      
      // Redirigir al dashboard de empresa
      navigate('/business-dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Error al guardar los datos. Inténtalo de nuevo.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Cambiar tipo de cuenta' : 'Atrás'}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-md flex items-center justify-center">
                <span className="text-white dark:text-slate-900 text-sm font-bold">C</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-white">Configuración de cuenta empresarial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side - Form */}
          <div className="space-y-8">
            {currentStep === 1 && (
              <CompanyOnboardingStep1
                onComplete={handleStep1Complete}
                initialData={companyData}
              />
            )}
            {currentStep === 2 && (
              <CompanyOnboardingStep2
                onComplete={handleStep2Complete}
                initialData={profileData}
                companyName={companyData.name}
              />
            )}
          </div>

          {/* Right Side - Preview Card */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {currentStep === 1 ? (
                    <>
                      {/* Company Preview for Step 1 */}
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                          <Camera className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {companyData.name || 'Nombre de empresa'}
                          </h3>
                          <div className="flex items-center justify-center gap-1 mt-2 text-slate-500 dark:text-slate-400">
                            <Globe className="w-4 h-4" />
                            <span className="text-sm">
                              {companyData.isIndividual ? 'Individuo' : 'Empresa'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-200 dark:border-slate-600 pt-6">
                        <div className="space-y-3 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span>Ubicación</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Profile Preview for Step 2 */}
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-2xl font-bold">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            UBICACIÓN
                          </div>
                          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4" />
                            <span>Por configurar</span>
                          </div>
                        </div>

                        {profileData.professionalTitle && (
                          <div className="text-center border-t border-slate-200 dark:border-slate-600 pt-4">
                            <div className="flex items-center justify-center gap-2">
                              <Building className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {profileData.professionalTitle} en {companyData.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {companyData.name}.com
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-center">
                          <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            ENLACES
                          </div>
                          <div className="flex justify-center">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboarding;
