import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityFilters {
  searchQuery: string;
  companyFilter: string;
  categoryFilter: string;
  statusFilter: string;
  dateRange: string;
  priorityFilter: string;
}

interface OpportunityData {
  id: string;
  title: string;
  description: string;
  category: string;
  contract_type: string;
  duration?: string;
  location: string;
  timezone?: string;
  deadline?: string;
  salary_type: string;
  salary_amount?: string;
  salary_period?: string;
  commission_percentage?: string;
  show_salary_publicly: boolean;
  skills: string[];
  experience_levels: string[];
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  company_name: string;
  company_logo?: string;
  applications_count: number;
  views_count: number;
  priority: string;
  admin_notes?: string;
}

export const useAdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OpportunityFilters>({
    searchQuery: '',
    companyFilter: 'all',
    categoryFilter: 'all',
    statusFilter: 'all',
    dateRange: 'all',
    priorityFilter: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [opportunitiesPerPage] = useState(20);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load opportunities with their companies
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (opportunitiesError) throw opportunitiesError;

      // Load applications count for each opportunity
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('opportunity_id');

      if (applicationsError) throw applicationsError;

      // Combine all data
      const opportunitiesWithStats: OpportunityData[] = opportunitiesData?.map(opportunity => {
        const applicationsCount = applicationsData?.filter(a => a.opportunity_id === opportunity.id).length || 0;

        return {
          id: opportunity.id,
          title: opportunity.title,
          description: opportunity.description,
          category: opportunity.category,
          contract_type: opportunity.contract_type || 'full-time',
          duration: (opportunity as any).duration,
          location: opportunity.location || '',
          timezone: (opportunity as any).timezone,
          deadline: (opportunity as any).deadline,
          salary_type: (opportunity as any).salary_type || 'fixed',
          salary_amount: (opportunity as any).salary_amount || opportunity.salary_min?.toString(),
          salary_period: (opportunity as any).salary_period,
          commission_percentage: opportunity.commission_percentage?.toString(),
          show_salary_publicly: (opportunity as any).show_salary_publicly || false,
          skills: opportunity.skills || [],
          experience_levels: opportunity.experience_levels || [],
          is_active: opportunity.is_active || false,
          status: opportunity.status,
          created_at: opportunity.created_at,
          updated_at: opportunity.updated_at,
          company_id: opportunity.company_id,
          company_name: (opportunity.companies as any)?.name || 'Empresa desconocida',
          company_logo: (opportunity.companies as any)?.logo_url,
          applications_count: applicationsCount,
          views_count: 0, // TODO: Implement views tracking
          priority: (opportunity as any).priority || 'medium',
          admin_notes: (opportunity as any).admin_notes
        };
      }) || [];

      setOpportunities(opportunitiesWithStats);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(opportunity => 
        opportunity.title.toLowerCase().includes(query) ||
        opportunity.description.toLowerCase().includes(query) ||
        opportunity.company_name.toLowerCase().includes(query)
      );
    }

    // Company filter
    if (filters.companyFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.company_id === filters.companyFilter);
    }

    // Category filter
    if (filters.categoryFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.category === filters.categoryFilter);
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.status === filters.statusFilter);
    }

    // Priority filter
    if (filters.priorityFilter !== 'all') {
      filtered = filtered.filter(opportunity => opportunity.priority === filters.priorityFilter);
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

      filtered = filtered.filter(opportunity => 
        new Date(opportunity.created_at) >= startDate
      );
    }

    return filtered;
  }, [opportunities, filters]);

  const paginatedOpportunities = useMemo(() => {
    const startIndex = (currentPage - 1) * opportunitiesPerPage;
    const endIndex = startIndex + opportunitiesPerPage;
    return filteredOpportunities.slice(startIndex, endIndex);
  }, [filteredOpportunities, currentPage, opportunitiesPerPage]);

  const totalPages = Math.ceil(filteredOpportunities.length / opportunitiesPerPage);

  const updateFilters = (newFilters: Partial<OpportunityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateOpportunity = async (opportunityId: string, updates: Partial<OpportunityData>) => {
    try {
      // Update opportunity data in the local state
      setOpportunities(prev => prev.map(opportunity => 
        opportunity.id === opportunityId ? { ...opportunity, ...updates } : opportunity
      ));
    } catch (err) {
      console.error('Error updating opportunity:', err);
      throw err;
    }
  };

  const deleteOpportunity = async (opportunityId: string) => {
    try {
      // Remove opportunity from local state
      setOpportunities(prev => prev.filter(opportunity => opportunity.id !== opportunityId));
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  return {
    opportunities: paginatedOpportunities,
    allOpportunities: opportunities,
    filteredOpportunities,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    opportunitiesPerPage,
    setCurrentPage,
    updateOpportunity,
    deleteOpportunity,
    refetch: loadOpportunities
  };
};
