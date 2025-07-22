import { useAuth } from '@/contexts/AuthContextEnhanced';
import { useOpportunities } from '@/contexts/OpportunitiesContext';
import { useCallback } from 'react';

// Custom hook for application management
export const useApplications = () => {
  const { user } = useAuth();
  const { 
    applications, 
    userApplications, 
    applyToOpportunity, 
    updateApplicationStatus,
    getApplicationsByOpportunity 
  } = useOpportunities();

  const applyToJob = useCallback(async (opportunityId: string, message: string) => {
    if (!user || user.type !== 'talent') {
      throw new Error('Only talent users can apply to opportunities');
    }

    // Check if already applied
    const existingApplication = userApplications.find(
      app => app.opportunityId === opportunityId
    );

    if (existingApplication) {
      throw new Error('You have already applied to this opportunity');
    }

    await applyToOpportunity(opportunityId, message);
  }, [user, userApplications, applyToOpportunity]);

  const getMyApplications = useCallback(() => {
    return userApplications;
  }, [userApplications]);

  const getApplicationStatus = useCallback((opportunityId: string) => {
    const application = userApplications.find(
      app => app.opportunityId === opportunityId
    );
    return application?.status || null;
  }, [userApplications, user]);

  const hasApplied = useCallback((opportunityId: string) => {
    return userApplications.some(app => app.opportunityId === opportunityId);
  }, [userApplications]);

  return {
    applications,
    userApplications,
    applyToJob,
    updateApplicationStatus,
    getApplicationsByOpportunity,
    getMyApplications,
    getApplicationStatus,
    hasApplied
  };
};

// Custom hook for form auto-save functionality
export const useAutoSave = (key: string, initialData: any = {}) => {
  const { user } = useAuth();
  const storageKey = `autosave_${key}_${user?.id || 'guest'}`;

  const saveData = useCallback((data: any) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [storageKey]);

  const loadData = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        // Auto-expire after 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Auto-load failed:', error);
    }
    return initialData;
  }, [storageKey, initialData]);

  const clearSaved = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { saveData, loadData, clearSaved };
};

// Custom hook for managing dashboard metrics
export const useDashboardMetrics = () => {
  const { user } = useAuth();
  const { opportunities, applications, userApplications } = useOpportunities();

  const getBusinessMetrics = useCallback(() => {
    if (!user || user.type !== 'business') return null;

    const companyOpportunities = opportunities.filter(
      opp => opp.companyId === user.company?.id || opp.companyId === user.id
    );

    const activeOpportunities = companyOpportunities.filter(
      opp => opp.status === 'active'
    );

    const totalApplications = applications.filter(app =>
      companyOpportunities.some(opp => opp.id === app.opportunityId)
    );

    const pendingApplications = totalApplications.filter(
      app => app.status === 'pending'
    );

    return {
      activeOpportunities: activeOpportunities.length,
      totalOpportunities: companyOpportunities.length,
      pendingApplications: pendingApplications.length,
      totalApplications: totalApplications.length,
      unreadMessages: 0 // Placeholder
    };
  }, [user, opportunities, applications]);

  const getTalentMetrics = useCallback(() => {
    if (!user || user.type !== 'talent') return null;

    const appliedJobs = userApplications.length;
    const pendingApplications = userApplications.filter(
      app => app.status === 'pending'
    ).length;
    const acceptedApplications = userApplications.filter(
      app => app.status === 'accepted'
    ).length;

    return {
      appliedJobs,
      pendingApplications,
      acceptedApplications,
      scheduledInterviews: acceptedApplications, // Simplified
      unreadMessages: 0 // Placeholder
    };
  }, [user, userApplications]);

  return {
    getBusinessMetrics,
    getTalentMetrics
  };
};

// Custom hook for search and filtering
export const useSearch = () => {
  const { searchOpportunities, filterOpportunities } = useOpportunities();

  const performSearch = useCallback((query: string, filters?: any) => {
    let results = searchOpportunities(query);
    
    if (filters) {
      results = results.filter(opp => {
        if (filters.category && opp.category !== filters.category) return false;
        if (filters.location && !opp.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.type && opp.type !== filters.type) return false;
        if (filters.status && opp.status !== filters.status) return false;
        return true;
      });
    }

    return results;
  }, [searchOpportunities]);

  return {
    searchOpportunities,
    filterOpportunities,
    performSearch
  };
};