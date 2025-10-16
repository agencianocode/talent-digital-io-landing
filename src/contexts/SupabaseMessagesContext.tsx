import { createContext, useContext, ReactNode } from 'react';
import { useMessages as useMessagesHook } from '@/hooks/useMessages';

type MessagesContextType = ReturnType<typeof useMessagesHook>;

const SupabaseMessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const SupabaseMessagesProvider = ({ children }: { children: ReactNode }) => {
  const messages = useMessagesHook();
  
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
