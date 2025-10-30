import { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePublicContact = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState<'proposal' | 'message'>('message');

  // Function to get or create conversation with talent
  const getOrCreateConversation = async (talentUserId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('conversation_id, conversation_uuid')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${talentUserId}),and(sender_id.eq.${talentUserId},recipient_id.eq.${user.id})`)
        .limit(1)
        .single();

      if (existingMessages?.conversation_id) {
        return existingMessages.conversation_id;
      }

      // Create new conversation ID
      const conversationId = `${user.id}_${talentUserId}_${Date.now()}`;
      return conversationId;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      return null;
    }
  };

  // Handle contact action (authenticated users)
  const handleAuthenticatedContact = async (talentUserId: string, type: 'proposal' | 'message') => {
    const conversationId = await getOrCreateConversation(talentUserId);
    
    if (conversationId) {
      // Redirect to messages page with the conversation
      navigate(`/business-dashboard/messages?conversation=${conversationId}&recipient=${talentUserId}`);
      
      toast.success(
        type === 'proposal' ? 'Abre el chat para enviar tu propuesta' : 'Chat abierto',
        { description: 'Ahora puedes enviar tu mensaje directamente' }
      );
    } else {
      toast.error('Error al abrir el chat', {
        description: 'No se pudo crear la conversación. Intenta nuevamente.'
      });
    }
  };

  // Handle contact action (unauthenticated users)
  const handleUnauthenticatedContact = (type: 'proposal' | 'message') => {
    setContactType(type);
    setIsContactModalOpen(true);
  };

  // Main handler that decides which flow to use
  const handleContact = (talentUserId: string, type: 'proposal' | 'message' = 'message') => {
    if (user) {
      handleAuthenticatedContact(talentUserId, type);
    } else {
      handleUnauthenticatedContact(type);
    }
  };

  return {
    isContactModalOpen,
    setIsContactModalOpen,
    contactType,
    handleContact,
    isAuthenticated: !!user
  };
};