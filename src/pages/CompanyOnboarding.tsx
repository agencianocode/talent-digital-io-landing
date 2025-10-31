import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const { refreshCompanies } = useCompany();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitation');

  const [currentStep, setCurrentStep] = useState(1);
  const [isInvitationFlow, setIsInvitationFlow] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(false);
  const [invitationData] = useState<{
    company_id: string;
    company_name: string;
    role: string;
    invited_email: string;
  } | null>(null);
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

  // Check if this is an invitation flow (UPDATE-only, sin SELECT)
  useEffect(() => {
    const effectiveInvitationId = invitationId || (user?.user_metadata?.pending_invitation ?? null);

    // Detectar si estamos en el flujo de Supabase (hash temporal)
    const hasSupabaseHash = typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token') || window.location.hash.includes('type=signup'));

    if (!user) {
      if (hasSupabaseHash) {
        console.log('⏳ Waiting for Supabase session to establish...');
        setAuthInitializing(true);

        const timeout = setTimeout(() => {
          console.log('⚠️ Session timeout - redirecting to auth');
          setAuthInitializing(false);
          navigate(effectiveInvitationId ? `/auth?invitation=${effectiveInvitationId}` : '/auth');
        }, 8000);

        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            console.log('✅ Session established');
            clearTimeout(timeout);
            setAuthInitializing(false);
          }
        });

        return () => clearTimeout(timeout);
      } else {
        navigate(effectiveInvitationId ? `/auth?invitation=${effectiveInvitationId}` : '/auth');
        return;
      }
    }

    const acceptInvitation = async () => {
      try {
        // Use RPC to accept invitation (bypasses RLS restrictions)
        const { data, error } = await supabase.rpc('accept_company_invitation', {
          p_invitation_id: effectiveInvitationId,
          p_user_id: user.id,
          p_email: user.email as string
        });

        if (error) {
          console.error('Error accepting invitation via RPC:', error);
        } else if (data && typeof data === 'object' && 'accepted' in data) {
          if (data.accepted === true) {
            // Invitation accepted successfully
            console.log('✅ Invitation accepted successfully via RPC');
            setIsInvitationFlow(true);

            // Clean up invitation metadata and mark onboarding as complete
            try {
              await supabase.auth.updateUser({
                data: {
                  pending_invitation: null,
                  invited_to_company: null,
                  onboarding_completed: true
                }
              });
            } catch (e) {
              console.warn('Metadata cleanup warning:', e);
            }

            // Refresh companies data
            try {
              await refreshCompanies();
            } catch (e) {
              console.warn('refreshCompanies error:', e);
            }

            // Navigate directly to business dashboard
            toast.success('Invitación aceptada. Redirigiendo al panel...');
            navigate('/business-dashboard');
            return;
          } else {
            // Invitation could not be accepted (invalid, expired, already used)
            console.log('⚠️ Invitation could not be accepted:', data);
            toast.error('La invitación no es válida o ya fue usada. Puedes crear tu propia empresa.');
            
            // Clean up invitation metadata but do NOT mark onboarding as complete
            try {
              await supabase.auth.updateUser({
                data: {
                  pending_invitation: null,
                  invited_to_company: null
                }
              });
            } catch (e) {
              console.warn('Metadata cleanup warning:', e);
            }
            
            // Continue with normal flow (user can complete onboarding)
          }
        }
      } catch (err) {
        console.error('Error processing invitation:', err);
      }
    };

    acceptInvitation();

    return undefined;
  }, [user, navigate, invitationId]);

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
    setCompanyDetails(data);
    
    if (!user) {
      toast.error('Debes estar autenticado para completar el onboarding');
      return;
    }
    
    try {
      // Check if company already exists
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCompany) {
        // Update existing company
        const companyUpdates: any = {
          name: companyData.name,
          business_type: companyData.isIndividual ? null : 'company',
          updated_at: new Date().toISOString()
        };

        if (data.description) {
          companyUpdates.description = data.description;
        }
        
        if (data.url) {
          companyUpdates.website = data.url;
        }
        
        if (data.location) {
          companyUpdates.location = data.location;
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update(companyUpdates)
          .eq('id', existingCompany.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new company
        const newCompanyData: any = {
          user_id: user.id,
          name: companyData.name,
          business_type: companyData.isIndividual ? null : 'company',
          description: data.description || '',
          website: data.url || '',
          location: data.location || ''
        };

        const { error: createError } = await supabase
          .from('companies')
          .insert([newCompanyData]);

        if (createError) {
          throw createError;
        }
      }
    } catch (error: any) {
      console.error('Error saving company data:', error);
      toast.error(`Error al guardar los datos: ${error.message || 'Error desconocido'}`);
      return;
    }
    
    setCurrentStep(4);
  };

  const handleStep3Continue = (data: CompanyDetails) => {
    setCompanyDetails(data);
    setCurrentStep(4);
  };

  const handleStep4Complete = async (data: UserProfile) => {
    console.log('CompanyOnboarding - handleStep4Complete called with data:', data);
    setCurrentUserProfile(data);
    
    if (!user) {
      console.log('CompanyOnboarding - No user found, aborting');
      toast.error('Debes estar autenticado para completar el onboarding');
      return;
    }
    
    console.log('CompanyOnboarding - Starting final step completion for user:', user.id);
    
    try {
      // Upload profile photo if exists
      let profilePhotoUrl = null;
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
          profilePhotoUrl = publicUrl;
        }
      }

      // Update user profile
      const profileUpdates: any = {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        phone: data.phoneNumber || null,
        country: data.country || null,
        updated_at: new Date().toISOString()
      };

      if (profilePhotoUrl) {
        profileUpdates.avatar_url = profilePhotoUrl;
      }

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileUpdates
        });

      if (profileUpdateError) {
        console.warn('Warning updating profiles table:', profileUpdateError);
      }

      // Update user metadata
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

      if (profilePhotoUrl) {
        metadataUpdates.avatar_url = profilePhotoUrl;
      }
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });
      
      if (metadataError) {
        throw metadataError;
      }

      // INVITATION FLOW: Just link user to company, don't create a new company
      if (isInvitationFlow && invitationData) {
        console.log('Invitation flow: Linking user to existing company');

        // Update invitation to accepted
        const { error: invitationError } = await supabase
          .from('company_user_roles')
          .update({
            user_id: user.id,
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('company_id', invitationData.company_id)
          .eq('user_id', user.id)
          .eq('status', 'pending');

        if (invitationError) {
          console.error('Invitation update error:', invitationError);
          throw invitationError;
        }

        // Update user role to business if needed
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData && roleData.role === 'talent') {
          await supabase
            .from('user_roles')
            .update({ role: 'freemium_business' })
            .eq('user_id', user.id);
        }

        // Update user metadata and clean up invitation metadata
        await supabase.auth.updateUser({
          data: {
            ...metadataUpdates,
            onboarding_completed: true,
            company_id: invitationData.company_id,
            pending_invitation: null,
            invited_to_company: null
          }
        });

        console.log('✅ User successfully joined company via invitation');

        toast.success(`¡Te has unido exitosamente a ${invitationData.company_name}!`);

        // Refresh companies and redirect
        try {
          await refreshCompanies();
        } catch (refreshError) {
          console.error('Error refreshing company context:', refreshError);
        }

        navigate('/business-dashboard');
        return;
      }

      // NORMAL FLOW: Create or update company
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCompany) {
        // Update existing company
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
        // Create new company
        const newCompanyInsert: any = {
          user_id: user.id,
          name: companyData.name,
          business_type: companyData.isIndividual ? null : 'company',
          description: companyDetails.description || '',
          website: companyDetails.url || '',
          location: companyDetails.location || ''
        };

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
            newCompanyInsert.logo_url = publicUrl;
          }
        }

        const { error: createError } = await supabase
          .from('companies')
          .insert([newCompanyInsert]);

        if (createError) {
          throw createError;
        }
      }
      
      // Ensure user has business role assigned
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'freemium_business'
        });

      if (roleError) {
        console.error('Error ensuring business role:', roleError);
      }
      
      toast.success('¡Onboarding completado exitosamente!');
      
      try {
        await refreshCompanies();
      } catch (refreshError) {
        console.error('Error refreshing company context:', refreshError);
      }
      
      navigate('/business-dashboard');
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      toast.error(`Error al guardar los datos: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show loader while waiting for auth to initialize
  if (authInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Verificando tu cuenta...</h2>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Autenticación requerida</h2>
          <p className="text-gray-600 mb-4">Por favor inicia sesión para continuar</p>
          <Button onClick={() => navigate('/auth')}>Ir a Inicio de Sesión</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-8">
          {currentStep > 1 && !isInvitationFlow && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {isInvitationFlow ? 'Completa tu Perfil' : 'Registro Empresarial'}
            </h1>
            <p className="text-muted-foreground">
              {isInvitationFlow 
                ? 'Completa tu información para unirte a la empresa'
                : 'Completa la información de tu empresa'
              }
            </p>
          </div>
        </div>

        {isInvitationFlow && invitationData && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <UserPlus className="h-4 w-4" />
            <AlertDescription>
              Te estás uniendo a <strong>{invitationData.company_name}</strong> como{' '}
              <strong>{invitationData.role === 'admin' ? 'Administrador' : invitationData.role === 'owner' ? 'Propietario' : 'Miembro'}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Steps Indicator - Only show if not invitation flow */}
        {!isInvitationFlow && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { number: 1, icon: Building2, label: 'Empresa' },
              { number: 2, icon: Building2, label: 'Detalles' },
              { number: 3, icon: Building2, label: 'Logo' },
              { number: 4, icon: User, label: 'Perfil' }
            ].map(({ number, icon: Icon, label }) => (
              <div key={number} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  currentStep >= number ? 'opacity-100' : 'opacity-40'
                }`}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-1
                    ${currentStep === number 
                      ? 'bg-primary text-primary-foreground' 
                      : currentStep > number
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </div>
                {number < 4 && (
                  <div className={`w-8 h-0.5 mx-1 mb-5 ${
                    currentStep > number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step Components */}
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
            companyName={companyData.name}
            initialData={companyDetails}
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
            isInvitationFlow={isInvitationFlow}
            invitationCompanyName={invitationData?.company_name}
          />
        )}
      </div>
    </div>
  );
};

export default CompanyOnboarding;
