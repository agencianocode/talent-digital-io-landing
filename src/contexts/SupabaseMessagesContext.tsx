import { createContext, useContext, ReactNode } from 'react';
import { useMessages as useMessagesHook } from '@/hooks/useMessages';
import { useCompany } from '@/contexts/CompanyContext';

type MessagesContextType = ReturnType<typeof useMessagesHook>;

const SupabaseMessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const SupabaseMessagesProvider = ({ children }: { children: ReactNode }) => {
  // Get active company from context to filter messages per workspace
  // Use try-catch pattern to handle cases where CompanyContext might not be ready
  let activeCompanyId: string | undefined;
  try {
    const { activeCompany } = useCompany();
    activeCompanyId = activeCompany?.id;
  } catch (error) {
    console.warn('[SupabaseMessagesProvider] CompanyContext not available yet');
    activeCompanyId = undefined;
  }
  
  // Pass the active company ID to the messages hook
  const messages = useMessagesHook(activeCompanyId);
  
  return (
    <SupabaseMessagesContext.Provider value={messages}>
      {children}
    </SupabaseMessagesContext.Provider>
  );
};

// Default fallback values for when context is not available
const createDefaultContext = (): MessagesContextType => ({
  conversations: [],
  messagesByConversation: {},
  isLoading: false,
  unreadCount: 0,
  fetchMessages: async () => [],
  fetchConversations: async () => [],
  sendMessage: async () => null as any,
  markAsRead: async () => {},
  markAsUnread: async () => {},
  archiveConversation: async () => {},
  unarchiveConversation: async () => {},
  deleteConversation: async () => {},
  loadConversations: async () => {},
  loadMessages: async () => {},
  sendMessageToConversation: async () => null as any,
  getOrCreateConversation: async () => '',
  updateMessage: async () => false,
  deleteMessage: async () => false,
  getUnreadCount: async () => 0,
  markMessagesAsRead: async () => false,
});

export const useSupabaseMessages = (): MessagesContextType => {
  const context = useContext(SupabaseMessagesContext);
  
  // Return default context if not within provider (graceful fallback)
  if (!context) {
    console.warn('[useSupabaseMessages] Context not available, using fallback values');
    return createDefaultContext();
  }
  
  return context;
};
