import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserFilters {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  countryFilter: string;
  dateRange: string;
  companyRoleFilter: string;
  completenessFilter: string;
  sortBy: 'name' | 'date' | 'last_activity';
  sortOrder: 'asc' | 'desc';
}

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  last_activity?: string;
  email_confirmed_at?: string;
  is_active: boolean;
  country?: string;
  companies_count: number;
  avatar_url?: string;
  company_roles?: string[];
  is_company_admin?: boolean;
  has_companies?: boolean;
  auth_provider?: string;
  is_google_auth?: boolean;
  has_completed_onboarding?: boolean;
  profile_completeness?: number;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    searchQuery: '',
    roleFilter: 'all',
    statusFilter: 'all',
    countryFilter: 'all',
    dateRange: 'all',
    companyRoleFilter: 'all',
    completenessFilter: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call edge function to get all users with real emails
      console.log('🔄 Llamando a get-all-users edge function...');
      const { data, error: usersError } = await supabase.functions.invoke('get-all-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (usersError) {
        console.error('❌ Error from get-all-users:', usersError);
        throw usersError;
      }

      if (!data) {
        console.error('❌ No data received from get-all-users');
        throw new Error('No se recibieron datos de la función');
      }

      if (!data.users || !Array.isArray(data.users)) {
        console.error('❌ Invalid data structure:', data);
        throw new Error('Estructura de datos inválida: users no es un array');
      }

      // Log para debugging
      console.log('📊 Usuarios recibidos de get-all-users:', {
        total: data.total,
        pages_fetched: data.pages_fetched,
        fetched_from_auth: data.fetched_from_auth, // Legacy, puede no existir
        users_count: data.users?.length || 0,
      });

      // Debug específico para ver avatar y nombre de algunos usuarios problemáticos (datos crudos)
      const rawDebugUsers = (data.users || []).filter((u: any) =>
        u.email === 'carmen.mora.fallas@gmail.com' ||
        u.email === 'isebas15cr@gmail.com' ||
        u.email === 'carlosdccfly@outlook.com'
      );
      console.log('🐞 Debug usuarios específicos (crudos desde edge function):', rawDebugUsers);

      const usersData: UserData[] = data.users.map((user: any) => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email, // Real email from auth
        role: user.role,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        last_activity: user.last_activity, // New field for activity tracking
        email_confirmed_at: user.email_confirmed_at,
        is_active: user.is_active,
        country: user.country,
        companies_count: user.companies_count,
        avatar_url: user.avatar_url,
        company_roles: user.company_roles || [],
        is_company_admin: user.is_company_admin || false,
        has_companies: user.has_companies || false,
        auth_provider: user.auth_provider,
        is_google_auth: user.is_google_auth || false,
        has_completed_onboarding: user.has_completed_onboarding,
        profile_completeness: user.profile_completeness || 0
      }));

      // Debug después del mapeo para ver qué llega finalmente al frontend
      const mappedDebugUsers = usersData.filter((u) =>
        u.email === 'carmen.mora.fallas@gmail.com' ||
        u.email === 'isebas15cr@gmail.com' ||
        u.email === 'carlosdccfly@outlook.com'
      );
      console.log('🐞 Debug usuarios específicos (después del mapeo a UserData):', mappedDebugUsers);

      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (filters.roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === filters.roleFilter);
      
      // Company role filter (only applies to business roles)
      const isBusinessRole = ['freemium_business', 'premium_business', 'academy_premium'].includes(filters.roleFilter);
      if (isBusinessRole && filters.companyRoleFilter !== 'all') {
        if (filters.companyRoleFilter === 'admin_owner') {
          filtered = filtered.filter(user => user.is_company_admin === true);
        } else if (filters.companyRoleFilter === 'viewer') {
          filtered = filtered.filter(user => 
            user.company_roles?.includes('viewer') && !user.is_company_admin
          );
        }
      }
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      if (filters.statusFilter === 'active') {
        filtered = filtered.filter(user => user.is_active);
      } else if (filters.statusFilter === 'suspended') {
        filtered = filtered.filter(user => !user.is_active);
      } else if (filters.statusFilter === 'pending') {
        filtered = filtered.filter(user => !user.email_confirmed_at);
      }
    }

    // Country filter
    if (filters.countryFilter !== 'all') {
      if (filters.countryFilter === 'other') {
        const knownCountries = ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'México', 'Perú', 'Uruguay', 'Estados Unidos', 'España'];
        // Include users without country in "other" category
        filtered = filtered.filter(user => !user.country || !knownCountries.some(kc => user.country?.includes(kc)));
      } else {
        // Map country codes to full country names - match partial to handle variations
        const countryMap: Record<string, string> = {
          'AR': 'Argentina',
          'BR': 'Brasil',
          'CL': 'Chile',
          'CO': 'Colombia',
          'CR': 'Costa Rica',
          'MX': 'México',
          'PE': 'Perú',
          'UY': 'Uruguay',
          'US': 'Estados Unidos',
          'ES': 'España'
        };
        const countryName = countryMap[filters.countryFilter] || filters.countryFilter;
        filtered = filtered.filter(user => user.country?.includes(countryName));
      }
    }
    // When "all" is selected, include ALL users regardless of country field

    // Profile completeness filter
    if (filters.completenessFilter !== 'all') {
      switch (filters.completenessFilter) {
        case 'complete':
          filtered = filtered.filter(user => user.profile_completeness === 100);
          break;
        case 'incomplete':
          filtered = filtered.filter(user => 
            user.profile_completeness !== undefined && 
            user.profile_completeness > 0 && 
            user.profile_completeness < 100
          );
          break;
        case 'unverified':
          filtered = filtered.filter(user => !user.email_confirmed_at);
          break;
        case 'zero':
          filtered = filtered.filter(user => 
            user.has_completed_onboarding === false || 
            user.profile_completeness === 0 ||
            user.profile_completeness === undefined
          );
          break;
      }
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

      filtered = filtered.filter(user => 
        new Date(user.created_at) >= startDate
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      if (filters.sortBy === 'name') {
        const nameA = a.full_name.toLowerCase();
        const nameB = b.full_name.toLowerCase();
        const comparison = nameA.localeCompare(nameB, 'es');
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      } else if (filters.sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (filters.sortBy === 'last_activity') {
        // Use last_activity field from profiles (populated via update_last_activity RPC)
        const dateA = (a as any).last_activity ? new Date((a as any).last_activity).getTime() : (a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0);
        const dateB = (b as any).last_activity ? new Date((b as any).last_activity).getTime() : (b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0);
        return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return filtered;
  }, [users, filters]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, usersPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const updateFilters = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateUser = async (userId: string, updates: Partial<UserData>) => {
    try {
      // Update user data in the local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Remove user from local state
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users: paginatedUsers,
    allUsers: users,
    filteredUsers,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    usersPerPage,
    setCurrentPage,
    updateUser,
    deleteUser,
    refetch: loadUsers
  };
};
