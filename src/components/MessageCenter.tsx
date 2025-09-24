import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MessageSquare,
  Search,
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Clock,
  User,
  Building,
  Briefcase,
  ShoppingBag,
  EyeOff
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface ConversationWithDetails {
  id: string;
  participants: string[];
  participant_names: string[];
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  is_archived: boolean;
  conversation_type: 'application' | 'contact' | 'service' | 'direct';
  related_entity?: {
    id: string;
    name: string;
    type: 'opportunity' | 'service' | 'profile';
  };
  created_at: string;
  updated_at: string;
  // Datos adicionales del participante
  other_participant: {
    id: string;
    name: string;
    avatar_url?: string;
    is_company: boolean;
  };
}

const MessageCenter = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { 
    isLoading, 
    fetchConversations,
    markMessagesAsRead,
    getUnreadCount 
  } = useMessages();

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await fetchConversations();
        setConversations(convs);
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    loadConversations();
  }, [fetchConversations, getUnreadCount]);

  // Procesar conversaciones con detalles adicionales
  const processedConversations = useMemo(() => {
    if (!conversations || !user) return [];

    return conversations.map((conv: any) => {
      // Determinar el otro participante
      const otherParticipantId = conv.participants.find((p: any) => p !== user.id);
      const otherParticipantName = conv.participant_names.find((name: any) => 
        name !== (user.email || user.user_metadata?.full_name)
      );

      // Determinar tipo de conversación basado en el contexto
      let conversationType: ConversationWithDetails['conversation_type'] = 'direct';
      let relatedEntity = undefined;

      // Lógica para determinar tipo basado en datos reales
      if (conv.last_message?.includes('aplicación') || conv.last_message?.includes('aplicó')) {
        conversationType = 'application';
        relatedEntity = {
          id: '1',
          name: 'Closer para programa High Ticket',
          type: 'opportunity'
        };
      } else if (conv.last_message?.includes('servicio') || conv.last_message?.includes('consult')) {
        conversationType = 'service';
        relatedEntity = {
          id: '1',
          name: 'Creación de funnels',
          type: 'service'
        };
      } else if (conv.last_message?.includes('perfil') || conv.last_message?.includes('contact')) {
        conversationType = 'contact';
        relatedEntity = {
          id: '1',
          name: 'Perfil de talento',
          type: 'profile'
        };
      }

      return {
        ...conv,
        conversation_type: conversationType,
        related_entity: relatedEntity,
        other_participant: {
          id: otherParticipantId || '',
          name: otherParticipantName || 'Usuario',
          avatar_url: undefined, // TODO: Obtener de perfil
          is_company: false // TODO: Determinar basado en datos reales
        }
      } as ConversationWithDetails;
    });
  }, [conversations, user]);

  // Filtrar conversaciones
  const filteredConversations = useMemo(() => {
    let filtered = processedConversations;

    // Filtrar por archivadas
    if (!showArchived) {
      filtered = filtered.filter((conv: any) => !conv.is_archived);
    } else {
      filtered = filtered.filter((conv: any) => conv.is_archived);
    }

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((conv: any) => conv.conversation_type === typeFilter);
    }

    // Filtrar por estado (leído/no leído)
    if (statusFilter === 'unread') {
      filtered = filtered.filter((conv: any) => conv.unread_count > 0);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter((conv: any) => conv.unread_count === 0);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((conv: any) => 
        conv.other_participant.name.toLowerCase().includes(searchLower) ||
        conv.last_message?.toLowerCase().includes(searchLower) ||
        conv.related_entity?.name.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por última actividad
    return filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.last_message_at || a.updated_at);
      const dateB = new Date(b.last_message_at || b.updated_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [processedConversations, searchTerm, typeFilter, statusFilter, showArchived]);

  // Obtener icono para tipo de conversación
  const getTypeIcon = (type: ConversationWithDetails['conversation_type']) => {
    switch (type) {
      case 'application':
        return <Briefcase className="h-4 w-4 text-green-600" />;
      case 'contact':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'service':
        return <ShoppingBag className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  // Obtener etiqueta para tipo de conversación
  const getTypeLabel = (type: ConversationWithDetails['conversation_type']) => {
    switch (type) {
      case 'application':
        return '🟢 Aplicación a oportunidad';
      case 'contact':
        return '🔵 Contacto desde perfil de talento';
      case 'service':
        return '🟣 Consulta sobre servicio';
      default:
        return '💬 Conversación directa';
    }
  };

  // Obtener color de badge para tipo
  const getTypeBadgeColor = (type: ConversationWithDetails['conversation_type']) => {
    switch (type) {
      case 'application':
        return 'bg-green-100 text-green-800';
      case 'contact':
        return 'bg-blue-100 text-blue-800';
      case 'service':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Manejar clic en conversación
  const handleConversationClick = async (conversation: ConversationWithDetails) => {
    // Marcar como leído
    if (conversation.unread_count > 0) {
      await markMessagesAsRead(conversation.id);
    }
    
    // Navegar a la conversación
    navigate(`/business-dashboard/messages/${conversation.id}`);
  };

  // Manejar archivar/desarchivar
  const handleArchiveToggle = async (_conversationId: string, isArchived: boolean) => {
    // TODO: Implementar funcionalidad de archivar en Supabase
    toast.info(`Conversación ${isArchived ? 'desarchivada' : 'archivada'}`);
  };

  // Manejar marcar como no leído
  const handleMarkAsUnread = async (_conversationId: string) => {
    // TODO: Implementar funcionalidad de marcar como no leído
    toast.info('Conversación marcada como no leída');
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bandeja de Mensajes</h1>
            <p className="text-gray-600">
              {filteredConversations.length} conversaciones
              {unreadCount > 0 && (
                <span className="ml-2 text-purple-600 font-medium">
                  • {unreadCount} sin leer
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2"
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {showArchived ? 'Ver activas' : 'Ver archivadas'}
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="application">🟢 Aplicaciones</SelectItem>
                <SelectItem value="contact">🔵 Contactos</SelectItem>
                <SelectItem value="service">🟣 Servicios</SelectItem>
                <SelectItem value="direct">💬 Directos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unread">No leídos</SelectItem>
                <SelectItem value="read">Leídos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showArchived ? 'No hay conversaciones archivadas' : 'No tienes conversaciones'}
              </h3>
              <p className="text-gray-600">
                {showArchived 
                  ? 'Las conversaciones archivadas aparecerán aquí'
                  : 'Los mensajes de aplicaciones y consultas aparecerán aquí'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation: any) => (
              <Card 
                key={conversation.id} 
                className="border-0 rounded-none hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleConversationClick(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.other_participant.avatar_url} />
                        <AvatarFallback className="text-sm">
                          {getInitials(conversation.other_participant.name)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.other_participant.is_company && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Building className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.other_participant.name}
                          </h3>
                          <Badge className={`text-xs ${getTypeBadgeColor(conversation.conversation_type)}`}>
                            {getTypeLabel(conversation.conversation_type)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsUnread(conversation.id);
                                }}
                              >
                                <EyeOff className="h-4 w-4 mr-2" />
                                Marcar como no leído
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveToggle(conversation.id, conversation.is_archived);
                                }}
                              >
                                {conversation.is_archived ? (
                                  <>
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
                                    Desarchivar
                                  </>
                                ) : (
                                  <>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archivar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Entidad relacionada */}
                      {conversation.related_entity && (
                        <div className="flex items-center gap-1 mb-1">
                          {getTypeIcon(conversation.conversation_type)}
                          <span className="text-sm text-gray-600 truncate">
                            {conversation.related_entity.name}
                          </span>
                        </div>
                      )}

                      {/* Último mensaje */}
                      {conversation.last_message && (
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {conversation.last_message}
                        </p>
                      )}

                      {/* Fecha */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {conversation.last_message_at 
                            ? formatDistanceToNow(new Date(conversation.last_message_at), { 
                                addSuffix: true, 
                                locale: es 
                              })
                            : formatDistanceToNow(new Date(conversation.updated_at), { 
                                addSuffix: true, 
                                locale: es 
                              })
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;
