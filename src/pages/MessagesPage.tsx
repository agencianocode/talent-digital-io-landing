import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseMessages } from '@/contexts/SupabaseMessagesContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';

const MessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useSupabaseAuth();
  const {
    conversations,
    messagesByConversation,
    loadConversations,
    loadMessages,
    sendMessageToConversation,
    markAsRead,
    markAsUnread,
    archiveConversation,
    unarchiveConversation,
  } = useSupabaseMessages();
  
  const [activeId, setActiveId] = useState<string | null>(null);

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
    } else if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0]?.id || null);
    }
  }, [conversationId, conversations, activeId]);

  // Load messages for active conversation
  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      markAsRead(activeId);
    }
  }, [activeId, loadMessages, markAsRead]);

  const activeConversation = useMemo(() => {
    const conv = conversations.find(c => c.id === activeId);
    if (!conv) return null;
    
    // Map to the format expected by ChatView
    return {
      id: conv.id,
      participants: conv.participants,
      participantNames: conv.participantNames,
      participantAvatars: conv.participantAvatars,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unread_count,
      type: conv.type as 'application' | 'direct',
      opportunityTitle: conv.opportunityTitle,
    };
  }, [conversations, activeId]);

  const activeMessages = useMemo(() => {
    return messagesByConversation[activeId || ''] || [];
  }, [messagesByConversation, activeId]);

  const handleSendMessage = async (content: string, fileUrl?: string, fileName?: string, fileSize?: number) => {
    if (activeId) {
      await sendMessageToConversation(activeId, content, fileUrl, fileName, fileSize);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Inicia sesión para ver tus mensajes</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <ConversationsList
        conversations={conversations as any}
        activeConversationId={activeId}
        onSelectConversation={handleSelectConversation}
        onMarkAsRead={markAsRead}
        onMarkAsUnread={markAsUnread}
        onArchive={archiveConversation}
        onUnarchive={unarchiveConversation}
      />
      <ChatView
        conversation={activeConversation}
        messages={activeMessages as any}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MessagesPage;
