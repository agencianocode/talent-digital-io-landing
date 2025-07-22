
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContextEnhanced';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  type: 'application' | 'direct';
  opportunityTitle?: string;
}

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation
}) => {
  const { user } = useAuth();

  if (!user) return null;

  const getOtherParticipantName = (conversation: Conversation) => {
    return conversation.participantNames.find(name => name !== user.name) || 'Usuario';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-80 border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Mensajes</h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tienes conversaciones</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipantName = getOtherParticipantName(conversation);
            const isActive = conversation.id === activeConversationId;
            
            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${
                  isActive ? 'bg-secondary' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={otherParticipantName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(otherParticipantName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {otherParticipantName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conversation.lastMessageAt), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                    
                    {conversation.opportunityTitle && (
                      <p className="text-xs text-muted-foreground mb-1">
                        Re: {conversation.opportunityTitle}
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage || 'Conversación iniciada'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationsList;
