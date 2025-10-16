
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { format } from 'date-fns';
import { MessageCircle, MoreVertical, Mail, Archive, MailOpen, Briefcase, User, ShoppingBag, Trash2, Search, Filter, ArrowLeft } from 'lucide-react';

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars?: string[];
  lastMessage: string;
  lastMessageAt: string;
  unread_count: number; // Changed from unreadCount to match hook
  type: 'application' | 'direct' | 'profile_contact' | 'service_inquiry';
  opportunityTitle?: string;
  last_message?: {
    content?: string;
    created_at: string;
  };
  updated_at: string;
  archived?: boolean;
}

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onMarkAsUnread?: (conversationId: string) => void;
  onMarkAsRead?: (conversationId: string) => void;
  onArchive?: (conversationId: string) => void;
  onUnarchive?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onMarkAsUnread,
  onMarkAsRead,
  onArchive,
  onUnarchive,
  onDelete
}) => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Detectar si venimos de una página específica (por URL params)
  const shouldShowBackButton = location.search.includes('user=') || document.referrer.includes('applicants');

  if (!user) return null;

  const getOtherParticipantName = (conversation: Conversation) => {
    // Try to get from participantNames first, then fallback to a default
    if (conversation.participantNames && conversation.participantNames.length > 0) {
      return conversation.participantNames.find(name => name !== user.email) || 'Usuario';
    }
    return 'Usuario';
  };

  const getOtherParticipantAvatar = (conversation: Conversation) => {
    if (!conversation.participantAvatars || conversation.participantAvatars.length === 0) {
      return null;
    }
    // Find the index of the other participant (not current user)
    const otherIndex = conversation.participants.findIndex(id => id !== user.id);
    return conversation.participantAvatars[otherIndex] || null;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConversationTypeLabel = (type: Conversation['type']) => {
    switch (type) {
      case 'application':
        return { label: 'Aplicación', icon: Briefcase, color: 'bg-blue-100 text-blue-700' };
      case 'profile_contact':
        return { label: 'Contacto', icon: User, color: 'bg-green-100 text-green-700' };
      case 'service_inquiry':
        return { label: 'Servicio', icon: ShoppingBag, color: 'bg-purple-100 text-purple-700' };
      default:
        return { label: 'Directo', icon: MessageCircle, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const renderConversation = (conversation: Conversation) => {
    const otherParticipantName = getOtherParticipantName(conversation);
    const otherParticipantAvatar = getOtherParticipantAvatar(conversation);
    const isActive = conversation.id === activeConversationId;
    const typeInfo = getConversationTypeLabel(conversation.type);
    const TypeIcon = typeInfo.icon;
    
    return (
      <div
        key={conversation.id}
        className={`relative p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${
          isActive ? 'bg-secondary' : ''
        }`}
      >
        <div className="flex items-start space-x-3" onClick={() => onSelectConversation(conversation.id)}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
            <AvatarFallback className="text-xs">
              {getInitials(otherParticipantName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-foreground truncate">
                {otherParticipantName}
              </h3>
              <div className="flex items-center space-x-1">
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="h-5 min-w-5 text-xs">
                    {conversation.unread_count}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onMarkAsUnread && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        console.log('[ConversationsList] Calling markAsUnread for:', conversation.id);
                        onMarkAsUnread(conversation.id);
                      }}>
                        <Mail className="h-4 w-4 mr-2" />
                        Marcar como no leído
                      </DropdownMenuItem>
                    )}
                    {onMarkAsRead && conversation.unread_count > 0 && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        console.log('[ConversationsList] Calling markAsRead for:', conversation.id);
                        onMarkAsRead(conversation.id);
                      }}>
                        <MailOpen className="h-4 w-4 mr-2" />
                        Marcar como leído
                      </DropdownMenuItem>
                    )}
                    {activeTab === 'inbox' && onArchive && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onArchive(conversation.id);
                      }}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archivar
                      </DropdownMenuItem>
                    )}
                    {activeTab === 'archived' && onUnarchive && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onUnarchive(conversation.id);
                      }}>
                        <MailOpen className="h-4 w-4 mr-2" />
                        Desarchivar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conversation.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar conversación
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Message type badge */}
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className={`text-xs h-5 ${typeInfo.color}`}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeInfo.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(conversation.lastMessageAt || conversation.last_message?.created_at || conversation.updated_at), 'HH:mm')}
              </span>
            </div>
            
            {conversation.opportunityTitle && (
              <p className="text-xs text-muted-foreground mb-1">
                Re: {conversation.opportunityTitle}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage || conversation.last_message?.content || 'Conversación iniciada'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Filter by tab (inbox/archived)
    filtered = filtered.filter(c => 
      activeTab === 'inbox' ? !c.archived : c.archived
    );
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    
    // Search by participant name or message content
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        getOtherParticipantName(c).toLowerCase().includes(query) ||
        (c.lastMessage || '').toLowerCase().includes(query) ||
        (c.opportunityTitle || '').toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [conversations, activeTab, typeFilter, searchQuery]);

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        {/* Botón de Volver si viene de otra página */}
        {shouldShowBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        )}
        
        <h2 className="text-lg font-semibold text-foreground mb-3">Mensajes</h2>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'inbox' | 'archived')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inbox" className="text-xs">
              Bandeja ({conversations.filter(c => !c.archived).length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">
              Archivados ({conversations.filter(c => c.archived).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        
        {/* Type Filter */}
        <div className="mt-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 text-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="application">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Aplicaciones
                </div>
              </SelectItem>
              <SelectItem value="profile_contact">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contactos
                </div>
              </SelectItem>
              <SelectItem value="service_inquiry">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Servicios
                </div>
              </SelectItem>
              <SelectItem value="direct">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Directos
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            {searchQuery || typeFilter !== 'all' ? (
              <>
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium mb-2">Sin resultados</p>
                <p className="text-sm text-muted-foreground">
                  No se encontraron conversaciones con estos filtros
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                  }}
                  className="mt-2"
                >
                  Limpiar filtros
                </Button>
              </>
            ) : activeTab === 'archived' ? (
              <>
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tienes conversaciones archivadas</p>
              </>
            ) : (
              <>
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tienes conversaciones</p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map(renderConversation)
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conversationToDelete && onDelete) {
                  onDelete(conversationToDelete);
                  setConversationToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationsList;
