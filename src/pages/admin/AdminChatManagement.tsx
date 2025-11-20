import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Building, 
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  Archive,
  Star,
  Trash2,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import AdminChatFilters from '@/components/admin/AdminChatFilters';
import AdminChatDetail from '@/components/admin/AdminChatDetail';
import StartNewChatModal from '@/components/admin/StartNewChatModal';
import { useAdminChat } from '@/hooks/useAdminChat';
import { useSearchParams } from 'react-router-dom';

interface AdminChatManagementProps {
  autoFilterUnread?: boolean;
}

const AdminChatManagement: React.FC<AdminChatManagementProps> = ({ autoFilterUnread = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    conversations,
    allConversations,
    filteredConversations,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    setCurrentPage,
    stats,
    refetch,
    updateConversation,
    deleteConversation
  } = useAdminChat();

  // Apply auto filter for unread messages when navigating from sidebar with badge
  useEffect(() => {
    const unreadParam = searchParams.get('unread');
    const shouldFilterUnread = autoFilterUnread || unreadParam === 'true';
    
    if (shouldFilterUnread && filters.unreadFilter !== 'unread') {
      updateFilters({ unreadFilter: 'unread' });
      // Remove the URL parameter after applying the filter
      if (unreadParam) {
        searchParams.delete('unread');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [autoFilterUnread, searchParams, filters.unreadFilter, updateFilters, setSearchParams]);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const handleViewConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedConversationId(null);
  };

  const handleConversationUpdate = () => {
    refetch();
  };

  const handleStatusChange = async (conversationId: string, newStatus: string) => {
    try {
      await updateConversation(conversationId, { status: newStatus as 'active' | 'pending' | 'resolved' | 'archived' });
      // Refetch conversations to apply current filters after status change
      await refetch();
    } catch (error) {
      console.error('Error updating conversation status:', error);
    }
  };

  const handleRefresh = async () => {
    toast.loading('Actualizando conversaciones...', { id: 'refresh-conversations' });
    await refetch();
    toast.success('Conversaciones actualizadas correctamente', { id: 'refresh-conversations' });
  };

  const handleStartNewChat = async (userId: string, userName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .eq('admin_id', user.id)
        .single();

      if (existingConv) {
        setSelectedConversationId(existingConv.id);
        setIsDetailOpen(true);
        toast.info(`Abriendo conversación existente con ${userName}`);
        return;
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          admin_id: user.id,
          subject: 'Nueva conversación',
          status: 'active',
          priority: 'medium'
        })
        .select()
        .single();

      if (convError) throw convError;

      // Insert initial message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: userId,
          conversation_id: `chat_${user.id}_${userId}_${Date.now()}`,
          conversation_uuid: newConv.id,
          content: '¡Hola! Te escribo desde el panel de administración.',
          message_type: 'text',
          is_read: false,
        });

      if (msgError) throw msgError;

      await refetch();
      setSelectedConversationId(newConv.id);
      setIsDetailOpen(true);
      toast.success(`Nueva conversación iniciada con ${userName}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Error al iniciar la conversación');
    }
  };

  const handleBulkMessage = async (userIds: string[], message: string) => {
    try {
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      // Send message to each user
      const promises = userIds.map(async (userId) => {
        // Create or get conversation with this user
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', userId)
          .eq('admin_id', user.id)
          .single();

        let conversationId;
        if (convError && convError.code === 'PGRST116') {
          // Conversation doesn't exist, create it
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
              user_id: userId,
              admin_id: user.id,
              status: 'active',
              priority: 'medium',
              subject: 'Mensaje del administrador',
              tags: ['admin-message']
            })
            .select('id')
            .single();

          if (createError) throw createError;
          conversationId = newConv.id;
        } else if (convError) {
          throw convError;
        } else {
          conversationId = conversation.id;
        }

        // Send the message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            recipient_id: userId,
            conversation_id: `chat_${user.id}_${userId}`,
            conversation_uuid: conversationId,
            content: message,
            message_type: 'text',
            is_read: false
          });

        if (messageError) throw messageError;
      });

      await Promise.all(promises);
      refetch(); // Refresh conversations list
    } catch (error) {
      console.error('Error sending bulk message:', error);
      throw error;
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

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error al cargar conversaciones</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Sistema de Chat con Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona todas las conversaciones y comunicación con usuarios
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            onClick={() => setIsNewChatModalOpen(true)} 
            variant="default"
            className="w-full sm:w-auto"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Iniciar Nuevo Chat
          </Button>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{stats.total}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{stats.active}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Resueltas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center gap-2">
              <Archive className="h-6 w-6 md:h-8 md:w-8 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{stats.archived}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Archivadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 md:h-8 md:w-8 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{stats.unread}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Sin leer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AdminChatFilters
        filters={filters}
        onFiltersChange={updateFilters}
        totalConversations={allConversations.length}
        filteredCount={filteredConversations.length}
        isLoading={isLoading}
      />

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Lista de Conversaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron conversaciones</h3>
              <p className="text-muted-foreground">
                {filteredConversations.length === 0 && allConversations.length > 0 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay conversaciones en el sistema'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Avatar + Basic Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar className="h-12 w-12 md:h-14 md:w-14">
                        <AvatarImage src={conversation.user_avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {conversation.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start flex-col gap-2 mb-2">
                        <h3 className="font-medium text-sm md:text-base">{conversation.user_name}</h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getUserTypeBadge(conversation.user_type)}
                          {getStatusBadge(conversation.status)}
                          {getPriorityBadge(conversation.priority)}
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              {conversation.unread_count} sin leer
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                        {conversation.subject}
                      </p>
                      
                      {conversation.last_message_preview && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                          {conversation.last_message_preview}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{conversation.user_email}</span>
                        </div>
                        {conversation.company_name && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{conversation.company_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 flex-shrink-0" />
                          <span>{conversation.messages_count} mensajes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {formatDistanceToNow(new Date(conversation.last_message_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewConversation(conversation.id)}
                      className="flex-1 md:flex-initial"
                    >
                      <Eye className="h-4 w-4 md:mr-2" />
                      <span className="md:inline">Ver Chat</span>
                    </Button>
                    
                    {/* Status Selector */}
                    <Select
                      value={conversation.status}
                      onValueChange={(value) => handleStatusChange(conversation.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            Activa
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Pendiente
                          </div>
                        </SelectItem>
                        <SelectItem value="resolved">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            Resuelta
                          </div>
                        </SelectItem>
                        <SelectItem value="archived">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-gray-600" />
                            Archivada
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const ok = window.confirm('¿Eliminar esta conversación y todos sus mensajes?');
                        if (!ok) return;
                        await deleteConversation(conversation.id);
                        await refetch();
                      }}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * 20) + 1} a {Math.min(currentPage * 20, filteredConversations.length)} de {filteredConversations.length} conversaciones
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <Button
                        key={page}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Detail Modal */}
      {selectedConversationId && (
        <AdminChatDetail
          conversationId={selectedConversationId}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onConversationUpdate={handleConversationUpdate}
        />
      )}

      {/* Start New Chat Modal */}
      <StartNewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onStartChat={handleStartNewChat}
        onBulkMessage={handleBulkMessage}
      />
    </div>
  );
};

export default AdminChatManagement;
