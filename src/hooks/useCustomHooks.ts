
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { useSupabaseOpportunities } from './useSupabaseOpportunities';
import { useCallback } from 'react';

// Custom hook for application management using real Supabase data
export const useApplications = () => {
  const { user, userRole } = useSupabaseAuth();
  const { 
    applications,
    applyToOpportunity, 
    hasApplied,
    getApplicationStatus,
    getApplicationsByOpportunity,
    updateApplicationStatus
  } = useSupabaseOpportunities();

  const applyToJob = useCallback(async (opportunityId: string, message: string) => {
    if (!user || !isTalentRole(userRole)) {
      throw new Error('Only talent users can apply to opportunities');
    }

    // Check if already applied
    if (hasApplied(opportunityId)) {
      throw new Error('You have already applied to this opportunity');
    }

    await applyToOpportunity(opportunityId, message);
  }, [user, userRole, hasApplied, applyToOpportunity]);

  const getMyApplications = useCallback(() => {
    return applications;
  }, [applications]);

  return {
    applications,
    applyToJob,
    getMyApplications,
    getApplicationStatus,
    hasApplied,
    getApplicationsByOpportunity,
    updateApplicationStatus
  };
};

// Custom hook for form auto-save functionality
export const useAutoSave = (key: string, initialData: any = {}) => {
  const { user } = useSupabaseAuth();
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

// Custom hook for search and filtering using real Supabase data
export const useSearch = () => {
  const { searchOpportunities, filterOpportunities } = useSupabaseOpportunities();

  const performSearch = useCallback((query: string, filters?: any) => {
    let results = searchOpportunities(query);
    
    if (filters) {
      results = filterOpportunities(filters);
    }

    return results;
  }, [searchOpportunities, filterOpportunities]);

  return {
    searchOpportunities,
    filterOpportunities,
    performSearch
  };
};
