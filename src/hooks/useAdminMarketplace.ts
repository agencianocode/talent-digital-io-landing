import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


interface MarketplaceFilters {
  searchQuery: string;
  companyFilter: string;
  categoryFilter: string;
  statusFilter: string;
  dateRange: string;
  priceRange: string;
}

interface MarketplaceData {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  delivery_time: string;
  location: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company_id?: string;
  company_name?: string;
  company_logo?: string;
  user_name: string;
  user_avatar?: string;
  views_count: number;
  orders_count: number;
  rating: number;
  reviews_count: number;
  priority: string;
  admin_notes?: string;
  tags: string[];
  portfolio_url?: string;
  demo_url?: string;
}

export const useAdminMarketplace = () => {
  const [services, setServices] = useState<MarketplaceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    searchQuery: '',
    companyFilter: 'all',
    categoryFilter: 'all',
    statusFilter: 'all',
    dateRange: 'all',
    priceRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(20);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch real marketplace services from Supabase
      const { data: servicesData, error: servicesError } = await supabase
        .from('marketplace_services')
        .select(`
          *,
          profiles!marketplace_services_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      // Transform data to match interface
      const transformedServices: MarketplaceData[] = (servicesData || []).map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        price: Number(service.price),
        currency: service.currency,
        delivery_time: service.delivery_time,
        location: service.location,
        is_active: service.is_available,
        status: service.status,
        created_at: service.created_at,
        updated_at: service.updated_at,
        user_id: service.user_id,
        company_id: undefined,
        company_name: undefined,
        company_logo: undefined,
        user_name: service.profiles?.full_name || 'Usuario',
        user_avatar: service.profiles?.avatar_url,
        views_count: service.views_count || 0,
        orders_count: service.requests_count || 0,
        rating: Number(service.rating) || 0,
        reviews_count: service.reviews_count || 0,
        priority: 'medium', // Default priority
        admin_notes: '',
        tags: service.tags || [],
        portfolio_url: service.portfolio_url,
        demo_url: service.demo_url
      }));

      setServices(transformedServices);
    } catch (err) {
      console.error('Error loading services:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar los servicios del marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    let filtered = [...services];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.user_name.toLowerCase().includes(query) ||
        (service.company_name && service.company_name.toLowerCase().includes(query))
      );
    }

    // Company filter
    if (filters.companyFilter !== 'all') {
      filtered = filtered.filter(service => service.company_id === filters.companyFilter);
    }

    // Category filter
    if (filters.categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === filters.categoryFilter);
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(service => service.status === filters.statusFilter);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const [minStr, maxStr] = filters.priceRange.split('-');
      const min = parseFloat(minStr || '0');
      const max = maxStr === '5000+' ? Infinity : parseFloat(maxStr || '0');
      filtered = filtered.filter(service => {
        if (max === Infinity) {
          return service.price >= min;
        }
        return service.price >= min && service.price <= max;
      });
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

      filtered = filtered.filter(service => 
        new Date(service.created_at) >= startDate
      );
    }

    return filtered;
  }, [services, filters]);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * servicesPerPage;
    const endIndex = startIndex + servicesPerPage;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, currentPage, servicesPerPage]);

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const updateFilters = (newFilters: Partial<MarketplaceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateService = async (serviceId: string, updates: Partial<MarketplaceData>) => {
    try {
      // Map interface fields to database fields
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.delivery_time !== undefined) dbUpdates.delivery_time = updates.delivery_time;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.is_active !== undefined) dbUpdates.is_available = updates.is_active;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.portfolio_url !== undefined) dbUpdates.portfolio_url = updates.portfolio_url;
      if (updates.demo_url !== undefined) dbUpdates.demo_url = updates.demo_url;

      const { error } = await supabase
        .from('marketplace_services')
        .update(dbUpdates)
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...updates, updated_at: new Date().toISOString() } : service
      ));

      toast.success('Servicio actualizado correctamente');
    } catch (err) {
      console.error('Error updating service:', err);
      toast.error('Error al actualizar el servicio');
      throw err;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      // Remove service from local state
      setServices(prev => prev.filter(service => service.id !== serviceId));
      toast.success('Servicio eliminado correctamente');
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error('Error al eliminar el servicio');
      throw err;
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return {
    services: paginatedServices,
    allServices: services,
    filteredServices,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    servicesPerPage,
    setCurrentPage,
    updateService,
    deleteService,
    refetch: loadServices
  };
};
