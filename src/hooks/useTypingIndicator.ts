import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useSupabaseAuth();
  const [usersTyping, setUsersTyping] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to typing indicators for this conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    console.log('[useTypingIndicator] Setting up subscription for conversation:', conversationId);

    // Subscribe to typing indicators
    const typingSubscription = supabase
      .channel(`typing_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const typingUserId = (payload.new as any).user_id;
          if (typingUserId !== user.id) {
            console.log('[useTypingIndicator] User started typing:', typingUserId);
            setUsersTyping(prev => new Set([...prev, typingUserId]));
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
              setUsersTyping(prev => {
                const newSet = new Set(prev);
                newSet.delete(typingUserId);
                return newSet;
              });
            }, 5000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const typingUserId = (payload.old as any).user_id;
          console.log('[useTypingIndicator] User stopped typing:', typingUserId);
          setUsersTyping(prev => {
            const newSet = new Set(prev);
            newSet.delete(typingUserId);
            return newSet;
          });
        }
      )
      .subscribe();

    return () => {
      console.log('[useTypingIndicator] Cleaning up subscription');
      typingSubscription.unsubscribe();
    };
  }, [conversationId, user]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Insert typing indicator
      await supabase
        .from('typing_indicators' as any)
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          expires_at: new Date(Date.now() + 5000).toISOString()
        });

      console.log('[useTypingIndicator] Sent typing indicator');

      // Auto-delete after 3 seconds of no typing
      typingTimeoutRef.current = setTimeout(async () => {
        await stopTyping();
      }, 3000);

    } catch (error) {
      console.error('[useTypingIndicator] Error sending typing indicator:', error);
    }
  }, [conversationId, user]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      await supabase
        .from('typing_indicators' as any)
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      console.log('[useTypingIndicator] Stopped typing indicator');
    } catch (error) {
      console.error('[useTypingIndicator] Error stopping typing indicator:', error);
    }
  }, [conversationId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return {
    usersTyping: Array.from(usersTyping),
    isAnyoneTyping: usersTyping.size > 0,
    sendTypingIndicator,
    stopTyping
  };
};

