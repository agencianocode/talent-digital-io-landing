import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export type ConversationLabel = 'application' | 'profile_contact' | 'service_inquiry';

export interface ConversationRow {
  id: string;
  created_at: string;
  created_by_company_id: string;
  label: ConversationLabel;
  resource_ref: any | null;
  archived_by_company: boolean;
  last_message_at: string | null;
  last_message_text: string | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConversationWithMeta extends ConversationRow {
  unread_count: number;
  other_participant_id: string;
}

export function useMessaging() {
  const { user } = useSupabaseAuth();
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, MessageRow[]>>({});
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Conversations where current user participates
      const { data: participantRows, error: pErr } = await (supabase as any)
        .from('conversation_participants')
        .select('conversation_id, unread_count')
        .eq('user_id', user.id);
      if (pErr) throw pErr;

      const conversationIds = (participantRows || []).map((r: any) => r.conversation_id);
      if (conversationIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: convRows, error: cErr } = await (supabase as any)
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      if (cErr) throw cErr;

      const mapped: ConversationWithMeta[] = (convRows || []).map((c: any) => ({
        ...c,
        unread_count: (participantRows || []).find((p: any) => p.conversation_id === c.id)?.unread_count || 0,
        other_participant_id: '' // se obtiene bajo demanda al cargar mensajes
      }));
      setConversations(mapped);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await (supabase as any)
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    setMessagesByConversation(prev => ({ ...prev, [conversationId]: (data as any) || [] }));
  }, []);

  const subscribeConversation = useCallback((conversationId: string) => {
    const channel = (supabase as any).channel(`conv:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        setMessagesByConversation(prev => ({
          ...prev,
          [conversationId]: [ ...(prev[conversationId] || []), payload.new as MessageRow ]
        }));
      })
      .subscribe();
    return () => (supabase as any).removeChannel(channel);
  }, []);

  const createConversation = useCallback(async (companyId: string, talentUserId: string, label: ConversationLabel, resourceRef?: any) => {
    const { data, error } = await (supabase as any).rpc('start_conversation', {
      p_company_id: companyId,
      p_talent_user_id: talentUserId,
      p_label: label,
      p_resource_ref: resourceRef || null
    });
    if (error) throw error;
    await loadConversations();
    return data as string;
  }, [loadConversations]);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;
    const { error } = await (supabase as any)
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, content: content.trim() });
    if (error) throw error;
  }, [user]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    // set unread_count = 0 and update last_read_at
    await (supabase as any)
      .from('conversation_participants')
      .update({ unread_count: 0, last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  return {
    conversations,
    messagesByConversation,
    loading,
    reload: loadConversations,
    loadMessages,
    subscribeConversation,
    createConversation,
    sendMessage,
    markAsRead,
  };
}


