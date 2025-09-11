import { useCallback, useEffect } from 'react';
import { useProfileCompleteness } from './useProfileCompleteness';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook to manage profile synchronization across components
 * Provides utilities for refreshing profile data and handling navigation
 */
export const useProfileSync = () => {
  const { refreshCompleteness } = useProfileCompleteness();
  const { profile } = useSupabaseAuth();

  // Automatically refresh when profile changes
  useEffect(() => {
    if (profile) {
      refreshCompleteness();
    }
  }, [profile?.updated_at, refreshCompleteness]);

  const syncProfile = useCallback(async () => {
    await refreshCompleteness();
  }, [refreshCompleteness]);

  const handleProfileUpdate = useCallback(async (callback?: () => void) => {
    await syncProfile();
    callback?.();
  }, [syncProfile]);

  return {
    syncProfile,
    handleProfileUpdate,
  };
};