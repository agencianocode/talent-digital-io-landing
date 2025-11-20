import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get real-time count of unread admin messages
 * Only counts messages sent by users TO admin that are unread
 */
export const useAdminChatBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      // Get current admin user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Count conversations with unread messages sent BY users TO admin
      // IMPORTANT: Exclude messages sent BY admin (sender_id != admin.id)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('conversation_id, sender_id, is_read, recipient_id')
        .eq('recipient_id', user.id) // Admin is the recipient
        .neq('sender_id', user.id)   // Exclude messages sent BY admin
        .eq('is_read', false)
        .neq('label', 'welcome'); // Exclude welcome messages

      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }

      // Get unique conversations with unread messages
      const uniqueConversations = new Set(messages?.map(m => m.conversation_id) || []);
      setUnreadCount(uniqueConversations.size);
    } catch (error) {
      console.error('Error in fetchUnreadCount:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to real-time changes in messages table
    const channel = supabase
      .channel('admin-chat-badge')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch count when any message changes
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { unreadCount, isLoading };
};
