import { useState, useEffect, useRef } from 'react';
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
  existingCompanyId?: string; // ID de empresa existente si se seleccionó una
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
  const { user, updateProfile } = useSupabaseAuth();
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
    isIndividual: false,
    existingCompanyId: undefined
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
  // Store accepted company id from RPC to avoid relying solely on metadata
  const [acceptedCompanyId, setAcceptedCompanyId] = useState<string | null>(null);

  // Protection against double invitation processing
  const invitationProcessedRef = useRef(false);

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
      // Check if already a member to avoid double RPC calls
      const { data: memberCheck } = await supabase
        .from('company_user_roles')
        .select('id, status, company_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (memberCheck) {
        console.log('✅ User already accepted invitation, skipping RPC');
        invitationProcessedRef.current = true;
        setIsInvitationFlow(true);
        setCurrentStep(4);
        return;
      }

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
            invitationProcessedRef.current = true;
            setIsInvitationFlow(true);

            // Store company_id for immediate use
            setAcceptedCompanyId((data as any).company_id ?? null);
            if ((data as any).company_id) {
              await supabase.auth.updateUser({
                data: {
                  pending_invitation: null,
                  invited_to_company: null,
                  company_id: (data as any).company_id
                }
              });
            }

            // Move directly to Step 4 (personal profile)
            setCurrentStep(4);
            toast.success('Invitación aceptada. Completa tu perfil para continuar.');
            return;
          } else {
            // Invitation could not be accepted
            console.log('⚠️ Invitation could not be accepted:', data);
            invitationProcessedRef.current = true;
            toast.error('La invitación no es válida o ya fue usada. Puedes crear tu propia empresa.');
            
            await supabase.auth.updateUser({
              data: {
                pending_invitation: null,
                invited_to_company: null
              }
            });
          }
        }
      } catch (err) {
        console.error('Error processing invitation:', err);
        invitationProcessedRef.current = true;
      }
    };

    if (!effectiveInvitationId || invitationProcessedRef.current) {
      return;
    }

    if (user.user_metadata?.onboarding_completed) {
      const timeout = setTimeout(() => {
        navigate('/business-dashboard');
      }, 100);
      return () => clearTimeout(timeout);
    }

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
    
    // Si seleccionó una empresa existente, saltar directamente al perfil personal (paso 4)
    if (data.existingCompanyId) {
      console.log('✅ Empresa existente seleccionada, saltando al paso 4 (perfil personal)');
      toast.info(`Te estás uniendo a ${data.name}. Completa tu perfil personal.`);
      setCurrentStep(4);
    } else {
      // Empresa nueva, continuar con detalles
      console.log('📝 Nueva empresa, continuando con paso 2 (detalles)');
      setCurrentStep(2);
    }
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

      // Prepare profile data
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
      
      const profileData: any = {
        full_name: fullName,
        phone: data.phoneNumber || null,
        country: data.country || null
      };

      if (profilePhotoUrl) {
        profileData.avatar_url = profilePhotoUrl;
      }

      // Use updateProfile from context to save everything at once and refresh state
      const { error: updateError } = await updateProfile(profileData);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Profile updated successfully via context');

      // INVITATION FLOW: User is joining an existing company
      if (isInvitationFlow) {
        console.log('Invitation flow: Completing user profile for existing company');

        // Get company_id from local state first, then metadata
        let companyId = acceptedCompanyId || user.user_metadata?.company_id;
        
        // Fallback: query company_user_roles if company_id not in metadata
        if (!companyId) {
          const { data: membershipData } = await supabase
            .from('company_user_roles')
            .select('company_id, accepted_at')
            .eq('user_id', user.id)
            .eq('status', 'accepted')
            .order('accepted_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          companyId = membershipData?.company_id;
        }
        
        if (companyId) {
          // Mark onboarding as complete
          await supabase.auth.updateUser({
            data: {
              onboarding_completed: true,
              company_id: companyId
            }
          });

          console.log('✅ User profile completed for invitation flow');

          // Get company name for success message
          const { data: companyInfo } = await supabase
            .from('companies')
            .select('name')
            .eq('id', companyId)
            .maybeSingle();

          toast.success(`¡Te has unido exitosamente a ${companyInfo?.name || 'la empresa'}!`);

          // Refresh companies and redirect once
          await refreshCompanies();
          navigate('/business-dashboard');
          return;
        } else {
          console.error('No company_id found for invitation flow');
          toast.error('Error al completar el onboarding. Por favor, intenta nuevamente.');
          return;
        }
      }

      // EXISTING COMPANY FLOW: User wants to join an existing company
      if (companyData.existingCompanyId) {
        console.log('🏢 Usuario seleccionó empresa existente:', {
          companyId: companyData.existingCompanyId,
          companyName: companyData.name
        });

        // 1. Obtener información de la empresa y su propietario
        const { data: companyInfo, error: companyError } = await supabase
          .from('companies')
          .select('id, name, user_id')
          .eq('id', companyData.existingCompanyId)
          .single();

        if (companyError || !companyInfo) {
          console.error('Error obteniendo información de la empresa:', companyError);
          toast.error('No se pudo encontrar la empresa seleccionada');
          return;
        }

        // 2. Verificar si ya existe una solicitud pendiente o aceptada
        const { data: existingRequest } = await supabase
          .from('company_user_roles')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('company_id', companyData.existingCompanyId)
          .maybeSingle();

        if (existingRequest) {
          if (existingRequest.status === 'accepted') {
            toast.info('Ya eres miembro de esta empresa');
            navigate('/business-dashboard');
            return;
          } else if (existingRequest.status === 'pending') {
            toast.info('Ya tienes una solicitud pendiente para esta empresa');
            navigate('/business-dashboard');
            return;
          }
        }

        // 3. Crear solicitud de membresía usando Edge Function (evita problemas de RLS con triggers)
        console.log('📝 Creando solicitud de membresía via Edge Function...');
        const { data: membershipResult, error: membershipError } = await supabase.functions.invoke('request-membership', {
          body: {
            companyId: companyData.existingCompanyId,
            userId: user.id,
            userEmail: user.email
          }
        });

        if (membershipError) {
          console.error('Error creando solicitud de membresía:', membershipError);
          toast.error('Error al enviar solicitud a la empresa');
          return;
        }

        // Check if user already member or has pending request
        if (membershipResult?.alreadyMember) {
          toast.info('Ya eres miembro de esta empresa');
          navigate('/business-dashboard');
          return;
        }

        if (membershipResult?.pendingRequest) {
          toast.info('Ya tienes una solicitud pendiente para esta empresa');
          navigate('/business-dashboard');
          return;
        }

        if (!membershipResult?.success) {
          console.error('Error en respuesta de membership:', membershipResult);
          toast.error(membershipResult?.error || 'Error al enviar solicitud a la empresa');
          return;
        }

        console.log('✅ Solicitud de membresía creada:', membershipResult);

        // 4. Obtener información del propietario desde la respuesta de la Edge Function
        const companyOwnerId = membershipResult.company?.ownerId || companyInfo.user_id;

        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('full_name, user_id')
          .eq('user_id', companyOwnerId)
          .single();

        const requesterName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Un usuario';

        // 5. Crear notificación para el propietario
        await supabase
          .from('notifications')
          .insert({
            user_id: companyInfo.user_id,
            type: 'membership_request',
            title: 'Nueva solicitud para unirse a tu empresa',
            message: `${requesterName} (${user.email}) ha solicitado unirse a ${companyInfo.name}`,
            action_url: '/business-dashboard/users',
            metadata: {
              requester_id: user.id,
              requester_name: requesterName,
              requester_email: user.email,
              company_id: companyData.existingCompanyId,
              company_name: companyInfo.name
            }
          });

        // 6. Enviar email al propietario usando Edge Function
        console.log('📧 PASO 1: Obteniendo email del propietario...');
        console.log('📧 Company info:', { companyId: companyInfo.id, ownerId: companyInfo.user_id });
        
        // Obtener email del propietario desde auth.users (usando RPC seguro)
        const { data: userEmailsData, error: emailFetchError } = await supabase
          .rpc('get_user_emails_by_ids', { user_ids: [companyInfo.user_id] });

        console.log('📧 PASO 2: Respuesta de get_user_emails_by_ids:', { 
          data: userEmailsData, 
          error: emailFetchError 
        });

        const ownerEmail = userEmailsData?.[0]?.email;

        console.log('📧 PASO 3: Email del propietario:', { 
          ownerEmail, 
          hasEmail: !!ownerEmail,
          rawData: userEmailsData 
        });

        if (ownerEmail) {
          try {
            console.log('📧 PASO 4: Invocando send-email function...');
            
            const emailBody = {
              to: ownerEmail,
              subject: `Nueva solicitud para unirse a ${companyInfo.name}`,
              html: `
                <h2>Nueva solicitud de membresía</h2>
                <p>Hola ${ownerProfile?.full_name || 'allí'},</p>
                <p><strong>${requesterName}</strong> (${user.email}) ha solicitado unirse a <strong>${companyInfo.name}</strong>.</p>
                <p>Puedes revisar y aprobar esta solicitud en tu panel de administración:</p>
                <a href="https://app.talentodigital.io/business-dashboard/users" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                  Ver Solicitud
                </a>
                <p>Si no reconoces a este usuario o crees que esto es un error, puedes rechazar la solicitud desde tu panel.</p>
              `
            };

            console.log('📧 PASO 5: Email body:', { to: emailBody.to, subject: emailBody.subject });

            const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email', {
              body: emailBody
            });

            console.log('📧 PASO 6: Respuesta de send-email:', { 
              result: emailResult, 
              error: emailError,
              hasError: !!emailError,
              hasResult: !!emailResult
            });

            if (emailError) {
              console.error('❌ Error enviando email:', emailError);
              toast.error('No se pudo enviar el email de notificación, pero la solicitud fue creada.');
            } else {
              console.log('✅ Email enviado exitosamente:', emailResult);
              toast.success('Email de notificación enviado al propietario');
            }
          } catch (emailEx) {
            console.error('💥 Excepción al enviar email:', emailEx);
            toast.error('Error al enviar email, pero la solicitud fue creada.');
          }
        } else {
          console.error('⚠️ No se pudo obtener email del propietario');
          toast.warning('Solicitud creada, pero no se pudo enviar email al propietario.');
        }

        // 7. Asignar rol business al usuario
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role: 'freemium_business'
          }, {
            onConflict: 'user_id'
          });

        if (roleError) {
          console.error('❌ Error asignando rol business:', roleError);
          // Intentar con UPDATE directo si el upsert falla
          const { error: updateRoleError } = await supabase
            .from('user_roles')
            .update({ role: 'freemium_business' })
            .eq('user_id', user.id);
          
          if (updateRoleError) {
            console.error('❌ Error actualizando rol:', updateRoleError);
          } else {
            console.log('✅ Rol actualizado correctamente con UPDATE');
          }
        } else {
          console.log('✅ Rol business asignado correctamente');
        }

        // 8. Marcar onboarding como completado
        await supabase.auth.updateUser({
          data: {
            onboarding_completed: true
          }
        });

        console.log('✅ Solicitud de membresía enviada exitosamente');
        toast.success(`Solicitud enviada a ${companyInfo.name}. El propietario revisará tu solicitud.`);

        // Refresh companies and redirect
        await refreshCompanies();
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
          {currentStep > 1 && !isInvitationFlow && !companyData.existingCompanyId && (
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
              {(isInvitationFlow || companyData.existingCompanyId) ? 'Completa tu Perfil' : 'Registro Empresarial'}
            </h1>
            <p className="text-muted-foreground">
              {(isInvitationFlow || companyData.existingCompanyId)
                ? 'Completa tu información para unirte a la empresa'
                : 'Completa la información de tu empresa'
              }
            </p>
          </div>
        </div>

        {(isInvitationFlow && invitationData) && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <UserPlus className="h-4 w-4" />
            <AlertDescription>
              Te estás uniendo a <strong>{invitationData.company_name}</strong> como{' '}
              <strong>{invitationData.role === 'admin' ? 'Administrador' : invitationData.role === 'owner' ? 'Propietario' : 'Miembro'}</strong>
            </AlertDescription>
          </Alert>
        )}
        
        {(!isInvitationFlow && companyData.existingCompanyId && currentStep === 4) && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <UserPlus className="h-4 w-4" />
            <AlertDescription>
              Solicitud de unión a <strong>{companyData.name}</strong>. El propietario revisará tu solicitud.
            </AlertDescription>
          </Alert>
        )}

        {/* Steps Indicator - Only show if not invitation flow and not joining existing company */}
        {!isInvitationFlow && !companyData.existingCompanyId && (
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
            isInvitationFlow={isInvitationFlow || !!companyData.existingCompanyId}
            invitationCompanyName={invitationData?.company_name || (companyData.existingCompanyId ? companyData.name : undefined)}
          />
        )}
      </div>
    </div>
  );
};

export default CompanyOnboarding;
