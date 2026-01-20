import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ChatView from '@/components/ChatView';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, Building2, Shield, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AdminConversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars?: string[];
  lastMessage: string;
  lastMessageAt: string;
  unread_count: number;
  type: 'direct';
  user_type?: string; // 'talent' | 'company' | 'admin'
  user_role?: string;
  status?: string;
  priority?: string;
}

interface AdminMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  edited_at?: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

const AdminMessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Role filter state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'messages':
        navigate('/admin/messages');
        break;
      case 'dashboard':
        navigate('/admin');
        break;
      case 'users':
        navigate('/admin?tab=users');
        break;
      case 'companies':
        navigate('/admin?tab=companies');
        break;
      case 'opportunities':
        navigate('/admin?tab=opportunities');
        break;
      case 'marketplace':
        navigate('/admin?tab=marketplace');
        break;
      case 'publishing-requests':
        navigate('/admin?tab=publishing-requests');
        break;
      case 'email-templates':
        navigate('/admin?tab=email-templates');
        break;
      case 'notifications':
        navigate('/admin?tab=notifications');
        break;
      case 'admin-profile':
        navigate('/admin?tab=admin-profile');
        break;
      case 'settings':
        navigate('/admin?tab=settings');
        break;
      default:
        navigate(`/admin?tab=${value}`);
    }
  };
  
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, AdminMessage[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load all conversations from the conversations table (admin view)
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch all conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // Get unique user IDs
      const userIds = new Set<string>();
      (convData || []).forEach((conv: any) => {
        userIds.add(conv.user_id);
        if (conv.admin_id) userIds.add(conv.admin_id);
      });

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(userIds));

      const profilesMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );
      
      // Fetch user roles to determine user type
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', Array.from(userIds));
      
      const rolesMap = new Map(
        (userRoles || []).map((r: any) => [r.user_id, r.role])
      );
      
      // Fetch companies to check if user is a company owner
      const { data: companies } = await supabase
        .from('companies')
        .select('user_id')
        .in('user_id', Array.from(userIds));
      
      const companyOwners = new Set(
        (companies || []).map((c: any) => c.user_id)
      );

      // Fetch unread counts per conversation
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('conversation_uuid')
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      const unreadCounts = new Map<string, number>();
      (unreadMessages || []).forEach((m: any) => {
        const count = unreadCounts.get(m.conversation_uuid) || 0;
        unreadCounts.set(m.conversation_uuid, count + 1);
      });

      // Transform to conversation format
      const transformedConversations: AdminConversation[] = (convData || []).map((conv: any) => {
        const userProfile = profilesMap.get(conv.user_id);
        const userRole = rolesMap.get(conv.user_id) || 'talent';
        const isCompanyOwner = companyOwners.has(conv.user_id);
        
        // Determine user type
        let userType = 'talent';
        if (userRole === 'admin') {
          userType = 'admin';
        } else if (userRole === 'company' || isCompanyOwner) {
          userType = 'company';
        }
        
        return {
          id: conv.id,
          participants: [conv.user_id, user.id],
          participantNames: [
            userProfile?.full_name || 'Usuario',
            'Admin'
          ],
          participantAvatars: [userProfile?.avatar_url, null],
          lastMessage: conv.subject || 'Conversación',
          lastMessageAt: conv.last_message_at || conv.created_at,
          unread_count: unreadCounts.get(conv.id) || 0,
          type: 'direct',
          user_type: userType,
          user_role: userRole,
          status: conv.status,
          priority: conv.priority,
        };
      });

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error loading admin conversations:', error);
      toast.error('Error al cargar las conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_uuid', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get unique sender IDs
      const senderIds = new Set<string>();
      (messages || []).forEach((m: any) => senderIds.add(m.sender_id));

      // Fetch sender profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', Array.from(senderIds));

      const profilesMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      // Transform messages
      const transformedMessages: AdminMessage[] = (messages || []).map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_uuid || m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at,
        is_read: m.is_read,
        read_at: m.read_at,
        edited_at: m.edited_at,
        sender: profilesMap.get(m.sender_id) || { full_name: 'Usuario', avatar_url: undefined },
      }));

      setMessagesByConversation(prev => ({
        ...prev,
        [conversationId]: transformedMessages
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Error al cargar los mensajes');
    }
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_uuid', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      // Update local state
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [user]);

  // Send message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeId || !content.trim()) return;

    const activeConversation = conversations.find(c => c.id === activeId);
    if (!activeConversation) return;

    // Find the other participant (non-admin)
    const recipientId = activeConversation.participants.find(p => p !== user.id);
    if (!recipientId) return;

    try {
      // Get recipient's company_id for proper workspace routing
      const { data: recipientCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', recipientId)
        .maybeSingle();

      let companyId = recipientCompany?.id;
      if (!companyId) {
        const { data: memberRole } = await supabase
          .from('company_user_roles')
          .select('company_id')
          .eq('user_id', recipientId)
          .eq('status', 'accepted')
          .maybeSingle();
        companyId = memberRole?.company_id;
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          conversation_id: `chat_${user.id}_${recipientId}`,
          conversation_uuid: activeId,
          content: content,
          message_type: 'text',
          is_read: false,
          company_id: companyId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add message to local state
      const messageWithSender: AdminMessage = {
        id: newMessage.id,
        conversation_id: activeId,
        sender_id: user.id,
        content: content,
        created_at: newMessage.created_at,
        is_read: false,
        sender: { full_name: 'Admin', avatar_url: undefined },
      };

      setMessagesByConversation(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), messageWithSender]
      }));

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeId);

      toast.success('Mensaje enviado');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    }
  }, [user, activeId, conversations]);

  // Update message
  const updateMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Update local state
      if (activeId) {
        setMessagesByConversation(prev => ({
          ...prev,
          [activeId]: (prev[activeId] || []).map(m => 
            m.id === messageId ? { ...m, content: newContent, edited_at: new Date().toISOString() } : m
          )
        }));
      }

      toast.success('Mensaje editado');
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Error al editar el mensaje');
      return false;
    }
  }, [user, activeId]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Update local state
      if (activeId) {
        setMessagesByConversation(prev => ({
          ...prev,
          [activeId]: (prev[activeId] || []).filter(m => m.id !== messageId)
        }));
      }

      toast.success('Mensaje eliminado');
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error al eliminar el mensaje');
      return false;
    }
  }, [user, activeId]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Set active conversation from URL
  useEffect(() => {
    if (conversationId) {
      setActiveId(conversationId);
    }
  }, [conversationId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      markAsRead(activeId);
    }
  }, [activeId, loadMessages, markAsRead]);

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeId) || null,
    [conversations, activeId]
  );

  const activeMessages = messagesByConversation[activeId || ''] || [];

  // Filter conversations by role and search
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(c => c.user_type === roleFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.participantNames[0]?.toLowerCase().includes(query) ||
        c.lastMessage?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [conversations, roleFilter, searchQuery]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (userType: string) => {
    switch (userType) {
      case 'admin':
        return <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'company':
        return <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200"><Building2 className="h-3 w-3 mr-1" />Empresa</Badge>;
      default:
        return <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200"><User className="h-3 w-3 mr-1" />Talento</Badge>;
    }
  };

  if (!user) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab="messages" onTabChange={handleTabChange} />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 md:h-16 border-b flex items-center px-3 md:px-4 bg-card sticky top-0 z-10">
              <SidebarTrigger className="flex-shrink-0" />
            </header>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Acceso restringido</h2>
                <p className="text-muted-foreground">
                  Necesitas permisos de administrador para acceder a esta sección.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab="messages" onTabChange={handleTabChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b flex items-center px-3 md:px-4 bg-card sticky top-0 z-10">
            <SidebarTrigger className="flex-shrink-0" />
            <h1 className="ml-4 text-lg font-semibold">Mensajes</h1>
          </header>
          <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Conversations List */}
            <div className="w-80 border-r flex flex-col bg-card">
              {/* Search and Filter */}
              <div className="p-3 border-b space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="talent">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Talentos
                      </div>
                    </SelectItem>
                    <SelectItem value="company">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Empresas
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admins
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Conversations */}
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Cargando conversaciones...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">
                      {conversations.length === 0 ? 'No hay conversaciones' : 'Sin resultados'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setActiveId(conv.id)}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                          activeId === conv.id && "bg-muted"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={conv.participantAvatars?.[0] || undefined} />
                            <AvatarFallback className="bg-primary/10">
                              {getInitials(conv.participantNames[0] || 'Usuario')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm truncate">
                                {conv.participantNames[0]}
                              </span>
                              {conv.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs flex-shrink-0">
                                  {conv.unread_count}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {getRoleBadge(conv.user_type || 'talent')}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {conv.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: es })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Chat View */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {activeConversation ? (
                <ChatView
                  conversation={activeConversation as any}
                  messages={activeMessages as any}
                  onSendMessage={handleSendMessage}
                  onEditMessage={updateMessage}
                  onDeleteMessage={deleteMessage}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-background">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Selecciona una conversación</p>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? 'Cargando...' : `${conversations.length} conversaciones disponibles`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminMessagesPage;
