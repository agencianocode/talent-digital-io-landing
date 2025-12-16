import { createContext, useContext, ReactNode } from 'react';
import { useMessages as useMessagesHook } from '@/hooks/useMessages';
import { useCompany } from '@/contexts/CompanyContext';

type MessagesContextType = ReturnType<typeof useMessagesHook>;

const SupabaseMessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const SupabaseMessagesProvider = ({ children }: { children: ReactNode }) => {
  // Get active company from context to filter messages per workspace
  const { activeCompany } = useCompany();
  
  // Pass the active company ID to the messages hook
  const messages = useMessagesHook(activeCompany?.id);
  
  return (
    <SupabaseMessagesContext.Provider value={messages}>
      {children}
    </SupabaseMessagesContext.Provider>
  );
};

export const useSupabaseMessages = () => {
  const context = useContext(SupabaseMessagesContext);
  if (!context) {
    throw new Error('useSupabaseMessages must be used within SupabaseMessagesProvider');
  }
  return context;
};
