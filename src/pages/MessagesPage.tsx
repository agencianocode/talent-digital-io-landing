
import React from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';

const MessagesPage = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    sendMessage,
    getConversationMessages
  } = useMessaging();

  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null;
  const activeMessages = activeConversationId ? getConversationMessages(activeConversationId) : [];

  const handleSendMessage = (content: string) => {
    if (activeConversationId) {
      sendMessage(activeConversationId, content);
    }
  };

  return (
    <div className="h-screen flex">
      <ConversationsList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversation}
      />
      <ChatView
        conversation={activeConversation}
        messages={activeMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MessagesPage;
