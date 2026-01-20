import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminConversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars?: string[];
  lastMessage: string;
  lastMessageAt: string;
  unread_count: number;
  type: 'direct';
  user_type?: string;
  status?: string;
  priority?: string;
}

interface AdminMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  edited_at?: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

const AdminMessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useSupabaseAuth();
  
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, AdminMessage[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load all conversations from the conversations table (admin view)
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch all conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // Get unique user IDs
      const userIds = new Set<string>();
      (convData || []).forEach((conv: any) => {
        userIds.add(conv.user_id);
        if (conv.admin_id) userIds.add(conv.admin_id);
      });

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(userIds));

      const profilesMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      // Fetch unread counts per conversation
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('conversation_uuid')
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      const unreadCounts = new Map<string, number>();
      (unreadMessages || []).forEach((m: any) => {
        const count = unreadCounts.get(m.conversation_uuid) || 0;
        unreadCounts.set(m.conversation_uuid, count + 1);
      });

      // Transform to conversation format
      const transformedConversations: AdminConversation[] = (convData || []).map((conv: any) => {
        const userProfile = profilesMap.get(conv.user_id);
        
        return {
          id: conv.id,
          participants: [conv.user_id, user.id],
          participantNames: [
            userProfile?.full_name || 'Usuario',
            'Admin'
          ],
          participantAvatars: [userProfile?.avatar_url, null],
          lastMessage: conv.subject || 'Conversación',
          lastMessageAt: conv.last_message_at || conv.created_at,
          unread_count: unreadCounts.get(conv.id) || 0,
          type: 'direct',
          status: conv.status,
          priority: conv.priority,
        };
      });

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error loading admin conversations:', error);
      toast.error('Error al cargar las conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_uuid', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get unique sender IDs
      const senderIds = new Set<string>();
      (messages || []).forEach((m: any) => senderIds.add(m.sender_id));

      // Fetch sender profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(senderIds));

      const profilesMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      // Transform messages
      const transformedMessages: AdminMessage[] = (messages || []).map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_uuid || m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at,
        is_read: m.is_read,
        read_at: m.read_at,
        edited_at: m.edited_at,
        sender: profilesMap.get(m.sender_id) || { full_name: 'Usuario', avatar_url: undefined },
      }));

      setMessagesByConversation(prev => ({
        ...prev,
        [conversationId]: transformedMessages
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Error al cargar los mensajes');
    }
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_uuid', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      // Update local state
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [user]);

  // Send message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeId || !content.trim()) return;

    const activeConversation = conversations.find(c => c.id === activeId);
    if (!activeConversation) return;

    // Find the other participant (non-admin)
    const recipientId = activeConversation.participants.find(p => p !== user.id);
    if (!recipientId) return;

    try {
      // Get recipient's company_id for proper workspace routing
      const { data: recipientCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', recipientId)
        .maybeSingle();

      let companyId = recipientCompany?.id;
      if (!companyId) {
        const { data: memberRole } = await supabase
          .from('company_user_roles')
          .select('company_id')
          .eq('user_id', recipientId)
          .eq('status', 'accepted')
          .maybeSingle();
        companyId = memberRole?.company_id;
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          conversation_id: `chat_${user.id}_${recipientId}`,
          conversation_uuid: activeId,
          content: content,
          message_type: 'text',
          is_read: false,
          company_id: companyId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add message to local state
      const messageWithSender: AdminMessage = {
        id: newMessage.id,
        conversation_id: activeId,
        sender_id: user.id,
        content: content,
        created_at: newMessage.created_at,
        is_read: false,
        sender: { full_name: 'Admin', avatar_url: undefined },
      };

      setMessagesByConversation(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), messageWithSender]
      }));

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeId);

      toast.success('Mensaje enviado');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    }
  }, [user, activeId, conversations]);

  // Update message
  const updateMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Update local state
      if (activeId) {
        setMessagesByConversation(prev => ({
          ...prev,
          [activeId]: (prev[activeId] || []).map(m => 
            m.id === messageId ? { ...m, content: newContent, edited_at: new Date().toISOString() } : m
          )
        }));
      }

      toast.success('Mensaje editado');
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Error al editar el mensaje');
      return false;
    }
  }, [user, activeId]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Update local state
      if (activeId) {
        setMessagesByConversation(prev => ({
          ...prev,
          [activeId]: (prev[activeId] || []).filter(m => m.id !== messageId)
        }));
      }

      toast.success('Mensaje eliminado');
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error al eliminar el mensaje');
      return false;
    }
  }, [user, activeId]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Set active conversation from URL
  useEffect(() => {
    if (conversationId) {
      setActiveId(conversationId);
    }
  }, [conversationId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      markAsRead(activeId);
    }
  }, [activeId, loadMessages, markAsRead]);

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeId) || null,
    [conversations, activeId]
  );

  const activeMessages = messagesByConversation[activeId || ''] || [];

  // Create a stable key based only on conversation IDs
  const conversationsKey = useMemo(() => 
    conversations.map(c => c.id).join(','),
    [conversations]
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Acceso restringido</h2>
          <p className="text-muted-foreground">
            Necesitas permisos de administrador para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ConversationsList
        key={conversationsKey}
        conversations={conversations as any}
        activeConversationId={activeId}
        onSelectConversation={setActiveId}
        onMarkAsUnread={async () => {}}
        onMarkAsRead={markAsRead}
        onArchive={async () => {}}
        onUnarchive={async () => {}}
      />
      {activeConversation ? (
        <ChatView
          conversation={activeConversation as any}
          messages={activeMessages as any}
          onSendMessage={handleSendMessage}
          onEditMessage={updateMessage}
          onDeleteMessage={deleteMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Selecciona una conversación</p>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Cargando...' : `${conversations.length} conversaciones disponibles`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;
