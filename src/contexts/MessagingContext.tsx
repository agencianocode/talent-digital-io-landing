
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { useNotifications } from './NotificationsContext';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  type: 'application' | 'direct';
  opportunityId?: string;
  opportunityTitle?: string;
}

interface MessagingState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  activeConversationId: string | null;
  isLoading: boolean;
}

interface MessagingContextType extends MessagingState {
  startConversation: (participantId: string, participantName: string, type?: string, opportunityId?: string) => string;
  sendMessage: (conversationId: string, content: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setActiveConversation: (conversationId: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

const STORAGE_KEY = 'talento_digital_conversations';
const MESSAGES_STORAGE_KEY = 'talento_digital_messages';

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, profile } = useSupabaseAuth();
  const { addNotification } = useNotifications();
  
  const [state, setState] = useState<MessagingState>({
    conversations: [],
    messages: {},
    activeConversationId: null,
    isLoading: true
  });

  // Load conversations and messages on mount
  useEffect(() => {
    const loadData = () => {
      try {
        if (!user) return;

        const savedConversations = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        const savedMessages = localStorage.getItem(`${MESSAGES_STORAGE_KEY}_${user.id}`);

        const conversations = savedConversations ? JSON.parse(savedConversations) : [];
        const messages = savedMessages ? JSON.parse(savedMessages) : {};

        setState({
          conversations,
          messages,
          activeConversationId: null,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load messaging data:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (isAuthenticated && user) {
      loadData();
    } else {
      setState({
        conversations: [],
        messages: {},
        activeConversationId: null,
        isLoading: false
      });
    }
  }, [isAuthenticated, user]);

  // Save data to localStorage
  const saveData = useCallback((conversations: Conversation[], messages: { [key: string]: Message[] }) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(conversations));
      localStorage.setItem(`${MESSAGES_STORAGE_KEY}_${user.id}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messaging data:', error);
    }
  }, [user]);

  const startConversation = useCallback((participantId: string, participantName: string, type: string = 'direct', opportunityId?: string) => {
    if (!user) return '';

    // Check if conversation already exists
    const existingConversation = state.conversations.find(conv =>
      conv.participants.includes(participantId) && conv.participants.includes(user.id)
    );

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      id: conversationId,
      participants: [user.id, participantId],
      participantNames: [profile?.full_name || 'Usuario', participantName],
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      type: type as 'application' | 'direct',
      opportunityId,
      opportunityTitle: '' // This would be filled from context
    };

    const updatedConversations = [newConversation, ...state.conversations];
    const updatedMessages = { ...state.messages, [conversationId]: [] };

    setState(prev => ({
      ...prev,
      conversations: updatedConversations,
      messages: updatedMessages
    }));

    saveData(updatedConversations, updatedMessages);
    return conversationId;
  }, [user, state.conversations, state.messages, saveData]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: user.id,
      senderName: profile?.full_name || 'Usuario',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Update messages
    const updatedMessages = {
      ...state.messages,
      [conversationId]: [...(state.messages[conversationId] || []), message]
    };

    // Update conversation
    const updatedConversations = state.conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: content.trim(),
          lastMessageAt: message.timestamp,
          unreadCount: conv.participants.find(p => p !== user.id) ? conv.unreadCount : 0
        };
      }
      return conv;
    });

    setState(prev => ({
      ...prev,
      conversations: updatedConversations,
      messages: updatedMessages
    }));

    saveData(updatedConversations, updatedMessages);

    // Send notification to other participant
    const conversation = state.conversations.find(c => c.id === conversationId);
    if (conversation) {
      const otherParticipantName = conversation.participantNames.find(name => name !== (profile?.full_name || 'Usuario'));
      addNotification({
        type: 'info',
        title: 'Nuevo mensaje',
        message: `${profile?.full_name || 'Usuario'} te ha enviado un mensaje`,
        actionUrl: `/messages/${conversationId}`,
        actionText: 'Ver conversación'
      });
    }
  }, [user, state.conversations, state.messages, saveData, addNotification]);

  const markConversationAsRead = useCallback((conversationId: string) => {
    if (!user) return;

    // Mark messages as read
    const updatedMessages = {
      ...state.messages,
      [conversationId]: (state.messages[conversationId] || []).map(msg => ({ ...msg, read: true }))
    };

    // Update conversation unread count
    const updatedConversations = state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );

    setState(prev => ({
      ...prev,
      conversations: updatedConversations,
      messages: updatedMessages
    }));

    saveData(updatedConversations, updatedMessages);
  }, [user, state.conversations, state.messages, saveData]);

  const setActiveConversation = useCallback((conversationId: string) => {
    setState(prev => ({ ...prev, activeConversationId: conversationId }));
    markConversationAsRead(conversationId);
  }, [markConversationAsRead]);

  const getConversationMessages = useCallback((conversationId: string) => {
    return state.messages[conversationId] || [];
  }, [state.messages]);

  return (
    <MessagingContext.Provider value={{
      ...state,
      startConversation,
      sendMessage,
      markConversationAsRead,
      setActiveConversation,
      getConversationMessages
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
