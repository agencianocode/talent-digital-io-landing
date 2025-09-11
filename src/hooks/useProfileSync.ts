import { useCallback, useEffect, useRef } from 'react';
import { useProfileCompleteness } from './useProfileCompleteness';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook to manage profile synchronization across components
 * Provides utilities for refreshing profile data and handling navigation
 */
export const useProfileSync = () => {
  const { refreshCompleteness } = useProfileCompleteness();
  const { profile, user } = useSupabaseAuth();
  const lastRefreshRef = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced refresh to prevent excessive calls
  const debouncedRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshRef.current < 1000) return; // Prevent calls within 1 second
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        lastRefreshRef.current = Date.now();
        await refreshCompleteness();
      } catch (error) {
        console.error('Error during profile sync:', error);
      }
    }, 300);
  }, [refreshCompleteness]);

  // Automatically refresh when profile changes
  useEffect(() => {
    if (profile && user?.id) {
      debouncedRefresh();
    }
  }, [profile?.updated_at, user?.id, debouncedRefresh]);

  const syncProfile = useCallback(async () => {
    try {
      await refreshCompleteness();
      lastRefreshRef.current = Date.now();
    } catch (error) {
      console.error('Error syncing profile:', error);
      throw error;
    }
  }, [refreshCompleteness]);

  const handleProfileUpdate = useCallback(async (callback?: () => void) => {
    try {
      await syncProfile();
      callback?.();
    } catch (error) {
      console.error('Error handling profile update:', error);
    }
  }, [syncProfile]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    syncProfile,
    handleProfileUpdate,
  };
};