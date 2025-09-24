import { useState, useEffect, useMemo } from 'react';


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

      // Mock data for demonstration since talent_services table doesn't exist yet
      const mockServices: MarketplaceData[] = [
        {
          id: '1',
          title: 'Diseño de Logo Profesional',
          description: 'Creación de logos únicos y profesionales para tu marca. Incluye 3 conceptos iniciales y 2 revisiones.',
          category: 'diseno-grafico',
          price: 150,
          currency: 'USD',
          delivery_time: '3-5 días',
          location: 'Remoto',
          is_active: true,
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          user_id: 'user1',
          company_id: 'company1',
          company_name: 'Design Studio',
          company_logo: undefined,
          user_name: 'María García',
          user_avatar: undefined,
          views_count: 45,
          orders_count: 12,
          rating: 4.8,
          reviews_count: 8,
          priority: 'medium',
          admin_notes: '',
          tags: ['logo', 'branding', 'diseño'],
          portfolio_url: 'https://portfolio.com/maria',
          demo_url: 'https://demo.com/logo'
        },
        {
          id: '2',
          title: 'Desarrollo de Sitio Web',
          description: 'Desarrollo completo de sitios web responsivos con React y Node.js. Incluye diseño y funcionalidades personalizadas.',
          category: 'desarrollo-web',
          price: 2500,
          currency: 'USD',
          delivery_time: '2-3 semanas',
          location: 'Remoto',
          is_active: true,
          status: 'active',
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-10T14:30:00Z',
          user_id: 'user2',
          company_id: 'company2',
          company_name: 'Tech Solutions',
          company_logo: undefined,
          user_name: 'Carlos López',
          user_avatar: undefined,
          views_count: 78,
          orders_count: 5,
          rating: 4.9,
          reviews_count: 3,
          priority: 'high',
          admin_notes: '',
          tags: ['react', 'nodejs', 'web'],
          portfolio_url: 'https://portfolio.com/carlos',
          demo_url: 'https://demo.com/web'
        },
        {
          id: '3',
          title: 'Estrategia de Marketing Digital',
          description: 'Desarrollo de estrategias completas de marketing digital para redes sociales y campañas publicitarias.',
          category: 'marketing-digital',
          price: 800,
          currency: 'USD',
          delivery_time: '1-2 semanas',
          location: 'Remoto',
          is_active: false,
          status: 'paused',
          created_at: '2024-01-05T09:15:00Z',
          updated_at: '2024-01-05T09:15:00Z',
          user_id: 'user3',
          company_id: undefined,
          company_name: undefined,
          company_logo: undefined,
          user_name: 'Ana Rodríguez',
          user_avatar: undefined,
          views_count: 32,
          orders_count: 7,
          rating: 4.6,
          reviews_count: 5,
          priority: 'low',
          admin_notes: 'Servicio pausado temporalmente',
          tags: ['marketing', 'social media', 'estrategia'],
          portfolio_url: 'https://portfolio.com/ana',
          demo_url: undefined
        }
      ];

      setServices(mockServices);
    } catch (err) {
      console.error('Error loading services:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
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
      // Update service data in the local state
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...updates } : service
      ));
    } catch (err) {
      console.error('Error updating service:', err);
      throw err;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      // Remove service from local state
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      console.error('Error deleting service:', err);
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
