import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CompanyOnboardingStep1 from '@/components/CompanyOnboardingStep1';
import CompanyOnboardingStep2 from '@/components/CompanyOnboardingStep2';
import CompanyOnboardingStep3 from '@/components/CompanyOnboardingStep3';
import CompanyOnboardingStep4 from '@/components/CompanyOnboardingStep4';

interface CompanyData {
  name: string;
  isIndividual: boolean;
}

interface CompanyDetails {
  description: string;
  url: string;
  location: string;
  logo?: File | null;
  businessTypes?: string[];
}

interface UserProfile {
  professionalTitle: string;
  linkedinUrl: string;
  phoneNumber: string;
  country: string;
  countryCode: string;
  profilePhoto?: File | null;
}

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    isIndividual: false
  });
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    description: '',
    url: '',
    location: '',
    logo: null,
    businessTypes: []
  });
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    professionalTitle: '',
    linkedinUrl: '',
    phoneNumber: '',
    country: '',
    countryCode: '+57',
    profilePhoto: null
  });

  const handleCompanyNameChange = (name: string) => {
    setCompanyData(prev => ({ ...prev, name }));
  };

  const handleIndividualChange = (isIndividual: boolean) => {
    setCompanyData(prev => ({ ...prev, isIndividual }));
  };

  const handleCompanyDetailsChange = (details: CompanyDetails) => {
    setCompanyDetails(details);
  };

  const handleLogoChange = (logo: File | null) => {
    setCompanyDetails(prev => ({ ...prev, logo }));
  };

  const handleStep1Complete = (data: CompanyData) => {
    setCompanyData(data);
    setCurrentStep(2);
  };

  const handleUserProfileChange = (profile: UserProfile) => {
    setCurrentUserProfile(profile);
  };

  const handleProfilePhotoChange = (photo: File | null) => {
    setCurrentUserProfile(prev => ({ ...prev, profilePhoto: photo }));
  };

  const handleStep2Complete = (data: CompanyDetails) => {
    setCompanyDetails(data);
    setCurrentStep(3);
  };

  const handleStep3CompleteLater = async (data: CompanyDetails) => {
    console.log('handleStep3CompleteLater called with data:', data);
    console.log('Current companyData:', companyData);
    console.log('Current companyDetails:', companyDetails);
    
    setCompanyDetails(data);
    
    // Guardar los datos de la empresa y navegar al dashboard
    if (!user) {
      toast.error('Debes estar autenticado para completar el onboarding');
      return;
    }
    
    try {
      // 1. Verificar si la empresa ya existe, si no, crearla o actualizarla
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCompany) {
        // Actualizar empresa existente
        const companyUpdates: any = {
          name: companyData.name,
          business_type: companyData.isIndividual ? null : 'company',
          description: companyData.isIndividual 
            ? 'Contratación individual' 
            : (companyDetails.description || ''),
          updated_at: new Date().toISOString()
        };
        
        if (data.url) {
          companyUpdates.website = data.url;
        }
        
        if (data.location) {
          companyUpdates.location = data.location;
        }

        // Usar el primer tipo de negocio como industry si existe (solo si no es individual)
        if (!companyData.isIndividual && companyDetails.businessTypes && companyDetails.businessTypes.length > 0) {
          companyUpdates.industry = companyDetails.businessTypes[0];
        }

        // Subir logo si existe
        if (data.logo) {
          const fileExt = data.logo.name.split('.').pop();
          const fileName = `${user.id}-company-logo.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, data.logo, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            companyUpdates.logo_url = publicUrl;
          }
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update(companyUpdates)
          .eq('id', existingCompany.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Crear nueva empresa
        const companyInsert: any = {
          user_id: user.id,
          name: companyData.name,
          business_type: companyData.isIndividual ? null : 'company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (companyDetails.description) {
          companyInsert.description = companyDetails.description;
        }
        
        if (data.url) {
          companyInsert.website = data.url;
        }
        
        if (data.location) {
          companyInsert.location = data.location;
        }

        // Usar el primer tipo de negocio como industry si existe
        if (companyDetails.businessTypes && companyDetails.businessTypes.length > 0) {
          companyInsert.industry = companyDetails.businessTypes[0];
        }

        // Subir logo si existe
        if (data.logo) {
          const fileExt = data.logo.name.split('.').pop();
          const fileName = `${user.id}-company-logo.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, data.logo, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            companyInsert.logo_url = publicUrl;
          }
        }

        const { error: insertError } = await supabase
          .from('companies')
          .insert(companyInsert);

        if (insertError) {
          throw insertError;
        }
      }
      
      toast.success('¡Información de empresa guardada exitosamente!');
      
      // Redirigir al dashboard de empresa
      navigate('/business-dashboard');
    } catch (error: any) {
      console.error('Error saving company data:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error(`Error al guardar los datos: ${error.message || 'Error desconocido'}. Inténtalo de nuevo.`);
    }
  };

  const handleStep3Continue = (data: CompanyDetails) => {
    setCompanyDetails(data);
    setCurrentStep(4);
  };

  const handleStep4Complete = async (data: UserProfile) => {
    setCurrentUserProfile(data);
    
    if (!user) {
      toast.error('Debes estar autenticado para completar el onboarding');
      return;
    }
    
    try {
      // 1. Verificar si la empresa ya existe, si no, crearla o actualizarla
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCompany) {
        // Actualizar empresa existente
        const companyUpdates: any = {
          name: companyData.name,
          business_type: companyData.isIndividual ? null : 'company',
          updated_at: new Date().toISOString()
        };

        if (companyDetails.description) {
          companyUpdates.description = companyDetails.description;
        }
        
        if (companyDetails.url) {
          companyUpdates.website = companyDetails.url;
        }
        
        if (companyDetails.location) {
          companyUpdates.location = companyDetails.location;
        }

        // Subir logo si existe
        if (companyDetails.logo) {
          const fileExt = companyDetails.logo.name.split('.').pop();
          const fileName = `${user.id}-company-logo.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, companyDetails.logo, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            companyUpdates.logo_url = publicUrl;
          }
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update(companyUpdates)
          .eq('id', existingCompany.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Crear nueva empresa
        const companyInsert: any = {
          user_id: user.id,
          name: companyData.name,
          business_type: companyData.isIndividual ? null : 'company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (companyDetails.description) {
          companyInsert.description = companyDetails.description;
        }
        
        if (companyDetails.url) {
          companyInsert.website = companyDetails.url;
        }
        
        if (companyDetails.location) {
          companyInsert.location = companyDetails.location;
        }

        // Subir logo si existe
        if (companyDetails.logo) {
          const fileExt = companyDetails.logo.name.split('.').pop();
          const fileName = `${user.id}-company-logo.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, companyDetails.logo, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            companyInsert.logo_url = publicUrl;
          }
        }

        const { error: insertError } = await supabase
          .from('companies')
          .insert(companyInsert);

        if (insertError) {
          throw insertError;
        }
      }
      
      // 2. Actualizar el perfil del usuario en user_metadata
      const metadataUpdates: any = {
        ...user.user_metadata,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        updated_at: new Date().toISOString()
      };
      
      if (data.professionalTitle) {
        metadataUpdates.professional_title = data.professionalTitle;
      }
      
      if (data.linkedinUrl) {
        metadataUpdates.linkedin_url = data.linkedinUrl;
      }
      
      if (data.phoneNumber) {
        metadataUpdates.phone = data.phoneNumber;
      }
      
      if (data.country) {
        metadataUpdates.country = data.country;
      }
      
      if (data.countryCode) {
        metadataUpdates.country_code = data.countryCode;
      }
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });
      
      if (metadataError) {
        throw metadataError;
      }
      
      // 3. Subir foto de perfil si existe
      if (data.profilePhoto) {
        const fileExt = data.profilePhoto.name.split('.').pop();
        const fileName = `${user.id}-profile.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, data.profilePhoto, { upsert: true });
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          
          // Actualizar avatar_url en user_metadata
          await supabase.auth.updateUser({
            data: {
              ...metadataUpdates,
              avatar_url: publicUrl
            }
          });
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
      navigate('/user-selector');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-4">Debes confirmar tu email para acceder al onboarding de empresa.</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/auth')}>
              Iniciar Sesión
            </Button>
            <Button variant="outline" onClick={() => navigate('/register-business')}>
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="font-medium text-slate-900 font-['Inter']" style={{fontSize: '14px'}}>Configuración de cuenta de contratación</span>
            </div>
          </div>

          {/* Main Content - TODOS LOS PASOS CENTRADOS SIN COLUMNA DERECHA */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            <div className="flex justify-center">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
                {currentStep === 1 && (
                  <CompanyOnboardingStep1
                    onComplete={handleStep1Complete}
                    initialData={companyData}
                    onCompanyNameChange={handleCompanyNameChange}
                    onIndividualChange={handleIndividualChange}
                  />
                )}
                {currentStep === 2 && (
                  <CompanyOnboardingStep2
                    onComplete={handleStep2Complete}
                    initialData={companyDetails}
                    companyName={companyData.name}
                    onDetailsChange={handleCompanyDetailsChange}
                  />
                )}
                {currentStep === 3 && (
                  <CompanyOnboardingStep3
                    onComplete={handleStep3Continue}
                    onCompleteLater={handleStep3CompleteLater}
                    initialData={companyDetails}
                    onDetailsChange={handleCompanyDetailsChange}
                    onLogoChange={handleLogoChange}
                  />
                )}
                {currentStep === 4 && (
                  <CompanyOnboardingStep4
                    onComplete={handleStep4Complete}
                    initialData={currentUserProfile}
                    onProfileChange={handleUserProfileChange}
                    onProfilePhotoChange={handleProfilePhotoChange}
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

export default CompanyOnboarding;