import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyFilters {
  searchQuery: string;
  industryFilter: string;
  sizeFilter: string;
  locationFilter: string;
  dateRange: string;
  statusFilter: string;
  sortBy: 'name' | 'date';
  sortOrder: 'asc' | 'desc';
}

interface CompanyData {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner_name?: string;
  users_count: number;
  opportunities_count: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  is_active: boolean;
}

export const useAdminCompanies = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CompanyFilters>({
    searchQuery: '',
    industryFilter: 'all',
    sizeFilter: 'all',
    locationFilter: 'all',
    dateRange: 'all',
    statusFilter: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(20);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load companies with their owners
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          description,
          website,
          industry,
          size,
          location,
          logo_url,
          created_at,
          updated_at,
          user_id,
          status
        `);

      if (companiesError) {
        console.error('Error loading companies:', companiesError);
        // If companies table doesn't exist, use empty array
        setCompanies([]);
        setIsLoading(false);
        return;
      }

      // Load company owners from profiles
      const companyOwners = new Map();
      if (companiesData && companiesData.length > 0) {
        const userIds = companiesData.map(c => c.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

          if (!profilesError && profilesData) {
            profilesData.forEach(profile => {
              companyOwners.set(profile.user_id, profile.full_name);
            });
          }
        }
      }

      // Load users count for each company
      const { data: usersData, error: usersError } = await supabase
        .from('company_user_roles')
        .select('company_id')
        .eq('status', 'accepted');

      if (usersError) {
        console.error('Error loading company users:', usersError);
      }

      // Load opportunities count for each company (only those with title - excludes empty drafts)
      const { data: opportunitiesData, error: oppError } = await supabase
        .from('opportunities')
        .select('company_id, title, status')
        .not('title', 'is', null);

      if (oppError) {
        console.error('Error loading opportunities:', oppError);
      }

      // Combine all data
      const companiesWithStats: CompanyData[] = companiesData?.map(company => {
        const usersCount = usersData?.filter(u => u.company_id === company.id).length || 0;
        // Only count opportunities with a real title (not empty drafts)
        const opportunitiesCount = opportunitiesData?.filter(o => 
          o.company_id === company.id && 
          o.title && 
          o.title.trim() !== ''
        ).length || 0;
        const ownerName = companyOwners.get(company.user_id) || 'Sin nombre';

        return {
          id: company.id,
          name: company.name,
          description: company.description || undefined,
          website: company.website || undefined,
          industry: company.industry || undefined,
          size: company.size || undefined,
          location: company.location || undefined,
          logo_url: company.logo_url || undefined,
          created_at: company.created_at,
          updated_at: company.updated_at,
          user_id: company.user_id,
          owner_name: ownerName,
          users_count: usersCount,
          opportunities_count: opportunitiesCount,
          status: (company.status as 'active' | 'inactive' | 'suspended' | 'pending') || 'active',
          is_active: company.status === 'active'
        };
      }) || [];

      setCompanies(companiesWithStats);
    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    let filtered = [...companies];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(query) ||
        (company.description && company.description.toLowerCase().includes(query)) ||
        (company.industry && company.industry.toLowerCase().includes(query))
      );
    }

    // Industry filter (robust matching with Spanish/English synonyms)
    if (filters.industryFilter !== 'all') {
      const industryMap: Record<string, string[]> = {
        technology: ['tecnología', 'technology', 'tech'],
        marketing: ['marketing'],
        sales: ['ventas', 'sales'],
        consulting: ['consultoría', 'consulting'],
        education: ['educación', 'education'],
        healthcare: ['salud', 'healthcare'],
        finance: ['finanzas', 'finance'],
      };

      if (filters.industryFilter === 'other') {
        const allKnown = Object.values(industryMap).flat();
        filtered = filtered.filter(company => {
          const ind = (company.industry || '').toLowerCase();
          return ind && !allKnown.some(k => ind.includes(k));
        });
      } else {
        const synonyms = industryMap[filters.industryFilter] || [filters.industryFilter];
        filtered = filtered.filter(company => {
          const ind = (company.industry || '').toLowerCase();
          return synonyms.some(s => ind.includes(s));
        });
      }
    }

    // Size filter (normalize common ranges and labels)
    if (filters.sizeFilter !== 'all') {
      const matchesSize = (companySize?: string, target?: string) => {
        const s = (companySize || '').toLowerCase();
        if (!s || !target) return false;

        // Try to extract numeric ranges like "2-10", "11 — 50", "1 a 10", etc.
        const nums = s.match(/\d{1,4}/g)?.map((n) => parseInt(n, 10)) || null;
        const min = nums && nums.length >= 1 ? nums[0] : undefined;
        const max = nums && nums.length >= 2 ? nums[1] : min;
        const inRange = (lo?: number, hi?: number) => {
          if (min === undefined && max === undefined) return false;
          const a = min ?? 0;
          const b = max ?? min ?? 0;
          return a >= (lo ?? a) && b <= (hi ?? b);
        };

        switch (target) {
          case 'startup':
            // Accept explicit labels and any range whose max <= 10 (covers 1-10, 2-10, etc.)
            return (
              s.includes('startup') ||
              s.includes('1-10') || s.includes('1 — 10') || s.includes('1 a 10') ||
              s.includes('2-10') || s.includes('2 — 10') || s.includes('2 a 10') ||
              (max !== undefined && max <= 10)
            );
          case 'small':
            // Accept common labels and numeric ranges up to 50 (min >= 10 allows 10-50 variants)
            return (
              s.includes('small') || s.includes('peque') ||
              s.includes('11-50') || s.includes('11 — 50') || s.includes('11 a 50') ||
              (min !== undefined && max !== undefined && min >= 10 && max <= 50)
            );
          case 'medium':
            return (
              s.includes('medium') || s.includes('mediana') ||
              s.includes('51-200') || s.includes('51 — 200') || s.includes('51 a 200') ||
              inRange(51, 200)
            );
          case 'large':
            return (
              s.includes('large') || s.includes('grande') ||
              s.includes('201-1000') || s.includes('201 — 1000') || s.includes('201 a 1000') ||
              inRange(201, 1000)
            );
          case 'enterprise':
            return (
              s.includes('enterprise') || s.includes('1000') || s.includes('1000+') || s.includes('1000 +') || s.includes('más de 1000') ||
              (min !== undefined && (min >= 1000 || (max !== undefined && max >= 1000)))
            );
          default:
            return s.includes(target);
        }
      };

      filtered = filtered.filter(company => matchesSize(company.size, filters.sizeFilter));
    }

    // Location filter
    if (filters.locationFilter !== 'all') {
      if (filters.locationFilter === 'remote') {
        filtered = filtered.filter(company => 
          company.location && company.location.toLowerCase().includes('remoto')
        );
      } else if (filters.locationFilter === 'other') {
        const knownLocations = ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'México', 'Perú', 'Uruguay', 'Estados Unidos', 'España'];
        filtered = filtered.filter(company => 
          company.location && !knownLocations.some(loc => company.location?.includes(loc))
        );
      } else {
        // Map country codes to full names
        const locationMap: Record<string, string> = {
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
        const locationName = locationMap[filters.locationFilter] || filters.locationFilter;
        filtered = filtered.filter(company => company.location?.includes(locationName));
      }
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === filters.statusFilter);
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

      filtered = filtered.filter(company => 
        new Date(company.created_at) >= startDate
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      if (filters.sortBy === 'name') {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const comparison = nameA.localeCompare(nameB, 'es');
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      } else if (filters.sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return filtered;
  }, [companies, filters]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * companiesPerPage;
    const endIndex = startIndex + companiesPerPage;
    return filteredCompanies.slice(startIndex, endIndex);
  }, [filteredCompanies, currentPage, companiesPerPage]);

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  const updateFilters = (newFilters: Partial<CompanyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateCompany = async (companyId: string, updates: Partial<CompanyData>) => {
    try {
      // Update company data in the local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId ? { ...company, ...updates } : company
      ));
    } catch (err) {
      console.error('Error updating company:', err);
      throw err;
    }
  };

  const deleteCompany = async (companyId: string) => {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      // Call Edge Function with service_role to delete company
      const response = await fetch(
        `https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/admin-delete-company`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ companyId }),
        }
      );

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete company');
      }

      // Remove company from local state
      setCompanies(prev => prev.filter(company => company.id !== companyId));
    } catch (err) {
      console.error('Error deleting company:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return {
    companies: paginatedCompanies,
    allCompanies: companies,
    filteredCompanies,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    companiesPerPage,
    setCurrentPage,
    updateCompany,
    deleteCompany,
    refetch: loadCompanies
  };
};
