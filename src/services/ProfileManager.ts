import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * ProfileManager Service - Centralized data operations for user profiles
 * Handles synchronization between tables, caching, and optimistic updates
 */

export interface ProfileData {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  country?: string;
  city?: string;
  profile_completeness?: number;
  social_links?: any;
  created_at: string;
  updated_at: string;
}

export interface TalentProfileData {
  id: string;
  user_id: string;
  title?: string;
  bio?: string;
  skills?: string[];
  experience_level?: string;
  primary_category_id?: string;
  secondary_category_id?: string;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  currency?: string;
  availability?: string;
  industries_of_interest?: string[];
  created_at: string;
  updated_at: string;
}

export interface CachedProfileData {
  profile: ProfileData | null;
  talentProfile: TalentProfileData | null;
  completeness: number;
  lastUpdated: Date;
  isStale: boolean;
}

class ProfileManagerService {
  private cache = new Map<string, CachedProfileData>();
  private pendingUpdates = new Map<string, Promise<any>>();
  private syncQueue: Array<{ userId: string; operation: () => Promise<any> }> = [];
  private isSyncing = false;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly STALE_TTL = 30 * 1000; // 30 seconds

  /**
   * Get cached profile data or fetch from database
   */
  async getProfile(userId: string, forceRefresh = false): Promise<CachedProfileData> {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedProfile(userId);
      if (cached && !this.isCacheExpired(cached)) {
        return cached;
      }
    }

    // Fetch fresh data
    try {
      const [profileResponse, talentProfileResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('talent_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
      ]);

      const profile = profileResponse.data;
      const talentProfile = talentProfileResponse.data;
      
      // Calculate completeness
      const completeness = await this.calculateCompleteness(userId);

      const cachedData: CachedProfileData = {
        profile,
        talentProfile,
        completeness,
        lastUpdated: new Date(),
        isStale: false
      };

      // Update cache
      this.cache.set(userId, cachedData);

      return cachedData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Return cached data if available, even if stale
      const cached = this.getCachedProfile(userId);
      if (cached) {
        return { ...cached, isStale: true };
      }
      
      throw error;
    }
  }

  /**
   * Update profile with optimistic updates
   */
  async updateProfile(
    userId: string, 
    profileUpdates: Partial<ProfileData>,
    talentProfileUpdates?: Partial<TalentProfileData>
  ): Promise<CachedProfileData> {
    // Optimistic update - update cache immediately
    const cached = this.getCachedProfile(userId);
    if (cached) {
      const optimisticData: CachedProfileData = {
        ...cached,
        profile: cached.profile ? { ...cached.profile, ...profileUpdates } : cached.profile,
        talentProfile: cached.talentProfile && talentProfileUpdates 
          ? { ...cached.talentProfile, ...talentProfileUpdates } 
          : cached.talentProfile,
        lastUpdated: new Date()
      };
      this.cache.set(userId, optimisticData);
    }

    // Queue the actual database update
    const updateOperation = async () => {
      try {
        const updates = [];

        // Update profile if needed
        if (Object.keys(profileUpdates).length > 0) {
          const profileUpdate = supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('user_id', userId);
          updates.push(profileUpdate);
        }

        // Update talent profile if needed
        if (talentProfileUpdates && Object.keys(talentProfileUpdates).length > 0) {
          const talentUpdate = supabase
            .from('talent_profiles')
            .upsert({ user_id: userId, ...talentProfileUpdates })
            .eq('user_id', userId);
          updates.push(talentUpdate);
        }

        // Execute all updates
        if (updates.length > 0) {
          await Promise.all(updates);
        }

        // Recalculate completeness
        const completeness = await this.calculateCompleteness(userId);

        // Update cache with real data
        const freshData = await this.getProfile(userId, true);
        return { ...freshData, completeness };

      } catch (error) {
        console.error('Error updating profile:', error);
        
        // Revert optimistic update on error
        if (cached) {
          this.cache.set(userId, cached);
        }
        
        throw error;
      }
    };

    // Add to sync queue
    this.syncQueue.push({ userId, operation: updateOperation });
    this.processSyncQueue();

    // Return current cached data (with optimistic updates)
    return this.getCachedProfile(userId) || await this.getProfile(userId);
  }

  /**
   * Prefetch profile data for multiple users
   */
  async prefetchProfiles(userIds: string[]): Promise<void> {
    const prefetchPromises = userIds.map(userId => {
      // Only prefetch if not already cached or cache is stale
      const cached = this.getCachedProfile(userId);
      if (!cached || this.isCacheStale(cached)) {
        return this.getProfile(userId).catch(error => {
          console.warn(`Failed to prefetch profile for user ${userId}:`, error);
        });
      }
      return Promise.resolve();
    });

    await Promise.all(prefetchPromises);
  }

  /**
   * Calculate profile completeness score
   */
  private async calculateCompleteness(userId: string): Promise<number> {
    try {
      const { data } = await supabase.rpc('calculate_profile_completeness', {
        user_uuid: userId
      });
      return data || 0;
    } catch (error) {
      console.error('Error calculating completeness:', error);
      return 0;
    }
  }

  /**
   * Process sync queue to batch database operations
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      // Process up to 5 operations at a time
      const batch = this.syncQueue.splice(0, 5);
      
      await Promise.all(
        batch.map(({ operation }) => operation())
      );

      // Continue processing if there are more items
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processSyncQueue(), 100);
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get cached profile data
   */
  private getCachedProfile(userId: string): CachedProfileData | null {
    return this.cache.get(userId) || null;
  }

  /**
   * Check if cache is expired
   */
  private isCacheExpired(cached: CachedProfileData): boolean {
    const now = Date.now();
    const age = now - cached.lastUpdated.getTime();
    return age > this.CACHE_TTL;
  }

  /**
   * Check if cache is stale (but not expired)
   */
  private isCacheStale(cached: CachedProfileData): boolean {
    const now = Date.now();
    const age = now - cached.lastUpdated.getTime();
    return age > this.STALE_TTL;
  }

  /**
   * Invalidate cache for specific user
   */
  invalidateCache(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[]; staleCacheCount: number } {
    const entries = Array.from(this.cache.keys());
    const staleCacheCount = Array.from(this.cache.values())
      .filter(cached => this.isCacheStale(cached)).length;

    return {
      size: this.cache.size,
      entries,
      staleCacheCount
    };
  }

  /**
   * Subscribe to real-time profile updates
   */
  subscribeToProfileUpdates(userId: string, callback: (data: CachedProfileData) => void): () => void {
    const channel = supabase
      .channel(`profile_updates_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          try {
            const freshData = await this.getProfile(userId, true);
            callback(freshData);
          } catch (error) {
            console.error('Error handling profile update:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'talent_profiles',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          try {
            const freshData = await this.getProfile(userId, true);
            callback(freshData);
          } catch (error) {
            console.error('Error handling talent profile update:', error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// Export singleton instance
export const profileManager = new ProfileManagerService();