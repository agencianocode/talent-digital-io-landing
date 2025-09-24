import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserFilters {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  countryFilter: string;
  dateRange: string;
}

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  is_active: boolean;
  country?: string;
  companies_count: number;
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
    dateRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load users with their profiles and roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          created_at,
          country
        `);

      if (profilesError) throw profilesError;

      // Load user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Load company counts for each user
      const { data: companyCounts, error: companyError } = await supabase
        .from('company_user_roles')
        .select('user_id')
        .eq('status', 'accepted');

      if (companyError) throw companyError;

      // Get auth users data
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      // Combine all data
      const usersData: UserData[] = profiles?.map(profile => {
        const role = roles?.find(r => r.user_id === profile.user_id)?.role || 'freemium_talent';
        const authUser = authUsers.users.find(u => u.id === profile.user_id);
        const companiesCount = companyCounts?.filter(c => c.user_id === profile.user_id).length || 0;

        return {
          id: profile.user_id,
          full_name: profile.full_name || 'Sin nombre',
          email: authUser?.email || '',
          role,
          created_at: profile.created_at,
          last_sign_in_at: authUser?.last_sign_in_at,
          email_confirmed_at: authUser?.email_confirmed_at,
          is_active: !(authUser as any)?.banned_until,
          country: profile.country || undefined,
          companies_count: companiesCount
        };
      }) || [];

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
      filtered = filtered.filter(user => user.country === filters.countryFilter);
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
