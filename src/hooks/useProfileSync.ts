import { useCallback, useEffect, useRef, useState } from 'react';
import { useProfileCompleteness } from './useProfileCompleteness';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced hook to manage profile synchronization across components
 * Provides utilities for refreshing profile data, handling navigation, and real-time sync
 */
export const useProfileSync = () => {
  const { refreshCompleteness } = useProfileCompleteness();
  const { profile, user } = useSupabaseAuth();
  const lastRefreshRef = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Debounced refresh to prevent excessive calls
  const debouncedRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshRef.current < 1000) return; // Prevent calls within 1 second
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSyncing(true);
        lastRefreshRef.current = Date.now();
        await refreshCompleteness();
        setLastSyncTime(new Date());
        console.log('🔄 Profile data synchronized at', new Date().toISOString());
      } catch (error) {
        console.error('❌ Error during profile sync:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 300);
  }, [refreshCompleteness]);

  // Enhanced sync function with retry logic
  const syncProfile = useCallback(async (options?: { forceRefresh?: boolean; retries?: number }) => {
    const { forceRefresh = false, retries = 2 } = options || {};
    
    try {
      setIsSyncing(true);
      console.log('🔄 Starting profile sync...', { forceRefresh, retries });

      // Force a fresh fetch from the database if needed
      if (forceRefresh && user?.id) {
        const { data: freshProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const { data: freshTalentProfile } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('📄 Fresh data fetched:', { 
          profile: !!freshProfile, 
          talentProfile: !!freshTalentProfile 
        });
      }

      await refreshCompleteness();
      lastRefreshRef.current = Date.now();
      setLastSyncTime(new Date());
      
      console.log('✅ Profile sync completed successfully');
    } catch (error) {
      console.error('❌ Error syncing profile:', error);
      
      // Retry logic
      if (retries > 0) {
        console.log(`🔄 Retrying sync... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return syncProfile({ forceRefresh, retries: retries - 1 });
      }
      
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshCompleteness, user?.id]);

  // Enhanced profile update handler with better error handling
  const handleProfileUpdate = useCallback(async (callback?: () => void) => {
    try {
      console.log('🔄 Handling profile update...');
      
      // Wait a bit for database to propagate changes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force refresh with retries
      await syncProfile({ forceRefresh: true, retries: 3 });
      
      // Execute callback after successful sync
      callback?.();
      
      console.log('✅ Profile update handled successfully');
    } catch (error) {
      console.error('❌ Error handling profile update:', error);
    }
  }, [syncProfile]);

  // Automatically refresh when profile changes (with debouncing)
  useEffect(() => {
    if (profile && user?.id) {
      debouncedRefresh();
    }
  }, [profile?.updated_at, user?.id, debouncedRefresh]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Real-time sync status
  const getSyncStatus = useCallback(() => {
    if (isSyncing) return 'syncing';
    if (!lastSyncTime) return 'not-synced';
    
    const timeDiff = Date.now() - lastSyncTime.getTime();
    if (timeDiff < 30000) return 'fresh'; // Less than 30 seconds
    if (timeDiff < 300000) return 'recent'; // Less than 5 minutes
    return 'stale'; // More than 5 minutes
  }, [isSyncing, lastSyncTime]);

  return {
    syncProfile,
    handleProfileUpdate,
    isSyncing,
    lastSyncTime,
    getSyncStatus: getSyncStatus(),
    debouncedRefresh,
  };
};