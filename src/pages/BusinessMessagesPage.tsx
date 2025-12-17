import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';
import { useSupabaseMessages } from '@/contexts/SupabaseMessagesContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

const BusinessMessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSupabaseAuth();
  const { 
    conversations, 
    messagesByConversation, 
    loadMessages, 
    loadConversations,
    sendMessageToConversation, 
    markAsRead,
    markAsUnread,
    archiveConversation,
    unarchiveConversation,
    getOrCreateConversation,
  } = useSupabaseMessages();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isResolvingId, setIsResolvingId] = useState(false);
  const [pendingRecipientId, setPendingRecipientId] = useState<string | null>(null);
  const [tempConversation, setTempConversation] = useState<any>(null);

  // Handle ?user= query param to start conversation with specific user
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (!targetUserId || !user) return;

    const initConversation = async () => {
      setIsResolvingId(true);
      try {
        console.log('[BusinessMessagesPage] Creating conversation with user:', targetUserId);
        
        // Get or create conversation with the target user
        const convId = await getOrCreateConversation(targetUserId, 'profile_contact');
        console.log('[BusinessMessagesPage] Conversation ID:', convId);
        setPendingRecipientId(targetUserId);
        
        // Fetch target user profile to create temp conversation
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', targetUserId)
          .single();
        
        // Create temporary conversation object to show chat interface
        const tempConv = {
          id: convId,
          participants: [user.id, targetUserId],
          participantNames: [
            user.email || 'Usuario',
            targetProfile?.full_name || 'Usuario'
          ],
          participantAvatars: [
            null,
            targetProfile?.avatar_url || null
          ],
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unread_count: 0,
          type: 'profile_contact' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setTempConversation(tempConv);
        setActiveId(convId);
        
        // Reload conversations to ensure the new one appears in the list
        await loadConversations();
        
        // Wait a bit and reload again, then clear temp conversation
        setTimeout(async () => {
          await loadConversations();
          // Clear temp conversation after a delay to allow real conversation to load
          setTimeout(() => {
            setTempConversation(null);
            setIsResolvingId(false);
          }, 300);
          // Clear the query param from URL
          setSearchParams({}, { replace: true });
        }, 500);
      } catch (error) {
        console.error('Error creating conversation:', error);
        setTempConversation(null);
        setIsResolvingId(false);
      }
    };

    initConversation();
  }, [searchParams, user, getOrCreateConversation, setSearchParams, loadConversations]);

  // Resolve conversationId from URL parameter
  useEffect(() => {
    if (!conversationId) {
      // Don't reset activeId if we have a pending user conversation
      if (!searchParams.get('user')) {
        setActiveId(null);
      }
      return;
    }

    setIsResolvingId(true);
    setActiveId(conversationId);
    setIsResolvingId(false);
  }, [conversationId, searchParams]);

  // Load conversations on mount only if user is authenticated
  useEffect(() => {
    if (user) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeConversation = useMemo(() => {
    // Use temp conversation if available, otherwise find in conversations
    if (tempConversation && tempConversation.id === activeId) {
      return tempConversation;
    }
    return conversations.find(c => c.id === activeId) || null;
  }, [conversations, activeId, tempConversation]);
  
  const activeMessages = messagesByConversation[activeId || ''] || [];

  useEffect(() => {
    if (!activeId) return;
    
    const loadConversationData = async () => {
      await loadMessages(activeId);
      // Marcar automáticamente como leído al seleccionar la conversación
      await markAsRead(activeId);
    };
    
    loadConversationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const handleSendMessage = async (
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileType?: string
  ) => {
    if (!activeId) return;
    
    console.log('[BusinessMessagesPage] handleSendMessage called with:', {
      content,
      fileUrl,
      fileName,
      fileSize,
      fileType
    });
    
    await sendMessageToConversation(
      activeId, 
      content,
      fileUrl,
      fileName,
      fileSize,
      fileType
    );
    
    // Clear pending recipient and temp conversation after first message
    if (pendingRecipientId) {
      setPendingRecipientId(null);
      setTempConversation(null);
      // Reload conversations to get the real conversation with the message
      await loadConversations();
    }
  };

  // Show loading state while resolving conversation ID
  if (isResolvingId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  // Show authentication message if user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Inicia sesión para ver tus mensajes</h2>
          <p className="text-muted-foreground mb-6">
            Necesitas estar autenticado para acceder a la bandeja de mensajes.
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Create a key that changes when conversations change
  const conversationsKey = useMemo(() => 
    conversations.map(c => `${c.id}-${c.unread_count}`).join(','),
    [conversations]
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ConversationsList
        key={conversationsKey}
        conversations={conversations as any}
        activeConversationId={activeId}
        onSelectConversation={setActiveId}
        onMarkAsUnread={markAsUnread}
        onMarkAsRead={markAsRead}
        onArchive={archiveConversation}
        onUnarchive={unarchiveConversation}
      />
      <ChatView
        conversation={activeConversation as any}
        messages={activeMessages as any}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default BusinessMessagesPage;
