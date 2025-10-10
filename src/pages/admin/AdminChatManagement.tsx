import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  User, 
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
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import AdminChatFilters from '@/components/admin/AdminChatFilters';
import AdminChatDetail from '@/components/admin/AdminChatDetail';
import StartNewChatModal from '@/components/admin/StartNewChatModal';
import { useAdminChat } from '@/hooks/useAdminChat';

const AdminChatManagement: React.FC = () => {
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
    refetch
  } = useAdminChat();

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

  const handleRefresh = async () => {
    toast.loading('Actualizando conversaciones...', { id: 'refresh-conversations' });
    await refetch();
    toast.success('Conversaciones actualizadas correctamente', { id: 'refresh-conversations' });
  };

  const handleStartNewChat = async (userId: string, userName: string) => {
    try {
      // Check if conversation already exists
      const existingConversation = allConversations.find(
        (conv) => conv.user_id === userId
      );

      if (existingConversation) {
        // Open existing conversation
        setSelectedConversationId(existingConversation.id);
        setIsDetailOpen(true);
        toast.info(`Abriendo conversación existente con ${userName}`);
        return;
      }

      // Ensure we have a valid UUID for the recipient
      let targetUserId = userId;
      const uuidRegex = /^[0-9a-fA-F-]{36}$/;
      if (!targetUserId || !uuidRegex.test(targetUserId)) {
        const { data, error } = await supabase.functions.invoke('get-all-users', { body: {} });
        if (error) throw error;
        const rawUsers: any[] = (data as any)?.users || [];
        const match = rawUsers.find(
          (u) =>
            (u.full_name && u.full_name.toLowerCase() === (userName || '').toLowerCase()) ||
            (u.email && u.email.toLowerCase() === (userName || '').toLowerCase())
        );
        if (!match?.id) throw new Error('No se pudo resolver el usuario destino');
        targetUserId = match.id;
      }

      // Create new conversation ID
      const { data: authRes } = await supabase.auth.getUser();
      const currentUser = authRes?.user;
      if (!currentUser) throw new Error('No hay usuario autenticado');

      const newConversationId = `chat_${currentUser.id}_${targetUserId}_${Date.now()}`;

      // Insert initial message to create conversation
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: targetUserId,
          conversation_id: newConversationId,
          content: '¡Hola! Te escribo desde el panel de administración.',
          message_type: 'text',
          label: 'profile_contact',
          is_read: false,
        });

      if (insertError) throw insertError;

      // Refresh conversations and open the new one
      await refetch();
      setSelectedConversationId(newConversationId);
      setIsDetailOpen(true);
      toast.success(`Nueva conversación iniciada con ${userName}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Error al iniciar la conversación');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Chat con Usuarios</h2>
          <p className="text-muted-foreground">
            Gestiona todas las conversaciones y comunicación con usuarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsNewChatModalOpen(true)} 
            variant="default"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Iniciar Nuevo Chat
          </Button>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Archive className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resueltas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.unread}</p>
                <p className="text-sm text-muted-foreground">Sin leer</p>
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
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
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
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{conversation.user_name}</h3>
                      {getUserTypeBadge(conversation.user_type)}
                      {getStatusBadge(conversation.status)}
                      {getPriorityBadge(conversation.priority)}
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          {conversation.unread_count} sin leer
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {conversation.subject}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conversation.last_message_preview}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{conversation.user_email}</span>
                      </div>
                      {conversation.company_name && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>{conversation.company_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{conversation.messages_count} mensajes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(conversation.last_message_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewConversation(conversation.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
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
                  Anterior
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
                  Siguiente
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
      />
    </div>
  );
};

export default AdminChatManagement;
