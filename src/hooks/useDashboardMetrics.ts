import { useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseOpportunities } from './useSupabaseOpportunities';
import { useSavedOpportunities } from './useSavedOpportunities';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardMetrics = () => {
  const { userRole, user, company } = useSupabaseAuth();
  const { opportunities, applications } = useSupabaseOpportunities();
  const { savedOpportunities } = useSavedOpportunities();

  // Business Metrics
  const getBusinessMetrics = useCallback(async () => {
    const activeOpportunities = opportunities.filter(opp => opp.is_active).length;
    const totalOpportunities = opportunities.length;
    
    // Fetch applications for business user's opportunities
    let totalApplications = 0;
    let pendingApplications = 0;
    let applicationsThisMonth = 0;
    let applicationsLastMonth = 0;
    let topOpportunities: any[] = [];
    let recentApplications: any[] = [];
    
    try {
      // Get current and last month dates
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities (
            id,
            title,
            company_id
          )
        `)
        .in('opportunities.company_id', opportunities.map(opp => opp.company_id));

      if (!error && applications) {
        totalApplications = applications.length;
        pendingApplications = applications.filter(app => app.status === 'pending').length;
        
        // Filter by month
        applicationsThisMonth = applications.filter(app => 
          new Date(app.created_at) >= thisMonth
        ).length;
        
        applicationsLastMonth = applications.filter(app => {
          const appDate = new Date(app.created_at);
          return appDate >= lastMonth && appDate < thisMonth;
        }).length;

        // Get top opportunities by application count
        const opportunityStats = opportunities.map(opp => {
          const oppApplications = applications.filter(app => 
            app.opportunities?.id === opp.id
          );
          return {
            id: opp.id,
            title: opp.title,
            applications: oppApplications.length,
            views: Math.floor(Math.random() * 100) + 10 // Mock data for now
          };
        }).sort((a, b) => b.applications - a.applications).slice(0, 5);

        // If no opportunities with applications, show all opportunities with mock data
        if (opportunityStats.length === 0 && opportunities.length > 0) {
          topOpportunities = opportunities.slice(0, 5).map(opp => ({
            id: opp.id,
            title: opp.title,
            applications: Math.floor(Math.random() * 5), // Mock applications
            views: Math.floor(Math.random() * 100) + 10 // Mock views
          }));
        } else {
          topOpportunities = opportunityStats;
        }

        // Get recent applications
        recentApplications = applications
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(app => ({
            id: app.id,
            opportunityTitle: app.opportunities?.title || 'Unknown',
            applicantName: `Usuario ${app.user_id.slice(0, 8)}`, // Use user_id as fallback
            status: app.status,
            createdAt: app.created_at
          }));

        // If no applications, show mock data
        if (recentApplications.length === 0 && opportunities.length > 0) {
          recentApplications = opportunities.slice(0, 3).map((opp, index) => ({
            id: `mock-${index}`,
            opportunityTitle: opp.title,
            applicantName: `Candidato ${index + 1}`,
            status: 'pending',
            createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString()
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching applications for metrics:', err);
    }
    
    const result = {
      totalOpportunities,
      activeOpportunities,
      totalApplications,
      pendingApplications,
      applicationsThisMonth,
      applicationsLastMonth,
      topOpportunities,
      recentApplications
    };

    console.log('Business Metrics Result:', result);
    return result;
  }, [opportunities]);

  // Talent Metrics
  const getTalentMetrics = useCallback(async () => {
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    const savedOpportunitiesCount = savedOpportunities.length;
    
    // Mock data for now - these would come from actual tracking
    const profileViews = Math.floor(Math.random() * 50) + 5;
    const profileCompletion = 85; // This would be calculated based on profile completeness
    
    // Get recent applications
    const recentApplications = applications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(app => ({
        id: app.id,
        opportunityTitle: app.opportunities?.title || 'Unknown',
        companyName: app.opportunities?.companies?.name || 'Unknown Company',
        status: app.status,
        appliedAt: app.created_at
      }));

    // Mock recommended opportunities
    const recommendedOpportunities = opportunities
      .filter(opp => opp.is_active)
      .slice(0, 5)
      .map(opp => ({
        id: opp.id,
        title: opp.title,
        companyName: opp.companies?.name || 'Unknown Company',
        matchScore: Math.floor(Math.random() * 40) + 60, // 60-100% match
        salary: opp.salary_min ? `$${opp.salary_min.toLocaleString()}` : 'No especificado'
      }));

    return {
      totalApplications,
      acceptedApplications,
      pendingApplications,
      savedOpportunities: savedOpportunitiesCount,
      profileViews,
      profileCompletion,
      recentApplications,
      recommendedOpportunities
    };
  }, [applications, savedOpportunities, opportunities]);

  return {
    getTalentMetrics,
    getBusinessMetrics
  };
};