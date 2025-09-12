import { useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardMetrics = () => {
  const { user, company } = useSupabaseAuth();

  // Business Metrics - Real data from Supabase
  const getBusinessMetrics = useCallback(async () => {
    if (!user?.id || !company?.id) return null;

    try {
      // Get opportunities data for this company
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('id, title, status, created_at')
        .eq('company_id', company.id);

      if (opportunitiesError) {
        console.error('Error fetching opportunities:', opportunitiesError);
      }

      // Get applications data for this company's opportunities
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          opportunity_id,
          opportunities!inner(title, company_id)
        `)
        .eq('opportunities.company_id', company.id);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      }

      const opportunities = opportunitiesData || [];
      const applications = applicationsData || [];

      const totalOpportunities = opportunities.length;
      const activeOpportunities = opportunities.filter(opp => opp.status === 'active').length;
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(app => app.status === 'pending').length;
      const unreviewedApplications = applications.filter(app => app.status === 'pending').length;

      // Calculate applications this month and last month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const applicationsThisMonth = applications.filter(app => 
        new Date(app.created_at) >= thisMonthStart
      ).length;

      const applicationsLastMonth = applications.filter(app => {
        const appDate = new Date(app.created_at);
        return appDate >= lastMonthStart && appDate <= lastMonthEnd;
      }).length;

      // Calculate top opportunities (by application count)
      const opportunityApplicationCounts = opportunities.map(opp => {
        const appCount = applications.filter(app => app.opportunity_id === opp.id).length;
        return {
          id: opp.id,
          title: opp.title,
          applications: appCount,
          views: 0 // We don't track views yet
        };
      }).sort((a, b) => b.applications - a.applications).slice(0, 5);

      // Get recent applications with profiles data
      const recentApplications = applications
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(app => ({
          id: app.id,
          opportunityTitle: app.opportunities?.title || 'Oportunidad eliminada',
          applicantName: 'Candidato', // We don't expose user names for privacy
          status: app.status,
          createdAt: app.created_at
        }));

      // Calculate average response time (mock for now)
      const averageResponseTime = '16h'; // This would be calculated from actual response data
      
      // Calculate candidates contacted (mock for now)
      const candidatesContacted = applications.filter(app => app.status !== 'pending').length;
      
      // Calculate candidates in evaluation (pending applications)
      const candidatesInEvaluation = pendingApplications;

      return {
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        pendingApplications,
        unreviewedApplications,
        applicationsThisMonth,
        applicationsLastMonth,
        averageResponseTime,
        candidatesContacted,
        candidatesInEvaluation,
        topOpportunities: opportunityApplicationCounts,
        recentApplications
      };
    } catch (error) {
      console.error('Error in getBusinessMetrics:', error);
      return {
        totalOpportunities: 0,
        activeOpportunities: 0,
        totalApplications: 0,
        pendingApplications: 0,
        unreviewedApplications: 0,
        applicationsThisMonth: 0,
        applicationsLastMonth: 0,
        averageResponseTime: '0h',
        candidatesContacted: 0,
        candidatesInEvaluation: 0,
        topOpportunities: [],
        recentApplications: []
      };
    }
  }, [user, company]);

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
        .eq('status', 'active')
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