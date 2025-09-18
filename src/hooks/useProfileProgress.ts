import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
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
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Obtener datos de la empresa
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          console.error('Error fetching company:', companyError);
        } else if (company) {
          console.log('🔍 Company data loaded:', company);
          setCompanyData(company);
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
  }, [user]);

  const getTasksStatus = (): TaskStatus[] => {
    if (!companyData || !userProfile) {
      return [];
    }

    const onboardingComplete = !!(companyData.name);
    
    // Check required fields based on CompanyProfileWizard schema
    const requiredCompanyFields = {
      name: !!companyData.name,
      description: !!(companyData.description && companyData.description.length >= 10),
      location: !!companyData.location,
      // Optional but recommended fields
      logo_url: !!companyData.logo_url,
      website: !!companyData.website,
      industry: !!companyData.industry,
      size: !!companyData.size,
    };

    // Calculate profile completion based on required + recommended fields
    const requiredFieldsComplete = requiredCompanyFields.name && 
                                 requiredCompanyFields.description && 
                                 requiredCompanyFields.location;
    
    const recommendedFieldsComplete = requiredFieldsComplete &&
                                    requiredCompanyFields.logo_url &&
                                    requiredCompanyFields.website &&
                                    requiredCompanyFields.industry &&
                                    requiredCompanyFields.size;

    const profileComplete = recommendedFieldsComplete;

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
        title: 'Perfil de Empresa Completo',
        completed: profileComplete,
        nextStepDescription: profileComplete ? undefined : (() => {
          const missing = [];
          if (!requiredCompanyFields.description) missing.push('descripción (mín. 10 caracteres)');
          if (!requiredCompanyFields.location) missing.push('ubicación');
          if (!requiredCompanyFields.logo_url) missing.push('logo');
          if (!requiredCompanyFields.website) missing.push('sitio web');
          if (!requiredCompanyFields.industry) missing.push('industria');
          if (!requiredCompanyFields.size) missing.push('tamaño de empresa');
          
          return `Completa en /profile?tab=corporate: ${missing.join(', ')}`;
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
    if (!companyData) {
      console.log('🚫 No company data for percentage calculation');
      return 0;
    }
    
    // Calculate based on individual field completion for more granular percentage
    let completedFields = 0;
    let totalFields = 7; // Total important fields for a complete profile
    
    console.log('📊 Calculating completion percentage with data:', {
      name: companyData.name,
      description: companyData.description,
      location: companyData.location,
      logo_url: companyData.logo_url,
      website: companyData.website,
      industry: companyData.industry,
      size: companyData.size
    });
    
    if (companyData.name) {
      completedFields++;
      console.log('✅ Name complete');
    }
    if (companyData.description && companyData.description.length >= 10) {
      completedFields++;
      console.log('✅ Description complete');
    }
    if (companyData.location) {
      completedFields++;
      console.log('✅ Location complete');
    }
    if (companyData.logo_url) {
      completedFields++;
      console.log('✅ Logo complete');
    }
    if (companyData.website) {
      completedFields++;
      console.log('✅ Website complete');
    }
    if (companyData.industry) {
      completedFields++;
      console.log('✅ Industry complete');
    }
    if (companyData.size) {
      completedFields++;
      console.log('✅ Size complete');
    }
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    console.log(`📈 Completion: ${completedFields}/${totalFields} = ${percentage}%`);
    
    return percentage;
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
