import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Building, 
  Send,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'admin' | 'user' | 'system';
  sender_avatar?: string;
  created_at: string;
  is_read: boolean;
  message_type: 'text' | 'system' | 'automated';
}

interface ChatDetail {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_type: 'talent' | 'business' | 'academy' | 'admin';
  user_avatar?: string;
  company_name?: string;
  company_logo?: string;
  subject: string;
  status: 'active' | 'pending' | 'resolved' | 'archived';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  messages_count: number;
  unread_count: number;
  tags: string[];
  admin_notes?: string;
  messages: ChatMessage[];
}

interface AdminChatDetailProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
  onConversationUpdate: () => void;
}

const AdminChatDetail: React.FC<AdminChatDetailProps> = ({
  conversationId,
  isOpen,
  onClose,
  onConversationUpdate
}) => {
  const [conversation, setConversation] = useState<ChatDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadConversationDetail = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      // Fetch conversation metadata
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Fetch messages for this conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_uuid', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        throw new Error('No se encontraron mensajes para esta conversación');
      }

      // Get unique user IDs
      const userIds = new Set<string>();
      messagesData.forEach(msg => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      // Fetch user details
      interface UserData {
        user_id: string;
        full_name: string;
        email: string;
        role: string;
      }

      const { data, error: usersError } = await supabase.functions.invoke('get-all-users', { body: {} });
      if (usersError) throw usersError;
      const rawUsers: any[] = (data as any)?.users || [];
      const users: UserData[] = rawUsers.map((u) => ({
        user_id: u.user_id || u.id,
        full_name: u.full_name || 'Usuario',
        email: u.email || '',
        role: u.role || 'talent',
      }));
      const usersMap = new Map<string, UserData>(users.map((u) => [u.user_id, u]));

      // Get user data
      const userFromMap = usersMap.get(convData.user_id);

      // Fetch profiles for participants (avatar)
      let profilesMap = new Map<string, { avatar_url?: string; full_name?: string }>();
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, avatar_url, full_name')
          .in('user_id', Array.from(userIds));
        profilesMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      } catch (e) {
        // ignore if not accessible by RLS
      }

      // Transform messages
      const messages: ChatMessage[] = messagesData.map(msg => {
        const senderData = usersMap.get(msg.sender_id);
        const senderName = msg.sender_id === '00000000-0000-0000-0000-000000000000' 
          ? 'Sistema' 
          : senderData?.full_name || 'Usuario';
        
        return {
          id: msg.id,
          content: msg.content || '',
          sender_id: msg.sender_id,
          sender_name: senderName,
          sender_type: (msg.sender_id === '00000000-0000-0000-0000-000000000000' 
            ? 'system' 
            : (senderData?.role === 'admin' ? 'admin' : 'user')) as 'admin' | 'user' | 'system',
          sender_avatar: profilesMap.get(msg.sender_id)?.avatar_url,
          created_at: msg.created_at,
          is_read: msg.is_read,
          message_type: (msg.message_type || 'text') as 'text' | 'system' | 'automated'
        };
      });

      const lastMsgData = messagesData[messagesData.length - 1];

      const conversationData: ChatDetail = {
        id: conversationId,
        user_id: convData.user_id,
        user_name: userFromMap?.full_name || 'Usuario',
        user_email: userFromMap?.email || '',
        user_type: userFromMap?.role === 'business' ? 'business' : userFromMap?.role === 'admin' ? 'admin' : 'talent',
        user_avatar: profilesMap.get(convData.user_id)?.avatar_url,
        company_name: undefined,
        company_logo: undefined,
        subject: convData.subject,
        status: convData.status as 'active' | 'pending' | 'resolved' | 'archived',
        priority: convData.priority as 'high' | 'medium' | 'low',
        created_at: convData.created_at,
        updated_at: convData.updated_at,
        last_message_at: convData.last_message_at || (lastMsgData?.created_at || convData.created_at),
        messages_count: messages.length,
        unread_count: messages.filter(m => !m.is_read).length,
        tags: convData.tags || [],
        admin_notes: convData.admin_notes || '',
        messages
      };

      setConversation(conversationData);
    } catch (error) {
      console.error('Error loading conversation detail:', error);
      toast.error('Error al cargar los detalles de la conversación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const markAsRead = async () => {
      if (!conversationId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_uuid', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      onConversationUpdate();
    };

    if (isOpen && conversationId) {
      loadConversationDetail();
      markAsRead();
    }
  }, [isOpen, conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    setIsSending(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      // Insert new message
      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: conversation.user_id,
          conversation_id: `chat_${user.id}_${conversation.user_id}`,
          conversation_uuid: conversationId,
          content: newMessage,
          message_type: 'text',
          is_read: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newMsg: ChatMessage = {
        id: insertedMessage.id,
        content: newMessage,
        sender_id: user.id,
        sender_name: 'Admin',
        sender_type: 'admin',
        created_at: insertedMessage.created_at,
        is_read: false,
        message_type: 'text'
      };

      setConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMsg],
        messages_count: prev.messages_count + 1,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : null);

      setNewMessage('');
      toast.success('Mensaje enviado correctamente');
      onConversationUpdate();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Resuelta</Badge>;
      case 'archived':
        return <Badge variant="destructive" className="bg-gray-100 text-gray-800">Archivada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-100 text-green-800">Baja</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case 'talent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Talento</Badge>;
      case 'business':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Empresa</Badge>;
      case 'admin':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Admin</Badge>;
      default:
        return <Badge variant="outline">{userType}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando conversación...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!conversation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversación no encontrada</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>No se pudo cargar la información de la conversación</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 min-w-0 pr-8">
            <MessageSquare className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Chat con {conversation.user_name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con información del usuario - Destacado */}
          <Card className="border-2">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                    <AvatarImage src={conversation.user_avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl font-semibold">
                      {conversation.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Info del usuario (Móvil y Desktop unificado) */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-0.5 sm:mb-1 truncate">{conversation.user_name}</h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{conversation.user_email}</span>
                    </div>
                    {conversation.company_name && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mt-0.5 sm:mt-1">
                        <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{conversation.company_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:self-start mt-2 sm:mt-0">
                  {getUserTypeBadge(conversation.user_type)}
                  {getStatusBadge(conversation.status)}
                  {getPriorityBadge(conversation.priority)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asunto y tags */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Asunto</div>
                  <p className="font-medium">{conversation.subject}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Tags</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {conversation.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensajes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversación ({conversation.messages_count} mensajes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {conversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar a la izquierda para usuarios */}
                      {message.sender_type !== 'admin' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.sender_avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {message.sender_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_type === 'admin'
                            ? 'bg-primary text-primary-foreground'
                            : message.sender_type === 'system'
                            ? 'bg-muted/50 border'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.sender_name}</span>
                          <span className="text-xs opacity-70">
                            {formatDistanceToNow(new Date(message.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>

                      {/* Avatar a la derecha para admin */}
                      {message.sender_type === 'admin' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            A
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Enviar mensaje */}
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Mensaje</div>
                  <textarea
                    id="new-message"
                    placeholder="Escribe tu mensaje aquí..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || isSending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminChatDetail;
