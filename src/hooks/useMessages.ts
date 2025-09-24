import { useState, useCallback } from 'react';
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
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
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
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            full_name,
            avatar_url
          ),
          recipient:profiles!messages_recipient_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group messages by conversation_id
      const conversationsMap = new Map<string, Conversation>();
      
      (messages || []).forEach((message: any) => {
        const conversationId = message.conversation_id;
        
        if (!conversationsMap.has(conversationId)) {
          conversationsMap.set(conversationId, {
            id: conversationId,
            participants: [message.sender_id, message.recipient_id],
            unread_count: 0,
            created_at: message.created_at,
            updated_at: message.created_at
          });
        }
        
        const conversation = conversationsMap.get(conversationId)!;
        
        // Set last message if this is the most recent
        if (!conversation.last_message || new Date(message.created_at) > new Date(conversation.last_message.created_at)) {
          conversation.last_message = message;
          conversation.updated_at = message.created_at;
        }
        
        // Count unread messages for this user
        if (message.recipient_id === user.id && !message.is_read) {
          conversation.unread_count++;
        }
      });
      
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
      
      const { data, error } = await supabase
        .from('messages' as any)
        .insert({
          ...messageData,
          sender_id: user.id,
        })
        .select('*')
        .single();

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
      
      const { error } = await supabase
        .from('messages' as any)
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get or create conversation between two users
  const getOrCreateConversation = useCallback(async (otherUserId: string): Promise<string> => {
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

      // Create new conversation by sending a first message
      const conversationId = `conv_${user.id}_${otherUserId}_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('messages' as any)
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: otherUserId,
          message_type: 'text',
          content: 'Conversación iniciada',
        })
        .select('conversation_id')
        .single();

      if (error) throw error;
      
      return (data as any).conversation_id;
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
      const { count, error } = await supabase
        .from('messages' as any)
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }, [user]);

  return {
    isLoading,
    fetchMessages,
    fetchConversations,
    sendMessage,
    markMessagesAsRead,
    getOrCreateConversation,
    deleteMessage,
    getUnreadCount,
  };
};
