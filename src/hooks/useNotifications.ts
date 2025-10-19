import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // For now, always return 0 until notifications system is properly implemented
  // This prevents showing fake notification counts
  useEffect(() => {
    setUnreadCount(0);
  }, [user]);

  // Fetch unread count from Supabase
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if notifications table exists and has data
      const { count, error } = await supabase
        .from('notifications' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.log('[useNotifications] Notifications table not found or error:', error.message);
        // If table doesn't exist or has errors, set count to 0
        setUnreadCount(0);
        return;
      }
      
      setUnreadCount(count || 0);
      console.log('[useNotifications] Unread count:', count || 0);
    } catch (error) {
      console.error('[useNotifications] Error fetching unread count:', error);
      // Always set to 0 if there's any error
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load unread count on mount and setup realtime subscription
  // Commented out until notifications system is properly implemented
  /*
  useEffect(() => {
    fetchUnreadCount();
    
    if (!user) return;
    
    // Setup Realtime subscription for new notifications
    console.log('[useNotifications] Setting up Realtime subscription for notifications');
    const notificationsSubscription = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useNotifications] New notification received via Realtime:', payload);
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useNotifications] Notification updated via Realtime:', payload);
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useNotifications] Notification deleted via Realtime:', payload);
          fetchUnreadCount();
        }
      )
      .subscribe();
    
    // Reload when window regains focus
    const handleFocus = () => {
      console.log('[useNotifications] Window focused, reloading count');
      fetchUnreadCount();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Poll every 30 seconds as fallback
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => {
      console.log('[useNotifications] Cleaning up Realtime subscription');
      notificationsSubscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchUnreadCount, user]);
  */

  // Reload unread count (can be called externally)
  const reload = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    reload
  };
};

