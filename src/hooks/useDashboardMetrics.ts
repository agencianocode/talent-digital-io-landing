import { useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseOpportunities } from './useSupabaseOpportunities';

export const useDashboardMetrics = () => {
  const { userRole } = useSupabaseAuth();
  const { opportunities, applications } = useSupabaseOpportunities();

  const getTalentMetrics = useCallback(() => {
    const appliedJobs = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    
    return {
      appliedJobs,
      scheduledInterviews: acceptedApplications, // Using accepted as proxy for interviews
      unreadMessages: 0, // Placeholder for messaging system
      pendingApplications
    };
  }, [applications]);

  const getBusinessMetrics = useCallback(() => {
    const activeOpportunities = opportunities.filter(opp => opp.is_active).length;
    const totalApplications = 0; // Would need to fetch from applications table
    const pendingApplications = 0; // Would need to fetch from applications table
    
    return {
      activeOpportunities,
      totalApplications,
      pendingApplications,
      newMessages: 0 // Placeholder for messaging system
    };
  }, [opportunities]);

  return {
    getTalentMetrics,
    getBusinessMetrics
  };
};