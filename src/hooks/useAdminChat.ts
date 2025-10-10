import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatFilters {
  searchQuery: string;
  userTypeFilter: string;
  statusFilter: string;
  dateRange: string;
  priorityFilter: string;
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
    statusFilter: 'all',
    dateRange: 'all',
    priorityFilter: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationsPerPage] = useState(20);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all users with their profiles and emails
      const { data, error: usersError } = await supabase.functions.invoke('get-all-users', { body: {} });
      
      if (usersError) throw usersError;

      interface UserData {
        user_id: string;
        full_name: string;
        email: string;
        role: string;
      }

      const rawUsers: any[] = (data as any)?.users || [];
      const users: UserData[] = rawUsers.map((u) => ({
        user_id: u.user_id || u.id,
        full_name: u.full_name || 'Usuario',
        email: u.email || '',
        role: u.role || 'talent',
      }));
      const usersMap = new Map<string, UserData>(users.map((u) => [u.user_id, u]));

      // Fetch profiles for avatars
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, avatar_url');
      
      const avatarsMap = new Map<string, string>();
      (profilesData || []).forEach((p: any) => {
        if (p.avatar_url) {
          const isFullUrl = typeof p.avatar_url === 'string' && /^(http|https):\/\//.test(p.avatar_url);
          const publicUrl = isFullUrl
            ? p.avatar_url
            : supabase.storage.from('avatars').getPublicUrl(p.avatar_url).data.publicUrl;
          avatarsMap.set(p.user_id, publicUrl);
        }
      });

      // Fetch all messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by conversation_id
      const conversationsMap = new Map<string, ChatData>();
      
      messagesData?.forEach(message => {
        const convId = message.conversation_id;
        if (!conversationsMap.has(convId)) {
          // Determine the other participant (not the current admin)
          const otherUserId = message.sender_id;
          const otherUser = usersMap.get(otherUserId);
          
          conversationsMap.set(convId, {
            id: convId,
            user_id: otherUserId,
            user_name: otherUser?.full_name || 'Usuario',
            user_email: otherUser?.email || '',
            user_type: otherUser?.role === 'business' ? 'business' : otherUser?.role === 'admin' ? 'admin' : 'talent',
            user_avatar: avatarsMap.get(otherUserId),
            company_name: undefined,
            company_logo: undefined,
            subject: message.label === 'welcome' ? 'Mensaje de Bienvenida' : 'Conversación',
            status: 'active',
            priority: message.label === 'welcome' ? 'low' : 'medium',
            created_at: message.created_at,
            updated_at: message.created_at,
            last_message_at: message.created_at,
            messages_count: 1,
            unread_count: message.is_read ? 0 : 1,
            tags: message.label ? [message.label] : [],
            admin_notes: '',
            last_message_preview: message.content?.substring(0, 100)
          });
        } else {
          const conv = conversationsMap.get(convId)!;
          conv.messages_count++;
          if (!message.is_read) conv.unread_count++;
          if (new Date(message.created_at) > new Date(conv.last_message_at)) {
            conv.last_message_at = message.created_at;
            conv.updated_at = message.created_at;
            conv.last_message_preview = message.content?.substring(0, 100);
          }
        }
      });

      setConversations(Array.from(conversationsMap.values()));
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
      // Update conversation metadata in local state
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

  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete all messages in this conversation
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

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
    deleteConversation,
    stats,
    refetch: loadConversations
  };
};
