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
    const profileComplete = !!(
      companyData.description && 
      companyData.website && 
      companyData.location && 
      companyData.logo_url &&
      userProfile.professional_title &&
      userProfile.phone
    );

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
        nextStepDescription: profileComplete ? undefined : 'Agrega descripción de empresa, sitio web, ubicación, logo y completa tu información personal'
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
    const tasks = getTasksStatus();
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
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
