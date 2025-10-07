import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { logger } from '@/lib/logger';
import { filterOpportunitiesForTalent } from '@/lib/country-restrictions';

interface SupabaseOpportunity {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  type: string;
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  status: 'draft' | 'active' | 'paused' | 'closed' | null;
  created_at: string;
  updated_at: string;
  company_id: string;
  // Campos para restricción de país
  country_restriction_enabled?: boolean | null;
  allowed_country?: string | null;
  companies?: {
    name: string;
    logo_url?: string | null;
  };
}

interface SupabaseApplication {
  id: string;
  opportunity_id: string;
  user_id: string;
  cover_letter: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  opportunities?: SupabaseOpportunity;
}

export const useSupabaseOpportunities = () => {
  const { user, userRole, isAuthenticated, profile, company } = useSupabaseAuth();
  const [opportunities, setOpportunities] = useState<SupabaseOpportunity[]>([]);
  const [applications, setApplications] = useState<SupabaseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener la ubicación del talento para filtrado
  const talentLocation = useMemo(() => {
    if (!isTalentRole(userRole) || !profile) {
      return null;
    }
    // Obtener ubicación del perfil del talento (combinar ciudad y país si están disponibles)
    if (profile.country && profile.city) {
      return `${profile.city}, ${profile.country}`;
    }
    return profile.country || null;
  }, [userRole, profile]);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching opportunities for:', { 
        userRole, 
        companyId: company?.id, 
        isAuthenticated,
        user: user?.id,
        company: company
      });
      
      if (isTalentRole(userRole)) {
        // Para talentos: solo oportunidades activas
        const { data, error } = await supabase
          .from('opportunities')
          .select(`
            *,
            companies (
              name,
              logo_url
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('📊 Talent opportunities loaded:', data?.length || 0);
        setOpportunities(data || []);
      } else {
        // Para empresas: todas las oportunidades de la empresa
        console.log('🏢 Business user detected, checking company...');
        console.log('Company object:', company);
        console.log('Company ID:', company?.id);
        
        if (!company?.id) {
          console.log('❌ No company ID found for business user');
          console.log('Available company data:', company);
          setOpportunities([]);
          return;
        }

        console.log('🔍 Querying opportunities for company_id:', company.id);
        
        // Fetch active opportunities
        const { data: activeData, error: activeError } = await supabase
          .from('opportunities')
          .select(`
            *,
            companies (
              name,
              logo_url
            )
          `)
          .eq('company_id', company.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (activeError) {
          console.error('❌ Error fetching active opportunities:', activeError);
          throw activeError;
        }

        // Fetch last 2 draft opportunities
        const { data: draftData, error: draftError } = await supabase
          .from('opportunities')
          .select(`
            *,
            companies (
              name,
              logo_url
            )
          `)
          .eq('company_id', company.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(2);

        if (draftError) {
          console.error('❌ Error fetching draft opportunities:', draftError);
          throw draftError;
        }

        // Combine and sort by creation date
        const combinedData = [...(activeData || []), ...(draftData || [])];
        const data = combinedData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        console.log('📊 Query result:', { 
          activeCount: activeData?.length || 0, 
          draftCount: draftData?.length || 0,
          totalCount: data?.length || 0 
        });
        
        console.log('🏢 Business opportunities loaded:', data?.length || 0, 'for company:', company.id);
        console.log('📋 Opportunities data:', data);
        setOpportunities(data || []);
      }
    } catch (err) {
      logger.error('Error fetching opportunities:', err);
      setError(err instanceof Error ? err.message : 'Error fetching opportunities');
    } finally {
      setIsLoading(false);
    }
  }, [userRole, company?.id]);

  // Fetch user applications
  const fetchUserApplications = useCallback(async () => {
    if (!user || !isTalentRole(userRole)) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities (
            *,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      logger.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Error fetching applications');
    }
  }, [user, userRole]);

  // Apply to opportunity
  const applyToOpportunity = useCallback(async (opportunityId: string, coverLetter: string) => {
    if (!user || !isTalentRole(userRole)) {
      throw new Error('Only talent users can apply to opportunities');
    }

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunityId,
          user_id: user.id,
          cover_letter: coverLetter,
          status: 'pending'
        });

      if (error) throw error;
      
      // Get opportunity details and company owner to send notification
      const { data: opportunityData } = await supabase
        .from('opportunities')
        .select('title, company_id, companies(user_id)')
        .eq('id', opportunityId)
        .single();
      
      if (opportunityData && (opportunityData.companies as any)?.user_id) {
        const companyOwnerId = (opportunityData.companies as any).user_id;
        
        // Create notification for company owner
        try {
          await supabase
            .from('notifications' as any)
            .insert({
              user_id: companyOwnerId,
              type: 'opportunity',
              title: '¡Nuevo postulante!',
              message: `${profile?.full_name || 'Un talento'} se ha postulado a "${opportunityData.title}"`,
              action_url: `/business-dashboard/applications?opportunity=${opportunityId}`,
              read: false
            });
        } catch (notifError) {
          console.warn('Failed to create notification:', notifError);
        }
      }
      
      // Refresh applications
      await fetchUserApplications();
    } catch (err) {
      logger.error('Error applying to opportunity:', err);
      throw err;
    }
  }, [user, userRole, profile, fetchUserApplications]);

  // Check if user has applied to opportunity
  const hasApplied = useCallback((opportunityId: string) => {
    return applications.some(app => app.opportunity_id === opportunityId);
  }, [applications]);

  // Get application status
  const getApplicationStatus = useCallback((opportunityId: string) => {
    const application = applications.find(app => app.opportunity_id === opportunityId);
    return application?.status || null;
  }, [applications]);

  // Filtrar oportunidades para talentos basándose en restricciones de país
  const filteredOpportunities = useMemo(() => {
    if (!isTalentRole(userRole)) {
      // Para usuarios no-talento, mostrar todas las oportunidades
      return opportunities;
    }
    
    // Para talentos, filtrar basándose en restricciones de país
    return filterOpportunitiesForTalent(opportunities, talentLocation);
  }, [opportunities, userRole, talentLocation]);

  // Search opportunities (usa las oportunidades ya filtradas)
  const searchOpportunities = useCallback((query: string) => {
    if (!query.trim()) return filteredOpportunities;
    
    const lowerQuery = query.toLowerCase();
    return filteredOpportunities.filter(opp =>
      opp.title.toLowerCase().includes(lowerQuery) ||
      opp.companies?.name.toLowerCase().includes(lowerQuery) ||
      opp.description.toLowerCase().includes(lowerQuery) ||
      (opp.location && opp.location.toLowerCase().includes(lowerQuery)) ||
      opp.category.toLowerCase().includes(lowerQuery) ||
      (opp.requirements && opp.requirements.toLowerCase().includes(lowerQuery))
    );
  }, [filteredOpportunities]);

  // Get applications by opportunity (for business users)
  const getApplicationsByOpportunity = useCallback(async (opportunityId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', opportunityId);

      if (error) throw error;
      
      return data || [];
    } catch (err) {
      logger.error('Error fetching applications for opportunity:', err);
      return [];
    }
  }, []);

  // Update application status (for business users)
  const updateApplicationStatus = useCallback(async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
      
      // Refresh applications if needed
      await fetchUserApplications();
    } catch (err) {
      logger.error('Error updating application status:', err);
      throw err;
    }
  }, [fetchUserApplications]);

  // Update opportunity (for business users)
  const updateOpportunity = useCallback(async (opportunityId: string, updates: Partial<SupabaseOpportunity>) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', opportunityId);

      if (error) throw error;
      
      // Refresh opportunities
      await fetchOpportunities();
    } catch (err) {
      logger.error('Error updating opportunity:', err);
      throw err;
    }
  }, [fetchOpportunities]);

  // Delete opportunity (for business users)
  const deleteOpportunity = useCallback(async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;
      
      // Refresh opportunities
      await fetchOpportunities();
    } catch (err) {
      logger.error('Error deleting opportunity:', err);
      throw err;
    }
  }, [fetchOpportunities]);

  // Toggle opportunity status (for business users)
  const toggleOpportunityStatus = useCallback(async (opportunityId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: currentStatus ? 'paused' : 'active' })
        .eq('id', opportunityId);

      if (error) throw error;
      
      // Refresh opportunities
      await fetchOpportunities();
    } catch (err) {
      logger.error('Error toggling opportunity status:', err);
      throw err;
    }
  }, [fetchOpportunities]);

  // Filter opportunities (usa las oportunidades ya filtradas)
  const filterOpportunities = useCallback((filters: {
    category?: string;
    location?: string;
    type?: string;
    salaryMin?: number;
    salaryMax?: number;
  }) => {
    return filteredOpportunities.filter(opp => {
      if (filters.category && opp.category !== filters.category) return false;
      if (filters.location && opp.location && !opp.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.type && opp.type !== filters.type) return false;
      if (filters.salaryMin && opp.salary_max && opp.salary_max < filters.salaryMin) return false;
      if (filters.salaryMax && opp.salary_min && opp.salary_min > filters.salaryMax) return false;
      return true;
    });
  }, [filteredOpportunities]);

  // Load data on mount and when user changes
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  useEffect(() => {
    if (isAuthenticated && user && isTalentRole(userRole)) {
      fetchUserApplications();
    }
  }, [isAuthenticated, user, userRole, fetchUserApplications]);

  return {
    opportunities: filteredOpportunities, // Devolver oportunidades filtradas
    allOpportunities: opportunities, // Mantener acceso a todas las oportunidades si es necesario
    applications,
    isLoading,
    error,
    talentLocation, // Exponer la ubicación del talento
    applyToOpportunity,
    hasApplied,
    getApplicationStatus,
    searchOpportunities,
    filterOpportunities,
    getApplicationsByOpportunity,
    updateApplicationStatus,
    updateOpportunity,
    deleteOpportunity,
    toggleOpportunityStatus,
    refreshOpportunities: fetchOpportunities,
    refreshApplications: fetchUserApplications
  };
};