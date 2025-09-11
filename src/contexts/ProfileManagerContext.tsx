import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileManager, CachedProfileData } from '@/services/ProfileManager';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ProfileManagerContextType {
  // Current profile data
  profileData: CachedProfileData | null;
  isLoading: boolean;
  isStale: boolean;
  error: Error | null;

  // Operations
  refreshProfile: (forceRefresh?: boolean) => Promise<void>;
  updateProfile: (profileUpdates: any, talentProfileUpdates?: any) => Promise<void>;
  prefetchRelatedProfiles: (userIds: string[]) => Promise<void>;

  // Cache management
  invalidateCache: () => void;
  getCacheStats: () => any;

  // Real-time updates
  isRealTimeEnabled: boolean;
  toggleRealTime: (enabled: boolean) => void;
}

const ProfileManagerContext = createContext<ProfileManagerContextType | null>(null);

export const useProfileManager = () => {
  const context = useContext(ProfileManagerContext);
  if (!context) {
    throw new Error('useProfileManager must be used within ProfileManagerProvider');
  }
  return context;
};

interface ProfileManagerProviderProps {
  children: React.ReactNode;
}

export const ProfileManagerProvider: React.FC<ProfileManagerProviderProps> = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [profileData, setProfileData] = useState<CachedProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Load profile data when user changes
  useEffect(() => {
    if (!user?.id) {
      setProfileData(null);
      setError(null);
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await profileManager.getProfile(user.id);
        setProfileData(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id || !isRealTimeEnabled) {
      return;
    }

    const unsubscribe = profileManager.subscribeToProfileUpdates(
      user.id,
      (freshData) => {
        setProfileData(freshData);
        console.log('📡 Real-time profile update received');
      }
    );

    return unsubscribe;
  }, [user?.id, isRealTimeEnabled]);

  // Refresh profile data
  const refreshProfile = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await profileManager.getProfile(user.id, forceRefresh);
      setProfileData(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error refreshing profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update profile with optimistic updates
  const updateProfile = useCallback(async (profileUpdates: any, talentProfileUpdates?: any) => {
    if (!user?.id) return;

    setError(null);

    try {
      const updatedData = await profileManager.updateProfile(
        user.id,
        profileUpdates,
        talentProfileUpdates
      );
      setProfileData(updatedData);
    } catch (err) {
      setError(err as Error);
      console.error('Error updating profile:', err);
      throw err; // Re-throw to allow components to handle the error
    }
  }, [user?.id]);

  // Prefetch related profiles (e.g., for team members, applicants)
  const prefetchRelatedProfiles = useCallback(async (userIds: string[]) => {
    try {
      await profileManager.prefetchProfiles(userIds);
    } catch (err) {
      console.warn('Error prefetching profiles:', err);
    }
  }, []);

  // Cache management
  const invalidateCache = useCallback(() => {
    if (user?.id) {
      profileManager.invalidateCache(user.id);
      refreshProfile(true);
    }
  }, [user?.id, refreshProfile]);

  const getCacheStats = useCallback(() => {
    return profileManager.getCacheStats();
  }, []);

  const toggleRealTime = useCallback((enabled: boolean) => {
    setIsRealTimeEnabled(enabled);
  }, []);

  const contextValue: ProfileManagerContextType = {
    // Current profile data
    profileData,
    isLoading,
    isStale: profileData?.isStale || false,
    error,

    // Operations
    refreshProfile,
    updateProfile,
    prefetchRelatedProfiles,

    // Cache management
    invalidateCache,
    getCacheStats,

    // Real-time updates
    isRealTimeEnabled,
    toggleRealTime,
  };

  return (
    <ProfileManagerContext.Provider value={contextValue}>
      {children}
    </ProfileManagerContext.Provider>
  );
};