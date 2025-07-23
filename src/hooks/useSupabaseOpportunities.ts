import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SupabaseOpportunity {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  category: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
  companies?: {
    name: string;
    logo_url?: string;
  };
}

interface SupabaseApplication {
  id: string;
  opportunity_id: string;
  user_id: string;
  cover_letter: string;
  status: string;
  created_at: string;
  updated_at: string;
  opportunities?: SupabaseOpportunity;
}

export const useSupabaseOpportunities = () => {
  const { user, userRole, isAuthenticated } = useSupabaseAuth();
  const [opportunities, setOpportunities] = useState<SupabaseOpportunity[]>([]);
  const [applications, setApplications] = useState<SupabaseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err instanceof Error ? err.message : 'Error fetching opportunities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user applications
  const fetchUserApplications = useCallback(async () => {
    if (!user || userRole !== 'talent') return;

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
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Error fetching applications');
    }
  }, [user, userRole]);

  // Apply to opportunity
  const applyToOpportunity = useCallback(async (opportunityId: string, coverLetter: string) => {
    if (!user || userRole !== 'talent') {
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
      
      // Refresh applications
      await fetchUserApplications();
    } catch (err) {
      console.error('Error applying to opportunity:', err);
      throw err;
    }
  }, [user, userRole, fetchUserApplications]);

  // Check if user has applied to opportunity
  const hasApplied = useCallback((opportunityId: string) => {
    return applications.some(app => app.opportunity_id === opportunityId);
  }, [applications]);

  // Get application status
  const getApplicationStatus = useCallback((opportunityId: string) => {
    const application = applications.find(app => app.opportunity_id === opportunityId);
    return application?.status || null;
  }, [applications]);

  // Search opportunities
  const searchOpportunities = useCallback((query: string) => {
    if (!query.trim()) return opportunities;
    
    const lowerQuery = query.toLowerCase();
    return opportunities.filter(opp =>
      opp.title.toLowerCase().includes(lowerQuery) ||
      opp.companies?.name.toLowerCase().includes(lowerQuery) ||
      opp.description.toLowerCase().includes(lowerQuery) ||
      opp.location.toLowerCase().includes(lowerQuery) ||
      opp.category.toLowerCase().includes(lowerQuery) ||
      (opp.requirements && opp.requirements.toLowerCase().includes(lowerQuery))
    );
  }, [opportunities]);

  // Get applications by opportunity (for business users)
  const getApplicationsByOpportunity = useCallback(async (opportunityId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching applications for opportunity:', err);
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
      console.error('Error updating application status:', err);
      throw err;
    }
  }, [fetchUserApplications]);

  // Filter opportunities
  const filterOpportunities = useCallback((filters: {
    category?: string;
    location?: string;
    type?: string;
    salaryMin?: number;
    salaryMax?: number;
  }) => {
    return opportunities.filter(opp => {
      if (filters.category && opp.category !== filters.category) return false;
      if (filters.location && !opp.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.type && opp.type !== filters.type) return false;
      if (filters.salaryMin && opp.salary_max < filters.salaryMin) return false;
      if (filters.salaryMax && opp.salary_min > filters.salaryMax) return false;
      return true;
    });
  }, [opportunities]);

  // Load data on mount and when user changes
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  useEffect(() => {
    if (isAuthenticated && user && userRole === 'talent') {
      fetchUserApplications();
    }
  }, [isAuthenticated, user, userRole, fetchUserApplications]);

  return {
    opportunities,
    applications,
    isLoading,
    error,
    applyToOpportunity,
    hasApplied,
    getApplicationStatus,
    searchOpportunities,
    filterOpportunities,
    getApplicationsByOpportunity,
    updateApplicationStatus,
    refreshOpportunities: fetchOpportunities,
    refreshApplications: fetchUserApplications
  };
};