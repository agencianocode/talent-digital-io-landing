import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  User, 
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
  user_type: 'talent' | 'business' | 'admin';
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
  const [adminNotes, setAdminNotes] = useState('');

  const loadConversationDetail = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      // Fetch messages for this conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
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

      const { data: usersData } = await supabase.functions.invoke('get-all-users');
      const users: UserData[] = usersData?.users || [];
      const usersMap = new Map<string, UserData>(users.map((u) => [u.user_id, u]));

      // Determine the other participant (not admin)
      const firstMessage = messagesData[0];
      if (!firstMessage) {
        throw new Error('No hay mensajes en la conversación');
      }

      const otherUserId = firstMessage.sender_id === '00000000-0000-0000-0000-000000000000' 
        ? firstMessage.recipient_id 
        : firstMessage.sender_id;
      const otherUser = usersMap.get(otherUserId);

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
          sender_avatar: undefined, // Will be fetched from profiles if needed
          created_at: msg.created_at,
          is_read: msg.is_read,
          message_type: (msg.message_type || 'text') as 'text' | 'system' | 'automated'
        };
      });

      const lastMessage = messagesData[messagesData.length - 1] || firstMessage;

      const conversationData: ChatDetail = {
        id: conversationId,
        user_id: otherUserId,
        user_name: otherUser?.full_name || 'Usuario',
        user_email: otherUser?.email || '',
        user_type: otherUser?.role === 'business' ? 'business' : otherUser?.role === 'admin' ? 'admin' : 'talent',
        user_avatar: undefined,
        company_name: undefined,
        company_logo: undefined,
        subject: firstMessage.label === 'welcome' ? 'Mensaje de Bienvenida' : 'Conversación',
        status: 'active',
        priority: 'medium',
        created_at: firstMessage.created_at,
        updated_at: lastMessage.created_at,
        last_message_at: lastMessage.created_at,
        messages_count: messages.length,
        unread_count: messages.filter(m => !m.is_read).length,
        tags: firstMessage.label ? [firstMessage.label] : [],
        admin_notes: '',
        messages
      };

      setConversation(conversationData);
      setAdminNotes(conversationData.admin_notes || '');
    } catch (error) {
      console.error('Error loading conversation detail:', error);
      toast.error('Error al cargar los detalles de la conversación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && conversationId) {
      loadConversationDetail();
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
          conversation_id: conversationId,
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

  const handleStatusChange = async (newStatus: string) => {
    if (!conversation) return;

    try {
      // Mock update - in real implementation this would update the database
      setConversation(prev => prev ? {
        ...prev,
        status: newStatus as any,
        updated_at: new Date().toISOString()
      } : null);

      toast.success(`Conversación ${newStatus === 'resolved' ? 'resuelta' : 'actualizada'} correctamente`);
      onConversationUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!conversation) return;

    try {
      // Mock update - in real implementation this would update the database
      setConversation(prev => prev ? {
        ...prev,
        priority: newPriority as any,
        updated_at: new Date().toISOString()
      } : null);

      toast.success('Prioridad actualizada correctamente');
      onConversationUpdate();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Error al actualizar la prioridad');
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
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat con {conversation.user_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con información del usuario */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {conversation.user_avatar ? (
                    <img 
                      src={conversation.user_avatar} 
                      alt={conversation.user_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{conversation.user_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{conversation.user_email}</span>
                    </div>
                    {conversation.company_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>{conversation.company_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  <Label>Asunto</Label>
                  <p className="font-medium">{conversation.subject}</p>
                </div>
                <div>
                  <Label>Tags</Label>
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
                  <Label htmlFor="new-message">Mensaje</Label>
                  <Textarea
                    id="new-message"
                    placeholder="Escribe tu mensaje aquí..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
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

          {/* Acciones de moderación */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Moderación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="w-32">Estado:</Label>
                  <Select value={conversation.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="resolved">Resuelta</SelectItem>
                      <SelectItem value="archived">Archivada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <Label className="w-32">Prioridad:</Label>
                  <Select value={conversation.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Notas Administrativas:</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Agregar notas sobre esta conversación..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
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
