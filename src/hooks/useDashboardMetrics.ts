import { useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardMetrics = () => {
  const { user } = useSupabaseAuth();

  // Business Metrics - Simplified with mock data
  const getBusinessMetrics = useCallback(async () => {
    if (!user?.id) return null;

    // Simplified business metrics with mock data
    const result = {
      totalOpportunities: 15,
      activeOpportunities: 12,
      totalApplications: 45,
      pendingApplications: 12,
      applicationsThisMonth: 18,
      applicationsLastMonth: 22,
      topOpportunities: [
        {
          id: '1',
          title: 'Sales Development Representative',
          applications: 8,
          views: 45
        },
        {
          id: '2', 
          title: 'Digital Marketing Specialist',
          applications: 6,
          views: 32
        }
      ],
      recentApplications: [
        {
          id: '1',
          opportunityTitle: 'Sales Representative',
          applicantName: 'Juan Pérez',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    };

    return result;
  }, [user]);

  // Talent Metrics - Real data from Supabase
  const getTalentMetrics = useCallback(async () => {
    if (!user?.id) return null;

    try {
      // Get applications data
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          opportunities(title, companies(name))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      }

      // Get saved opportunities data
      const { data: savedData, error: savedError } = await supabase
        .from('saved_opportunities')
        .select('id')
        .eq('user_id', user.id);

      if (savedError) {
        console.error('Error fetching saved opportunities:', savedError);
      }

      // Get profile data for completeness
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('profile_completeness')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const applications = applicationsData || [];
      const saved = savedData || [];
      
      const totalApplications = applications.length;
      const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
      const pendingApplications = applications.filter(app => app.status === 'pending').length;
      const savedOpportunities = saved.length;
      const profileCompletion = profileData?.profile_completeness || 0;

      // Format recent applications
      const recentApplications = applications.slice(0, 5).map(app => ({
        id: app.id,
        opportunityTitle: app.opportunities?.title || 'Oportunidad eliminada',
        company: app.opportunities?.companies?.name || 'Empresa no disponible',
        appliedAt: app.created_at,
        status: app.status
      }));

      // Get recommended opportunities (mock for now since we don't have recommendation logic)
      const { data: opportunitiesData } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          companies(name),
          salary_min,
          salary_max,
          currency
        `)
        .eq('is_active', true)
        .limit(5);

      const recommendedOpportunities = (opportunitiesData || []).map(opp => ({
        id: opp.id,
        title: opp.title,
        company: opp.companies?.name || 'Empresa',
        salary: opp.salary_min && opp.salary_max 
          ? `${opp.currency || '$'}${opp.salary_min.toLocaleString()} - ${opp.currency || '$'}${opp.salary_max.toLocaleString()}`
          : 'Salario por acordar',
        matchScore: Math.floor(Math.random() * 30) + 70 // Mock match score
      }));

      return {
        totalApplications,
        acceptedApplications,
        pendingApplications,
        savedOpportunities,
        profileViews: 0, // We don't track profile views yet
        profileCompletion,
        recentApplications,
        recommendedOpportunities
      };
    } catch (error) {
      console.error('Error in getTalentMetrics:', error);
      return {
        totalApplications: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        savedOpportunities: 0,
        profileViews: 0,
        profileCompletion: 0,
        recentApplications: [],
        recommendedOpportunities: []
      };
    }
  }, [user]);

  return {
    getTalentMetrics,
    getBusinessMetrics
  };
};