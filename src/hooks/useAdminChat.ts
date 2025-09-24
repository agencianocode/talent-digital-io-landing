import { useState, useEffect, useMemo } from 'react';

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

      // Mock data for demonstration
      const mockConversations: ChatData[] = [
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
          last_message_preview: 'Perfecto, muchas gracias. ¿Hay algún plazo específico para aplicar?'
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
          last_message_preview: 'El error dice "Error de validación en el campo descripción" pero no veo qué está mal.'
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Ana Rodríguez',
          user_email: 'ana@marketing.com',
          user_type: 'business',
          user_avatar: undefined,
          company_name: 'Marketing Solutions',
          company_logo: undefined,
          subject: 'Solicitud de información sobre servicios premium',
          status: 'resolved',
          priority: 'low',
          created_at: '2024-01-13T09:00:00Z',
          updated_at: '2024-01-13T11:30:00Z',
          last_message_at: '2024-01-13T11:30:00Z',
          messages_count: 4,
          unread_count: 0,
          tags: ['servicios', 'premium', 'información'],
          admin_notes: 'Cliente interesado en servicios premium, conversación resuelta',
          last_message_preview: 'Perfecto, gracias por la información. Procederé con la contratación.'
        },
        {
          id: '4',
          user_id: 'user4',
          user_name: 'Pedro Martínez',
          user_email: 'pedro@freelancer.com',
          user_type: 'talent',
          user_avatar: undefined,
          company_name: undefined,
          company_logo: undefined,
          subject: 'Problema con acceso a mi perfil',
          status: 'active',
          priority: 'high',
          created_at: '2024-01-12T14:00:00Z',
          updated_at: '2024-01-12T15:20:00Z',
          last_message_at: '2024-01-12T15:20:00Z',
          messages_count: 6,
          unread_count: 3,
          tags: ['problema', 'acceso', 'perfil'],
          admin_notes: 'Usuario no puede acceder a su perfil, problema de autenticación',
          last_message_preview: 'Sigo sin poder acceder. ¿Podrían revisar mi cuenta?'
        },
        {
          id: '5',
          user_id: 'user5',
          user_name: 'Laura Fernández',
          user_email: 'laura@design.com',
          user_type: 'talent',
          user_avatar: undefined,
          company_name: undefined,
          company_logo: undefined,
          subject: 'Consulta sobre marketplace de servicios',
          status: 'pending',
          priority: 'medium',
          created_at: '2024-01-11T11:00:00Z',
          updated_at: '2024-01-11T12:15:00Z',
          last_message_at: '2024-01-11T12:15:00Z',
          messages_count: 3,
          unread_count: 1,
          tags: ['marketplace', 'servicios', 'consulta'],
          admin_notes: 'Usuario quiere publicar servicios en el marketplace',
          last_message_preview: '¿Cuáles son los requisitos para publicar servicios?'
        }
      ];

      setConversations(mockConversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
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
        conversation.user_name.toLowerCase().includes(query) ||
        conversation.user_email.toLowerCase().includes(query) ||
        conversation.subject.toLowerCase().includes(query) ||
        (conversation.company_name && conversation.company_name.toLowerCase().includes(query))
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
      // Update conversation data in the local state
      setConversations(prev => prev.map(conversation => 
        conversation.id === conversationId ? { ...conversation, ...updates } : conversation
      ));
    } catch (err) {
      console.error('Error updating conversation:', err);
      throw err;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Remove conversation from local state
      setConversations(prev => prev.filter(conversation => conversation.id !== conversationId));
    } catch (err) {
      console.error('Error deleting conversation:', err);
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
