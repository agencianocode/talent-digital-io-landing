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
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'admin' | 'user' | 'system';
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
      // Mock data for demonstration
      const mockConversations: ChatDetail[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'María García',
          user_email: 'maria@example.com',
          user_type: 'talent',
          user_avatar: undefined,
          company_name: undefined,
          company_logo: undefined,
          subject: 'Consulta sobre oportunidades de trabajo',
          status: 'active',
          priority: 'medium',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          last_message_at: '2024-01-15T14:30:00Z',
          messages_count: 5,
          unread_count: 2,
          tags: ['consulta', 'oportunidades'],
          admin_notes: 'Usuario interesado en oportunidades de diseño',
          messages: [
            {
              id: 'msg1',
              content: 'Hola, me interesa saber más sobre las oportunidades de trabajo disponibles en diseño gráfico.',
              sender_id: 'user1',
              sender_name: 'María García',
              sender_type: 'user',
              created_at: '2024-01-15T10:00:00Z',
              is_read: true,
              message_type: 'text'
            },
            {
              id: 'msg2',
              content: 'Hola María, gracias por contactarnos. Te ayudo con información sobre las oportunidades de diseño disponibles.',
              sender_id: 'admin1',
              sender_name: 'Admin Support',
              sender_type: 'admin',
              created_at: '2024-01-15T10:15:00Z',
              is_read: true,
              message_type: 'text'
            },
            {
              id: 'msg3',
              content: '¿Podrías enviarme más detalles sobre los requisitos y el proceso de aplicación?',
              sender_id: 'user1',
              sender_name: 'María García',
              sender_type: 'user',
              created_at: '2024-01-15T11:00:00Z',
              is_read: true,
              message_type: 'text'
            },
            {
              id: 'msg4',
              content: 'Por supuesto. Te envío un enlace con toda la información: https://talentodigital.io/oportunidades',
              sender_id: 'admin1',
              sender_name: 'Admin Support',
              sender_type: 'admin',
              created_at: '2024-01-15T11:30:00Z',
              is_read: true,
              message_type: 'text'
            },
            {
              id: 'msg5',
              content: 'Perfecto, muchas gracias. ¿Hay algún plazo específico para aplicar?',
              sender_id: 'user1',
              sender_name: 'María García',
              sender_type: 'user',
              created_at: '2024-01-15T14:30:00Z',
              is_read: false,
              message_type: 'text'
            }
          ]
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Carlos López',
          user_email: 'carlos@techcorp.com',
          user_type: 'business',
          user_avatar: undefined,
          company_name: 'Tech Corp',
          company_logo: undefined,
          subject: 'Problema con publicación de oportunidad',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-14T16:00:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          last_message_at: '2024-01-14T16:45:00Z',
          messages_count: 3,
          unread_count: 1,
          tags: ['problema', 'publicación'],
          admin_notes: 'Problema técnico con el formulario de publicación',
          messages: [
            {
              id: 'msg6',
              content: 'Hola, tengo un problema al intentar publicar una nueva oportunidad. El formulario no se envía correctamente.',
              sender_id: 'user2',
              sender_name: 'Carlos López',
              sender_type: 'user',
              created_at: '2024-01-14T16:00:00Z',
              is_read: true,
              message_type: 'text'
            },
            {
              id: 'msg7',
              content: 'Hola Carlos, lamento el inconveniente. ¿Podrías describir exactamente qué error aparece?',
              sender_id: 'admin1',
              sender_name: 'Admin Support',
              sender_type: 'admin',
              created_at: '2024-01-14T16:15:00Z',
              is_read: true,
              message_type: 'text'
            },
            {
              id: 'msg8',
              content: 'El error dice "Error de validación en el campo descripción" pero no veo qué está mal.',
              sender_id: 'user2',
              sender_name: 'Carlos López',
              sender_type: 'user',
              created_at: '2024-01-14T16:45:00Z',
              is_read: false,
              message_type: 'text'
            }
          ]
        }
      ];

      const conversationData = mockConversations.find(c => c.id === conversationId);
      if (!conversationData) {
        throw new Error('Conversación no encontrada');
      }

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
      // Mock send message - in real implementation this would save to database
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        content: newMessage,
        sender_id: 'admin1',
        sender_name: 'Admin Support',
        sender_type: 'admin',
        created_at: new Date().toISOString(),
        is_read: true,
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
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_type === 'admin'
                            ? 'bg-primary text-primary-foreground'
                            : message.sender_type === 'system'
                            ? 'bg-gray-100 text-gray-800'
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
