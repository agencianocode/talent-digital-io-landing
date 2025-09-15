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
    phoneNumber: ''
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Cambiar tipo de cuenta' : 'Atrás'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <span className="font-medium">Configuración de cuenta empresarial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="space-y-6">
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
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Company Logo Placeholder */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {companyData.name || 'Nombre de empresa'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {companyData.isIndividual ? 'Contratando como individuo' : 'Empresa'}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t" />

                  {/* Additional Info Placeholders */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>Información adicional</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Detalles de contacto</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="w-4 h-4" />
                      <span>Configuración de perfil</span>
                    </div>
                  </div>

                  {/* Profile Preview for Step 2 */}
                  {currentStep === 2 && (
                    <>
                      <div className="border-t" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{user?.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {profileData.professionalTitle || 'Título profesional'}
                            </p>
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
