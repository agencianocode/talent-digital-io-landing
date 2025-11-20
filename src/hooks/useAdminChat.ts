import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatFilters {
  searchQuery: string;
  userTypeFilter: string;
  statusFilter: string;
  dateRange: string;
  priorityFilter: string;
  unreadFilter: string;
}


interface ChatData {
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
  last_message_preview?: string;
}

export const useAdminChat = () => {
  const [conversations, setConversations] = useState<ChatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChatFilters>({
    searchQuery: '',
    userTypeFilter: 'all',
    statusFilter: 'active',
    dateRange: 'all',
    priorityFilter: 'all',
    unreadFilter: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationsPerPage] = useState(20);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get admin user
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) return;
      const adminUserId = adminUser.id;

      // Fetch conversations with related data
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      // Get user IDs
      const userIds = conversationsData.map(c => c.user_id);

      // Fetch users data
      const { data, error: usersError } = await supabase.functions.invoke('get-all-users', { body: {} });
      if (usersError) throw usersError;

      interface UserData {
        user_id: string;
        full_name: string;
        email: string;
        role: string;
        avatar_url?: string | null;
      }

      const rawUsers: any[] = (data as any)?.users || [];
      const users: UserData[] = rawUsers.map((u) => ({
        user_id: u.user_id || u.id,
        full_name: u.full_name || 'Usuario',
        email: u.email || '',
        role: u.role || 'talent',
        avatar_url: u.avatar_url || null,
      }));
      const usersMap = new Map<string, UserData>(users.map((u) => [u.user_id, u]));

      // Fetch profiles for avatars
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, avatar_url, full_name')
        .in('user_id', userIds);

      const profilesMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      // Get current admin user ID
      const { data: { user } } = await supabase.auth.getUser();
      const adminId = user?.id;

      // Get message counts
      const conversationIds = conversationsData.map(c => c.id);
      const { data: messagesData } = await supabase
        .from('messages')
        .select('conversation_uuid, content, created_at, is_read, sender_id, recipient_id')
        .in('conversation_uuid', conversationIds)
        .order('created_at', { ascending: false });

      // Group messages by conversation
      const messagesMap = new Map<string, any[]>();
      messagesData?.forEach(msg => {
        if (msg.conversation_uuid) {
          if (!messagesMap.has(msg.conversation_uuid)) {
            messagesMap.set(msg.conversation_uuid, []);
          }
          messagesMap.get(msg.conversation_uuid)!.push(msg);
        }
      });

      // Transform data
      const conversations: ChatData[] = conversationsData.map(conv => {
        const user = usersMap.get(conv.user_id);
        const profile = profilesMap.get(conv.user_id);
        const messages = messagesMap.get(conv.id) || [];
        const lastMsg = messages[0];
        
        // Count only unread messages sent BY users TO admin (for future use if needed)
        
        return {
          id: conv.id,
          user_id: conv.user_id,
          user_name: user?.full_name || profile?.full_name || 'Usuario',
          user_email: user?.email || '',
          user_type: user?.role?.includes('business') || user?.role?.includes('academy') ? 'business' : user?.role === 'admin' ? 'admin' : 'talent',
          user_avatar: profile?.avatar_url ? String(profile.avatar_url) : undefined,
          subject: conv.subject ? String(conv.subject) : 'Conversación',
          status: (conv.status ? String(conv.status) : 'active') as 'active' | 'pending' | 'resolved' | 'archived',
          priority: (conv.priority ? String(conv.priority) : 'medium') as 'high' | 'medium' | 'low',
          tags: conv.tags || [],
          admin_notes: conv.admin_notes ? String(conv.admin_notes) : undefined,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          last_message_at: conv.last_message_at || conv.created_at,
          messages_count: messages.length,
          unread_count: messages.filter(m => !m.is_read && m.recipient_id === adminUserId && m.sender_id === conv.user_id).length,
          last_message_preview: lastMsg?.content ? String(lastMsg.content).substring(0, 100) : undefined
        };
      });

      setConversations(conversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar las conversaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(conversation => 
        (conversation.user_name && conversation.user_name.toLowerCase().includes(query)) ||
        (conversation.user_email && conversation.user_email.toLowerCase().includes(query)) ||
        (conversation.subject && conversation.subject.toLowerCase().includes(query)) ||
        (conversation.company_name && conversation.company_name.toLowerCase().includes(query)) ||
        (conversation.last_message_preview && conversation.last_message_preview.toLowerCase().includes(query))
      );
    }

    // User type filter
    if (filters.userTypeFilter !== 'all') {
      filtered = filtered.filter(conversation => conversation.user_type === filters.userTypeFilter);
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(conversation => conversation.status === filters.statusFilter);
    }

    // Priority filter
    if (filters.priorityFilter !== 'all') {
      filtered = filtered.filter(conversation => conversation.priority === filters.priorityFilter);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(conversation => 
        new Date(conversation.created_at) >= startDate
      );
    }

    // Unread filter
    if (filters.unreadFilter !== 'all') {
      if (filters.unreadFilter === 'unread') {
        filtered = filtered.filter(conversation => conversation.unread_count > 0);
      } else if (filters.unreadFilter === 'read') {
        filtered = filtered.filter(conversation => conversation.unread_count === 0);
      }
    }

    // Sort by last message date (most recent first)
    filtered.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    return filtered;
  }, [conversations, filters]);

  const paginatedConversations = useMemo(() => {
    const startIndex = (currentPage - 1) * conversationsPerPage;
    const endIndex = startIndex + conversationsPerPage;
    return filteredConversations.slice(startIndex, endIndex);
  }, [filteredConversations, currentPage, conversationsPerPage]);

  const totalPages = Math.ceil(filteredConversations.length / conversationsPerPage);

  const updateFilters = (newFilters: Partial<ChatFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateConversation = async (conversationId: string, updates: Partial<ChatData>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.admin_notes !== undefined) dbUpdates.admin_notes = updates.admin_notes;
      if (updates.tags) dbUpdates.tags = updates.tags;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('conversations')
        .update(dbUpdates)
        .eq('id', conversationId);

      if (error) throw error;

      // Update local state
      setConversations(prev => prev.map(conversation => 
        conversation.id === conversationId ? { ...conversation, ...updates } : conversation
      ));
      
      toast.success('Conversación actualizada correctamente');
    } catch (err) {
      console.error('Error updating conversation:', err);
      toast.error('Error al actualizar la conversación');
      throw err;
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      await updateConversation(conversationId, { status: 'archived' });
      toast.success('Conversación archivada correctamente');
    } catch (err) {
      console.error('Error archiving conversation:', err);
      toast.error('Error al archivar la conversación');
      throw err;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete conversation (cascade will delete messages)
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Remove conversation from local state
      setConversations(prev => prev.filter(conversation => conversation.id !== conversationId));
      toast.success('Conversación eliminada correctamente');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('Error al eliminar la conversación');
      throw err;
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = conversations.length;
    const active = conversations.filter(c => c.status === 'active').length;
    const pending = conversations.filter(c => c.status === 'pending').length;
    const resolved = conversations.filter(c => c.status === 'resolved').length;
    const unread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

    return {
      total,
      active,
      pending,
      resolved,
      unread
    };
  }, [conversations]);

  useEffect(() => {
    loadConversations();
  }, []);

  return {
    conversations: paginatedConversations,
    allConversations: conversations,
    filteredConversations,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    conversationsPerPage,
    setCurrentPage,
    updateConversation,
    archiveConversation,
    deleteConversation,
    stats,
    refetch: loadConversations
  };
};
