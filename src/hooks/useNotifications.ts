import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useNotifications = (companyId?: string) => {
  const { user } = useSupabaseAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unread count from Supabase filtered by company_id
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      
      // Build query with optional company_id filter
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      // Filter by company_id if provided
      if (companyId) {
        // Include notifications for this company OR global notifications (company_id is null)
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { count, error } = await query;

      if (error) {
        console.log('[useNotifications] Error fetching notifications:', error.message);
        setUnreadCount(0);
        return;
      }
      
      setUnreadCount(count || 0);
      console.log('[useNotifications] Unread count for company', companyId, ':', count || 0);
    } catch (error) {
      console.error('[useNotifications] Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user, companyId]);

  // Load unread count on mount and when companyId changes
  useEffect(() => {
    fetchUnreadCount();
    
    if (!user) return;
    
    // Setup Realtime subscription for new notifications
    console.log('[useNotifications] Setting up Realtime subscription for notifications');
    const notificationsSubscription = supabase
      .channel(`notifications_channel_${companyId || 'all'}`)
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
          
          // Check if notification is for the current company
          const newNotification = payload.new as any;
          if (companyId && newNotification.company_id && newNotification.company_id !== companyId) {
            console.log('[useNotifications] Notification for different company, skipping');
            return;
          }
          
          // Just update the counter - processing is handled by database trigger or the creating function
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
  }, [fetchUnreadCount, user, companyId]);

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
