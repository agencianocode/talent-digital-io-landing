import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';
import { useMessages } from '@/hooks/useMessages';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const TalentMessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
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
    deleteConversation
  } = useMessages();
  
  const [activeId, setActiveId] = useState<string | null>(conversationId || null);

  // Load conversations on mount only if user is authenticated
  useEffect(() => {
    if (user) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update activeId when URL changes
  useEffect(() => {
    if (conversationId && conversationId !== activeId) {
      setActiveId(conversationId);
    }
  }, [conversationId, activeId]);

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeId) || null, 
    [conversations, activeId]
  );
  
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
    
    console.log('[TalentMessagesPage] handleSendMessage called with:', {
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
  };

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
    <div className="flex h-full">
      <ConversationsList
        key={conversationsKey}
        conversations={conversations as any}
        activeConversationId={activeId}
        onSelectConversation={setActiveId}
        onMarkAsUnread={markAsUnread}
        onMarkAsRead={markAsRead}
        onArchive={archiveConversation}
        onUnarchive={unarchiveConversation}
        onDelete={deleteConversation}
      />
      <ChatView
        conversation={activeConversation as any}
        messages={activeMessages as any}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default TalentMessagesPage;

