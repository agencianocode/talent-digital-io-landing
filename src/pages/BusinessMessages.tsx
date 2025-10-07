import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';
import { useMessages } from '@/hooks/useMessages';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const BusinessMessages = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useSupabaseAuth();
  const { 
    conversations, 
    messagesByConversation, 
    loadMessages, 
    loadConversations,
    sendMessage, 
    markAsRead
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
    loadMessages(activeId);
    markAsRead(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const handleSendMessage = async (content: string) => {
    if (!activeId) return;
    await sendMessage(activeId, content);
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

  return (
    <div className="flex h-full">
      <ConversationsList
        conversations={conversations as any}
        activeConversationId={activeId}
        onSelectConversation={setActiveId}
      />
      <ChatView
        conversation={activeConversation as any}
        messages={activeMessages as any}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default BusinessMessages;


