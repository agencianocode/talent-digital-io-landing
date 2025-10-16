import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'text' | 'file' | 'invitation' | 'application_update';
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  // Related data
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
  recipient?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars?: string[]; // URLs de avatares/logos
  lastMessage: string;
  lastMessageAt: string;
  unread_count: number;
  type: 'application' | 'direct' | 'profile_contact' | 'service_inquiry';
  opportunityTitle?: string;
  last_message?: Message;
  created_at: string;
  updated_at: string;
  archived?: boolean; // Si está archivado para el usuario actual
  opportunity_id?: string; // ID de la oportunidad asociada
  service_id?: string; // ID del servicio asociado
}

export interface SendMessageData {
  conversation_id: string;
  recipient_id: string;
  message_type: 'text' | 'file' | 'invitation' | 'application_update';
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export const useMessages = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Debug: Log when conversations change
  useEffect(() => {
    console.log('[useMessages] Conversations state updated:', conversations.length, 'conversations');
    conversations.forEach(conv => {
      console.log(`  - ${conv.id.substring(0, 20)}... unread: ${conv.unread_count}`);
    });
  }, [conversations]);

  // Load conversations on mount and setup realtime subscription
  useEffect(() => {
    if (!user) return;
    
    loadConversations();
    loadUnreadCount();
    
    // Setup Realtime subscription for new messages
    console.log('[useMessages] Setting up Realtime subscription for messages');
    const messagesSubscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useMessages] New message received via Realtime:', payload);
          loadConversations();
          loadUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useMessages] Message updated via Realtime (recipient):', payload);
          loadConversations();
          loadUnreadCount();
        }
      )
      .subscribe();

    // Setup Realtime subscription for conversation overrides
    const overridesSubscription = supabase
      .channel('conversation_overrides_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_overrides',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useMessages] Conversation override changed:', payload);
          loadConversations();
          loadUnreadCount();
        }
      )
      .subscribe();
    
    // Reload when window regains focus
    const handleFocus = () => {
      console.log('[useMessages] Window focused, reloading counts');
      loadUnreadCount();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Poll unread count every 30 seconds as fallback
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);
    
    return () => {
      console.log('[useMessages] Cleaning up Realtime subscription');
      messagesSubscription.unsubscribe();
      overridesSubscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch sender and recipient info separately
      const messagesWithUsers = await Promise.all(
        (data || []).map(async (message: any) => {
          const [senderResult, recipientResult] = await Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('user_id', message.sender_id).single(),
            supabase.from('profiles').select('full_name, avatar_url').eq('user_id', message.recipient_id).single()
          ]);

          return {
            ...message,
            sender: senderResult.data || { full_name: 'Usuario', avatar_url: null },
            recipient: recipientResult.data || { full_name: 'Usuario', avatar_url: null }
          };
        })
      );
      
      return messagesWithUsers;
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch conversations for a user
  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!user) return [];

    try {
      setIsLoading(true);
      
      // Get all messages where user is sender or recipient
      const { data: messages, error } = await supabase
        .from('messages' as any)
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch conversation overrides
      const { data: overrides } = await supabase
        .from('conversation_overrides' as any)
        .select('*')
        .eq('user_id', user.id);

      const overridesMap = new Map(
        (overrides || []).map((o: any) => [o.conversation_id, o])
      );
      
      // Get unique user IDs to fetch profile names
      const userIds = new Set<string>();
      (messages || []).forEach((message: any) => {
        userIds.add(message.sender_id);
        userIds.add(message.recipient_id);
      });

      // Fetch profile names for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map();
      (profiles || []).forEach((profile: any) => {
        profileMap.set(profile.user_id, profile);
      });

      // Fetch company info for business users
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('user_id, name, logo_url')
        .in('user_id', Array.from(userIds));

      if (companiesError) console.error('Error fetching companies:', companiesError);

      const companyMap = new Map();
      (companies || []).forEach((company: any) => {
        companyMap.set(company.user_id, company);
      });

      // Group messages by conversation_id
      const conversationsMap = new Map<string, Conversation>();
      
      (messages || []).forEach((message: any) => {
        const conversationId = message.conversation_id;
        
        // Check if conversation is archived for current user
        const archivedBy = message.archived_by || [];
        const isArchived = archivedBy.includes(user.id);
        
        if (!conversationsMap.has(conversationId)) {
          const senderProfile = profileMap.get(message.sender_id);
          const recipientProfile = profileMap.get(message.recipient_id);
          const senderCompany = companyMap.get(message.sender_id);
          const recipientCompany = companyMap.get(message.recipient_id);
          
          const senderAvatar = senderCompany?.logo_url || senderProfile?.avatar_url;
          const recipientAvatar = recipientCompany?.logo_url || recipientProfile?.avatar_url;
          
          // Determine conversation type based on conversation_id pattern or context
          let conversationType: Conversation['type'] = 'direct';
          if (conversationId.includes('_app_')) {
            conversationType = 'application';
          } else if (conversationId.includes('_profile_')) {
            conversationType = 'profile_contact';
          } else if (conversationId.includes('_service_')) {
            conversationType = 'service_inquiry';
          }
          
          console.log('[fetchConversations] Conversation type detected:', conversationType, 'for ID:', conversationId);
          
          conversationsMap.set(conversationId, {
            id: conversationId,
            participants: [message.sender_id, message.recipient_id],
            participantNames: [
              senderCompany?.name || senderProfile?.full_name || 'Usuario',
              recipientCompany?.name || recipientProfile?.full_name || 'Usuario'
            ],
            participantAvatars: [senderAvatar, recipientAvatar],
            lastMessage: message.content || 'Conversación iniciada',
            lastMessageAt: message.created_at,
            unread_count: 0,
            type: conversationType,
            archived: isArchived,
            created_at: message.created_at,
            updated_at: message.created_at
          });
        }
        
        const conversation = conversationsMap.get(conversationId)!;
        
        // Set last message if this is the most recent
        if (!conversation.last_message || new Date(message.created_at) > new Date(conversation.last_message.created_at)) {
          conversation.last_message = message;
          conversation.lastMessage = message.content || 'Conversación iniciada';
          conversation.lastMessageAt = message.created_at;
          conversation.updated_at = message.created_at;
        }
        
        // Count unread messages for this user
        if (message.recipient_id === user.id && !message.is_read) {
          conversation.unread_count++;
        }
      });

      // Apply overrides
      for (const [convId, override] of overridesMap) {
        const conv = conversationsMap.get(convId);
        if (conv) {
          if ((override as any).force_unread && conv.unread_count === 0) {
            conv.unread_count = 1;
          }
          if ((override as any).archived) {
            conv.archived = true;
          }
        }
      }
      
      return Array.from(conversationsMap.values()).sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Send a message
  const sendMessage = useCallback(async (messageData: SendMessageData): Promise<Message | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para enviar mensajes",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      console.log('[sendMessage] Inserting message with data:', {
        conversation_id: messageData.conversation_id,
        recipient_id: messageData.recipient_id,
        message_type: messageData.message_type,
        content: messageData.content,
        file_url: messageData.file_url,
        file_name: messageData.file_name,
        file_size: messageData.file_size
      });

      const { data, error } = await supabase
        .from('messages' as any)
        .insert({
          conversation_id: messageData.conversation_id,
          sender_id: user.id,
          recipient_id: messageData.recipient_id,
          message_type: messageData.message_type,
          content: messageData.content,
          file_url: messageData.file_url,
          file_name: messageData.file_name,
          attachment_name: messageData.file_name,
          attachment_size: messageData.file_size,
          attachment_type: messageData.file_url ? 'file' : undefined
        })
        .select('*')
        .single();
      
      console.log('[sendMessage] Insert result:', { data, error });

      if (error) throw error;
      
      // Fetch sender and recipient info
      const [senderResult, recipientResult] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).single(),
        supabase.from('profiles').select('full_name, avatar_url').eq('user_id', messageData.recipient_id).single()
      ]);

      const messageWithUsers = {
        ...(data as any),
        sender: senderResult.data || { full_name: 'Usuario', avatar_url: null },
        recipient: recipientResult.data || { full_name: 'Usuario', avatar_url: null }
      };
      
      return messageWithUsers;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      setIsLoading(true);
      
      console.log('[markMessagesAsRead] Updating messages in DB for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages' as any)
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .select();

      if (error) throw error;
      
      console.log('[markMessagesAsRead] Marked as read:', data?.length || 0, 'messages');
      
      return true;
    } catch (error) {
      console.error('[markMessagesAsRead] Error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get or create conversation between two users
  const getOrCreateConversation = useCallback(async (
    otherUserId: string, 
    conversationType: 'direct' | 'application' | 'profile_contact' | 'service_inquiry' = 'direct',
    opportunityId?: string,
    serviceId?: string
  ): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Try to find existing conversation
      const { data: existingMessages, error: searchError } = await supabase
        .from('messages' as any)
        .select('conversation_id')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .limit(1);

      if (searchError) throw searchError;
      
      if (existingMessages && existingMessages.length > 0) {
        return (existingMessages[0] as any).conversation_id;
      }

      // Create new conversation ID based on type
      // Don't insert an initial message - let the actual message be the first one
      let conversationId = '';
      switch (conversationType) {
        case 'application':
          conversationId = `conv_${user.id}_${otherUserId}_app_${opportunityId || Date.now()}`;
          break;
        case 'profile_contact':
          conversationId = `conv_${user.id}_${otherUserId}_profile_${Date.now()}`;
          break;
        case 'service_inquiry':
          conversationId = `conv_${user.id}_${otherUserId}_service_${serviceId || Date.now()}`;
          break;
        default:
          conversationId = `conv_${user.id}_${otherUserId}_${Date.now()}`;
      }
      
      // Simply return the conversation ID - the first real message will create the conversation
      return conversationId;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  }, [user]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar mensajes",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('messages' as any)
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only sender can delete their own messages

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Mensaje eliminado correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el mensaje",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Get unread message count
  const getUnreadCount = useCallback(async (): Promise<number> => {
    if (!user) return 0;

    try {
      console.log('[getUnreadCount] Fetching unread count for user:', user.id);
      
      // Get count of real unread messages
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages' as any)
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .not('archived_by', 'cs', `{${user.id}}`);

      if (messagesError) throw messagesError;

      // Get conversation IDs that already have unread messages
      const { data: unreadConversations } = await supabase
        .from('messages' as any)
        .select('conversation_id')
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .not('archived_by', 'cs', `{${user.id}}`);

      const unreadConvIds = new Set(
        (unreadConversations || []).map((m: any) => m.conversation_id)
      );

      // Get force_unread overrides that don't already have real unread messages
      let overridesCount = 0;
      if (unreadConvIds.size === 0) {
        // If no unread conversations, count all force_unread overrides
        const { count, error: overridesError } = await supabase
          .from('conversation_overrides' as any)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('force_unread', true);

        if (!overridesError) {
          overridesCount = count || 0;
        }
      } else {
        // If there are unread conversations, only count overrides for other conversations
        const { data: allOverrides, error: overridesError } = await supabase
          .from('conversation_overrides' as any)
          .select('conversation_id')
          .eq('user_id', user.id)
          .eq('force_unread', true);

        if (!overridesError && allOverrides) {
          overridesCount = allOverrides.filter(
            (o: any) => !unreadConvIds.has(o.conversation_id)
          ).length;
        }
      }

      const totalCount = (messagesCount || 0) + overridesCount;
      console.log('[getUnreadCount] Unread count:', { messagesCount, overridesCount, totalCount });
      return totalCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }, [user]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const convs = await fetchConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user, fetchConversations]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messages = await fetchMessages(conversationId);
      setMessagesByConversation(prev => ({
        ...prev,
        [conversationId]: messages
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [fetchMessages]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [getUnreadCount]);

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    try {
      console.log('[markAsRead] Marking conversation as read:', conversationId);
      
      // First, get current unread count for this conversation
      const currentConv = conversations.find(c => c.id === conversationId);
      const currentUnreadCount = currentConv?.unread_count || 0;
      
      console.log('[markAsRead] Current unread count:', currentUnreadCount);
      
      // Update local state immediately for instant feedback
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0, updated_at: new Date().toISOString() }
            : { ...conv }
        );
        console.log('[markAsRead] Local state updated');
        return updated;
      });
      
      // Update global unread count immediately
      if (currentUnreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - currentUnreadCount));
      }
      
      // Update in database - mark messages as read
      const success = await markMessagesAsRead(conversationId);
      console.log('[markAsRead] Database update success:', success);

      // Clear force_unread override if it exists
      const { error: overrideError } = await supabase
        .from('conversation_overrides' as any)
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          force_unread: false
        }, {
          onConflict: 'user_id,conversation_id'
        });

      if (overrideError) {
        console.error('[markAsRead] Error clearing override:', overrideError);
      }
      
    } catch (error) {
      console.error('[markAsRead] Error:', error);
    }
  }, [user, conversations, markMessagesAsRead]);

  // Send message (compatible with components)
  const sendMessageToConversation = useCallback(async (
    conversationId: string, 
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    _fileType?: string // Prefixed with _ to indicate intentionally unused
  ) => {
    if (!user) return;

    try {
      // Get the other participant from the conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const otherParticipantId = conversation.participants.find(id => id !== user.id);
      if (!otherParticipantId) return;

      const messageData: SendMessageData = {
        conversation_id: conversationId,
        recipient_id: otherParticipantId,
        message_type: fileUrl ? 'file' : 'text',
        content: content,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize
      };

      const newMessage = await sendMessage(messageData);
      if (newMessage) {
        // Update local state
        setMessagesByConversation(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), newMessage]
        }));
        
        // Update conversation's last message in local state
        setConversations(prev => {
          const updated = prev.map(conv => 
            conv.id === conversationId 
              ? { 
                  ...conv, 
                  lastMessage: content,
                  lastMessageAt: newMessage.created_at,
                  updated_at: newMessage.created_at
                }
              : { ...conv } // Create new object for all items
          );
          return updated; // Return new array
        });
        
        // Create notification for recipient
        try {
          // Determine recipient's dashboard URL based on their role
          // Check if recipient is a company (has company_id) or talent (has talent profile)
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', otherParticipantId)
            .maybeSingle();
          
          const isRecipientCompany = !!companyData;
          const dashboardPrefix = isRecipientCompany ? 'business-dashboard' : 'talent-dashboard';
          
          await supabase.from('notifications' as any).insert({
            user_id: otherParticipantId,
            type: 'message',
            title: 'Nuevo mensaje',
            message: content.substring(0, 100),
            action_url: `/${dashboardPrefix}/messages/${conversationId}`,
            read: false
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
        
        // Don't reload - let the local state update persist
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [user, conversations, sendMessage, loadConversations]);

  // Mark conversation as unread
  const markAsUnread = useCallback(async (conversationId: string) => {
    console.log('[markAsUnread] Function called with conversationId:', conversationId);
    if (!user) return;

    try {
      console.log('[markAsUnread] Marking conversation as unread:', conversationId);
      
      // First try to mark actual messages as unread
      const { data: updatedMessages, error: updateError } = await supabase
        .from('messages' as any)
        .update({ is_read: false, read_at: null })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', true)
        .select();

      if (updateError) throw updateError;

      console.log('[markAsUnread] Updated messages:', updatedMessages?.length || 0);

      // If no messages were updated, use override
      if (!updatedMessages || updatedMessages.length === 0) {
        console.log('[markAsUnread] No incoming messages to mark unread, using override');
        const { error: overrideError } = await supabase
          .from('conversation_overrides' as any)
          .upsert({
            user_id: user.id,
            conversation_id: conversationId,
            force_unread: true
          }, {
            onConflict: 'user_id,conversation_id'
          });

        if (overrideError) throw overrideError;
      }

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: Math.max(1, conv.unread_count) }
            : conv
        )
      );
      
      setUnreadCount(prev => prev + 1);

      toast({
        title: "Marcado como no leído",
        description: "La conversación ha sido marcada como no leída",
      });
    } catch (error) {
      console.error('[markAsUnread] Error:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar como no leído",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Archive conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      console.log('[archiveConversation] Archiving conversation:', conversationId);
      
      // Get all messages in the conversation
      const { data: messages, error } = await supabase
        .from('messages' as any)
        .select('id, archived_by')
        .eq('conversation_id', conversationId);

      if (error) throw error;

      // Update all messages to add current user to archived_by array
      for (const message of messages || []) {
        const archivedBy = (message as any).archived_by || [];
        if (!archivedBy.includes(user.id)) {
          const { error: updateError } = await supabase
            .from('messages' as any)
            .update({ archived_by: [...archivedBy, user.id] })
            .eq('id', (message as any).id);

          if (updateError) throw updateError;
        }
      }

      console.log('[archiveConversation] Successfully archived in DB');
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, archived: true }
            : conv
        )
      );

      toast({
        title: "Conversación archivada",
        description: "La conversación ha sido archivada correctamente",
      });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo archivar la conversación",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Unarchive conversation
  const unarchiveConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      console.log('[unarchiveConversation] Unarchiving conversation:', conversationId);
      
      // Get all messages in the conversation
      const { data: messages, error } = await supabase
        .from('messages' as any)
        .select('id, archived_by')
        .eq('conversation_id', conversationId);

      if (error) throw error;

      // Update all messages to remove current user from archived_by array
      for (const message of messages || []) {
        const archivedBy = (message as any).archived_by || [];
        if (archivedBy.includes(user.id)) {
          const { error: updateError } = await supabase
            .from('messages' as any)
            .update({ archived_by: archivedBy.filter((id: string) => id !== user.id) })
            .eq('id', (message as any).id);

          if (updateError) throw updateError;
        }
      }

      console.log('[unarchiveConversation] Successfully unarchived in DB');
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, archived: false }
            : conv
        )
      );

      toast({
        title: "Conversación desarchivada",
        description: "La conversación ha sido restaurada",
      });
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo desarchivar la conversación",
        variant: "destructive",
      });
    }
  }, [user, toast, loadConversations]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      console.log('[deleteConversation] Deleting conversation:', conversationId);

      // Delete all messages in the conversation where user is sender or recipient
      const { error } = await supabase
        .from('messages' as any)
        .delete()
        .eq('conversation_id', conversationId)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) throw error;

      console.log('[deleteConversation] Successfully deleted conversation');

      // Update local state immediately
      setConversations(prev => {
        const updated = prev.filter(conv => conv.id !== conversationId);
        return updated;
      });

      // Clear messages for this conversation
      setMessagesByConversation(prev => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });

      toast({
        title: "Conversación eliminada",
        description: "La conversación ha sido eliminada permanentemente",
      });
    } catch (error) {
      console.error('[deleteConversation] Error:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la conversación",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return {
    isLoading,
    conversations,
    messagesByConversation,
    unreadCount,
    loadMessages,
    loadConversations,
    sendMessage: sendMessageToConversation,
    sendMessageToConversation,
    markAsRead,
    markAsUnread,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    getOrCreateConversation,
    deleteMessage,
    getUnreadCount,
    // Legacy functions
    fetchMessages,
    fetchConversations,
    markMessagesAsRead,
  };
};
