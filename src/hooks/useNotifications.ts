import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useIsMounted } from './useIsMounted';

export const useNotifications = () => {
  const isMountedRef = useIsMounted();
  const { user } = useSupabaseAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unread count from Supabase
  const fetchUnreadCount = useCallback(async () => {
    if (!user || !isMountedRef.current) {
      if (isMountedRef.current) setUnreadCount(0);
      return;
    }

    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      
      // Check if notifications table exists and has data
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.log('[useNotifications] Error fetching notifications:', error.message);
        if (isMountedRef.current) setUnreadCount(0);
        return;
      }
      
      if (isMountedRef.current) {
        setUnreadCount(count || 0);
        console.log('[useNotifications] Unread count:', count || 0);
      }
    } catch (error) {
      console.error('[useNotifications] Error fetching unread count:', error);
      if (isMountedRef.current) setUnreadCount(0);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, isMountedRef]);

  // Load unread count on mount and setup realtime subscription
  useEffect(() => {
    fetchUnreadCount();
    
    if (!user) return;
    
    // Setup Realtime subscription for new notifications
    console.log('[useNotifications] Setting up Realtime subscription for notifications');
    
    // Create channel first but don't subscribe yet
    const notificationsChannel = supabase.channel('notifications_channel');
    
    // Configure listeners
    notificationsChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          if (!isMountedRef.current) return;
          console.log('[useNotifications] New notification received via Realtime:', payload);
          
          // Automatically process the notification to send emails
          const notificationId = payload.new?.id;
          if (notificationId && isMountedRef.current) {
            try {
              console.log('[useNotifications] Auto-processing notification:', notificationId);
              const { error } = await supabase.functions.invoke('process-notification', {
                body: { notification_id: notificationId }
              });
              
              if (error) {
                console.error('[useNotifications] Error auto-processing notification:', error);
              } else {
                console.log('[useNotifications] Notification processed successfully');
              }
            } catch (error) {
              console.error('[useNotifications] Exception auto-processing notification:', error);
            }
          }
          
          if (isMountedRef.current) {
            fetchUnreadCount();
          }
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
          if (!isMountedRef.current) return;
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
          if (!isMountedRef.current) return;
          console.log('[useNotifications] Notification deleted via Realtime:', payload);
          fetchUnreadCount();
        }
      );
    
    // Only subscribe if still mounted
    if (isMountedRef.current) {
      notificationsChannel.subscribe();
    }
    
    const notificationsSubscription = notificationsChannel;
    
    // Reload when window regains focus
    const handleFocus = () => {
      if (!isMountedRef.current) return;
      console.log('[useNotifications] Window focused, reloading count');
      fetchUnreadCount();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Poll every 30 seconds as fallback
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      fetchUnreadCount();
    }, 30000);
    
    return () => {
      console.log('[useNotifications] Cleaning up Realtime subscription');
      notificationsSubscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchUnreadCount, user]);

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

