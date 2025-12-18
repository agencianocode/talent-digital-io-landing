import { useEffect, useMemo, useState, useRef } from 'react';
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
  
  // Use ref to track initialization state without causing re-renders
  const initializedFromQueryRef = useRef(false);

  // Handle ?user= query param to start conversation with specific user
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (!targetUserId || !user) {
      return;
    }

    // Prevent re-initialization if already initialized
    if (initializedFromQueryRef.current) {
      return;
    }

    const initConversation = async () => {
      setIsResolvingId(true);
      initializedFromQueryRef.current = true;
      
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
        setIsResolvingId(false);
        
        // Reload conversations
        await loadConversations();
        
        // Clear the query param from URL after everything is set up
        // Use replace to avoid adding to history
        setSearchParams({}, { replace: true });
        
      } catch (error) {
        console.error('Error creating conversation:', error);
        setTempConversation(null);
        setIsResolvingId(false);
        initializedFromQueryRef.current = false;
      }
    };

    initConversation();
  }, [searchParams, user, getOrCreateConversation, setSearchParams, loadConversations]);

  // Resolve conversationId from URL parameter (path param, not query param)
  useEffect(() => {
    if (!conversationId) {
      // Only reset activeId if we don't have any active state
      // This prevents clearing when initialized from query param
      if (!tempConversation && !pendingRecipientId && !activeId) {
        setActiveId(null);
      }
      return;
    }

    setIsResolvingId(true);
    setActiveId(conversationId);
    setIsResolvingId(false);
  }, [conversationId, tempConversation, pendingRecipientId, activeId]);

  // Load conversations on mount only if user is authenticated
  useEffect(() => {
    if (user) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Clear temp conversation when real conversation becomes available
  useEffect(() => {
    if (tempConversation && activeId === tempConversation.id) {
      const realConv = conversations.find(c => c.id === tempConversation.id);
      if (realConv) {
        // Wait a bit before clearing to ensure stability
        const hasMessages = (messagesByConversation[tempConversation.id]?.length ?? 0) > 0;
        if (hasMessages) {
          setTempConversation(null);
        }
      }
    }
  }, [conversations, tempConversation, activeId, messagesByConversation]);

  const activeConversation = useMemo(() => {
    if (!activeId) return null;
    
    // Use temp conversation if available and matches activeId
    if (tempConversation && tempConversation.id === activeId) {
      return tempConversation;
    }
    
    // Try to find in real conversations
    const realConv = conversations.find(c => c.id === activeId);
    if (realConv) {
      return realConv;
    }
    
    // If activeId is set but no conversation found, return temp if it exists
    // This handles the case where conversations haven't loaded yet
    if (tempConversation) {
      return tempConversation;
    }
    
    return null;
  }, [conversations, activeId, tempConversation]);
  
  const activeMessages = messagesByConversation[activeId || ''] || [];

  // Create a key that changes when conversations change - must be before any returns
  const conversationsKey = useMemo(() => 
    conversations.map(c => `${c.id}-${c.unread_count}`).join(','),
    [conversations]
  );

  useEffect(() => {
    if (!activeId) return;
    
    const loadConversationData = async () => {
      await loadMessages(activeId);
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
      initializedFromQueryRef.current = false;
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
      {activeConversation ? (
        <ChatView
          conversation={activeConversation as any}
          messages={activeMessages as any}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Selecciona una conversación para ver los mensajes</p>
        </div>
      )}
    </div>
  );
};

export default BusinessMessagesPage;
