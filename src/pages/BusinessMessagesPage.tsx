import React from 'react';
import { useParams } from 'react-router-dom';
import MessageCenter from '@/components/MessageCenter';
import ChatView from '@/components/ChatView';
import { useMessages } from '@/hooks/useMessages';

const BusinessMessagesPage = () => {
  const { conversationId } = useParams();
  const { 
    fetchConversations,
    fetchMessages,
    sendMessage
  } = useMessages();

  const [conversations, setConversations] = React.useState<any[]>([]);
  const [activeMessages, setActiveMessages] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await fetchConversations();
        setConversations(convs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    loadConversations();
  }, [fetchConversations]);

  React.useEffect(() => {
    if (conversationId) {
      const loadMessages = async () => {
        try {
          const messages = await fetchMessages(conversationId);
          setActiveMessages(messages);
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };
      loadMessages();
    }
  }, [conversationId, fetchMessages]);

  const activeConversation = conversations.find((conv: any) => conv.id === conversationId);

  const handleSendMessage = async (content: string) => {
    if (conversationId) {
      await sendMessage({
        conversation_id: conversationId,
        recipient_id: '', // TODO: Obtener del contexto
        message_type: 'text',
        content
      });
    }
  };

  if (conversationId && activeConversation) {
    return (
      <div className="h-screen flex">
        <div className="w-80 border-r">
          <MessageCenter />
        </div>
        <div className="flex-1">
          <ChatView
            conversation={activeConversation}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <MessageCenter />
    </div>
  );
};

export default BusinessMessagesPage;
