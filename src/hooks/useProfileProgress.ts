import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';

interface CompanyData {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  logo_url: string | null;
  business_type: string | null;
  industry: string | null;
  size: string | null;
  annual_revenue_range: string | null;
  social_links: any;
}

interface UserProfile {
  professional_title: string | null;
  linkedin_url: string | null;
  phone: string | null;
  country_code: string | null;
  avatar_url: string | null;
  full_name: string | null;
}

interface TaskStatus {
  id: string;
  title: string;
  completed: boolean;
  nextStepDescription?: string;
}

export const useProfileProgress = () => {
  const { user } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Priorizar activeCompany del CompanyContext
        if (activeCompany) {
          setCompanyData(activeCompany as CompanyData);
        } else {
          // Fallback: si no hay activeCompany, buscar por user_id (comportamiento anterior)
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (companyError && companyError.code !== 'PGRST116') {
            console.error('Error fetching company:', companyError);
          } else if (company) {
            setCompanyData(company);
          } else {
            // Fallback: if user is a team member, get the company via accepted membership
            const { data: membership, error: roleError } = await supabase
              .from('company_user_roles')
              .select('company_id, status, accepted_at')
              .eq('user_id', user.id)
              .eq('status', 'accepted')
              .order('accepted_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (roleError && roleError.code !== 'PGRST116') {
              console.error('Error fetching membership:', roleError);
            } else if (membership?.company_id) {
              const { data: memberCompany, error: companyByIdError } = await supabase
                .from('companies')
                .select('*')
                .eq('id', membership.company_id)
                .maybeSingle();
              if (!companyByIdError && memberCompany) {
                setCompanyData(memberCompany);
              }
            }
          }
        }
        // Obtener datos del perfil desde user_metadata
        setUserProfile({
          professional_title: user.user_metadata?.professional_title || null,
          linkedin_url: user.user_metadata?.linkedin_url || null,
          phone: user.user_metadata?.phone || null,
          country_code: user.user_metadata?.country_code || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeCompany]);

  const getTasksStatus = (): TaskStatus[] => {
    if (!companyData || !userProfile) {
      return [];
    }

    const onboardingComplete = !!(companyData.name);
    const isAcademy = companyData.business_type === 'academy';
    
    // Check required fields based on CompanyProfileWizard schema
    // For academies, we have reduced requirements (no industry, size, revenue, social links needed)
    const requiredCompanyFields = {
      name: !!companyData.name,
      description: !!(companyData.description && companyData.description.length >= 10),
      location: !!companyData.location,
      // Optional but recommended fields
      logo_url: !!companyData.logo_url,
      website: !!companyData.website,
      // These are NOT required for academies
      industry: !!companyData.industry,
      size: !!companyData.size,
      annual_revenue_range: !!companyData.annual_revenue_range,
      social_links: !!(companyData.social_links && Object.keys(companyData.social_links).length > 0),
    };

    // Calculate profile completion based on required + recommended fields
    const requiredFieldsComplete = requiredCompanyFields.name && 
                                 requiredCompanyFields.description && 
                                 requiredCompanyFields.location;
    
    // For academies: only require name, description, location, logo, and website
    // For companies: require all fields including industry, size, revenue, and social links
    const profileComplete = isAcademy
      ? (requiredFieldsComplete && requiredCompanyFields.logo_url && requiredCompanyFields.website)
      : (requiredFieldsComplete &&
         requiredCompanyFields.logo_url &&
         requiredCompanyFields.website &&
         requiredCompanyFields.industry &&
         requiredCompanyFields.size &&
         requiredCompanyFields.annual_revenue_range &&
         requiredCompanyFields.social_links);

    // Check if user has published any opportunities
    const hasPublishedOpportunity = false; // TODO: Implement this check when opportunities table is available
    
    // Check if user has invited colleagues
    const hasInvitedColleagues = false; // TODO: Implement this check when invitations system is available

    return [
      {
        id: 'onboarding',
        title: 'Onboarding Completado',
        completed: onboardingComplete,
        nextStepDescription: onboardingComplete ? undefined : 'Completa el proceso de onboarding inicial para configurar tu empresa'
      },
      {
        id: 'profile',
        title: profileComplete ? (isAcademy ? 'Perfil de Academia Completo' : 'Perfil de Empresa Completo') : (isAcademy ? 'Perfil de Academia Incompleto' : 'Perfil de Empresa Incompleto'),
        completed: profileComplete,
        nextStepDescription: profileComplete ? undefined : (() => {
          const missing = [];
          if (!requiredCompanyFields.description) missing.push('descripción (mín. 10 caracteres)');
          if (!requiredCompanyFields.location) missing.push('ubicación');
          if (!requiredCompanyFields.logo_url) missing.push('logo');
          if (!requiredCompanyFields.website) missing.push('sitio web');
          // Only add these fields as missing for non-academy companies
          if (!isAcademy) {
            if (!requiredCompanyFields.industry) missing.push('industria');
            if (!requiredCompanyFields.size) missing.push('tamaño de empresa');
            if (!requiredCompanyFields.annual_revenue_range) missing.push('rango de ingresos');
            if (!requiredCompanyFields.social_links) missing.push('redes sociales');
          }
          
          return missing.join(', ');
        })()
      },
      {
        id: 'opportunity',
        title: 'Publicar primera oportunidad',
        completed: hasPublishedOpportunity,
        nextStepDescription: hasPublishedOpportunity ? undefined : 'Publica tu primera oportunidad de trabajo para empezar a recibir candidatos'
      },
      {
        id: 'colleagues',
        title: 'Invitar colegas',
        completed: hasInvitedColleagues,
        nextStepDescription: hasInvitedColleagues ? undefined : 'Invita a miembros de tu equipo para colaborar en la gestión de oportunidades'
      }
    ];
  };

  const getCompletionPercentage = (): number => {
    if (!companyData) return 0;
    
    const isAcademy = companyData.business_type === 'academy';
    
    // Calculate based on individual field completion for more granular percentage
    // For academies: only 5 fields are required (name, description, location, logo, website)
    // For companies: 9 fields are required
    let completedFields = 0;
    const totalFields = isAcademy ? 5 : 9;
    
    if (companyData.name) completedFields++;
    if (companyData.description && companyData.description.length >= 10) completedFields++;
    if (companyData.location) completedFields++;
    if (companyData.logo_url) completedFields++;
    if (companyData.website) completedFields++;
    
    // Only count these fields for non-academy companies
    if (!isAcademy) {
      if (companyData.industry) completedFields++;
      if (companyData.size) completedFields++;
      if (companyData.annual_revenue_range) completedFields++;
      if (companyData.social_links && Object.keys(companyData.social_links).length > 0) completedFields++;
    }
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const getNextIncompleteTask = (): TaskStatus | null => {
    const tasks = getTasksStatus();
    return tasks.find(task => !task.completed) || null;
  };

  return {
    companyData,
    userProfile,
    loading,
    getTasksStatus,
    getCompletionPercentage,
    getNextIncompleteTask
  };
};
