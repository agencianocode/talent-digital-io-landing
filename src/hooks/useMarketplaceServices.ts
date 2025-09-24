import { useState, useEffect, useCallback } from 'react';
import { marketplaceService } from '@/services/marketplaceService';
// import { SERVICE_CATEGORIES } from '@/lib/marketplace-categories';
import { 
  TalentServiceWithUser, 
  ServiceFilters, 
  MarketplaceStats,
  ServiceRequestFormData,
  ServicePublishingFormData
} from '@/integrations/supabase/marketplace-types';

// Re-export types for backward compatibility
export type MarketplaceService = TalentServiceWithUser;
export type { ServiceFilters, ServiceRequestFormData, ServicePublishingFormData, MarketplaceStats } from '@/integrations/supabase/marketplace-types';

export interface UseMarketplaceServicesReturn {
  // Data
  services: TalentServiceWithUser[];
  allServices: TalentServiceWithUser[];
  stats: MarketplaceStats;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: ServiceFilters;
  updateFilters: (newFilters: Partial<ServiceFilters>) => void;
  clearFilters: () => void;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Actions
  refreshServices: () => Promise<void>;
  requestService: (serviceId: string, requestData: ServiceRequestFormData) => Promise<void>;
  publishServiceRequest: (requestData: ServicePublishingFormData) => Promise<void>;
  incrementViews: (serviceId: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 12;

export const useMarketplaceServices = (): UseMarketplaceServicesReturn => {
  const [services, setServices] = useState<TalentServiceWithUser[]>([]);
  const [allServices, setAllServices] = useState<TalentServiceWithUser[]>([]);
  const [stats, setStats] = useState<MarketplaceStats>({
    totalServices: 0,
    activeProviders: 0,
    averageRating: 4.7,
    totalRequests: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [filters, setFilters] = useState<ServiceFilters>({
    searchQuery: '',
    categoryFilter: 'all',
    priceRange: 'all',
    locationFilter: 'all',
    availabilityFilter: 'all'
  });

  // Load services from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('marketplace-filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('marketplace-filters', JSON.stringify(filters));
  }, [filters]);

  // Load services
  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await marketplaceService.getActiveServices(filters, currentPage, ITEMS_PER_PAGE);
      
      setServices(response.data);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      setHasMore(response.hasMore);

      // Load all services for stats (first page only)
      if (currentPage === 1) {
        const allResponse = await marketplaceService.getActiveServices(filters, 1, 1000);
        setAllServices(allResponse.data);
      }

      // Load marketplace stats
      const marketplaceStats = await marketplaceService.getMarketplaceStats();
      setStats(marketplaceStats);

    } catch (err) {
      console.error('Error loading services:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los servicios');
      
      // Fallback to mock data
      setServices([]);
      setAllServices([]);
      setStats({
        totalServices: 0,
        activeProviders: 0,
        averageRating: 4.7,
        totalRequests: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // Load services when filters or page changes
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ServiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      categoryFilter: 'all',
      priceRange: 'all',
      locationFilter: 'all',
      availabilityFilter: 'all'
    });
    setCurrentPage(1);
  }, []);

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Refresh services
  const refreshServices = useCallback(async () => {
    await loadServices();
  }, [loadServices]);

  // Request a service
  const requestService = useCallback(async (serviceId: string, requestData: ServiceRequestFormData) => {
    try {
      await marketplaceService.createServiceRequest(serviceId, requestData);
      // Refresh services to update request counts
      await refreshServices();
    } catch (err) {
      console.error('Error requesting service:', err);
      throw err;
    }
  }, [refreshServices]);

  // Publish service request
  const publishServiceRequest = useCallback(async (requestData: ServicePublishingFormData) => {
    try {
      await marketplaceService.createPublishingRequest(requestData);
    } catch (err) {
      console.error('Error creating publishing request:', err);
      throw err;
    }
  }, []);

  // Increment service views
  const incrementViews = useCallback(async (serviceId: string) => {
    try {
      await marketplaceService.incrementServiceViews(serviceId);
    } catch (err) {
      console.error('Error incrementing views:', err);
      // Don't throw error for view tracking
    }
  }, []);

  return {
    // Data
    services,
    allServices,
    stats,
    
    // Loading states
    isLoading,
    error,
    
    // Filters
    filters,
    updateFilters,
    clearFilters,
    
    // Pagination
    currentPage,
    totalPages,
    hasMore,
    goToPage,
    nextPage,
    prevPage,
    
    // Actions
    refreshServices,
    requestService,
    publishServiceRequest,
    incrementViews
  };
};