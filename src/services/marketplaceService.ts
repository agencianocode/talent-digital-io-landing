// import { supabase } from '@/integrations/supabase/client';
import {
  TalentService,
  ServiceRequest,
  ServicePublishingRequest,
  TalentServiceWithUser,
  ServiceFormData,
  ServiceRequestFormData,
  ServicePublishingFormData,
  ServiceFilters,
  PaginatedResponse,
  ServiceStats
} from '@/integrations/supabase/marketplace-types';

class MarketplaceService {
  // ==================== TALENT SERVICES ====================

  /**
   * Get all active services for the marketplace
   */
  async getActiveServices(filters?: ServiceFilters, page = 1, limit = 12): Promise<PaginatedResponse<TalentServiceWithUser>> {
    try {
      // For now, use mock data until tables are created
      const mockServices: TalentServiceWithUser[] = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Diseño de Logo Profesional',
          description: 'Creación de logos únicos y profesionales para tu marca. Incluye 3 conceptos iniciales y 2 revisiones.',
          category: 'diseno-grafico',
          price: 150.00,
          currency: 'USD',
          delivery_time: '3-5 días',
          location: 'Remoto',
          is_available: true,
          status: 'active',
          portfolio_url: 'https://portfolio.com/example',
          demo_url: 'https://demo.com/logo',
          tags: ['logo', 'branding', 'diseño'],
          views_count: 45,
          requests_count: 12,
          rating: 4.8,
          reviews_count: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_name: 'MG María García',
          user_avatar: undefined
        },
        {
          id: '2',
          user_id: 'user2',
          title: 'Desarrollo de Sitio Web',
          description: 'Desarrollo completo de sitios web responsivos con React y Node.js. Incluye diseño y funcionalidades personalizadas.',
          category: 'desarrollo-web',
          price: 2500.00,
          currency: 'USD',
          delivery_time: '2-3 semanas',
          location: 'Remoto',
          is_available: true,
          status: 'active',
          portfolio_url: 'https://portfolio.com/example',
          demo_url: 'https://demo.com/web',
          tags: ['react', 'nodejs', 'web'],
          views_count: 78,
          requests_count: 5,
          rating: 4.9,
          reviews_count: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_name: 'CL Carlos López',
          user_avatar: undefined
        },
        {
          id: '3',
          user_id: 'user3',
          title: 'Estrategia de Marketing Digital',
          description: 'Desarrollo de estrategias completas de marketing digital para redes sociales y campañas publicitarias.',
          category: 'marketing-digital',
          price: 800.00,
          currency: 'USD',
          delivery_time: '1-2 semanas',
          location: 'Remoto',
          is_available: true,
          status: 'active',
          portfolio_url: 'https://portfolio.com/example',
          demo_url: undefined,
          tags: ['marketing', 'social media', 'estrategia'],
          views_count: 32,
          requests_count: 7,
          rating: 4.6,
          reviews_count: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_name: 'AR Ana Rodríguez',
          user_avatar: undefined
        }
      ];

      // Apply filters
      let filteredServices = mockServices;
      
      if (filters) {
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredServices = filteredServices.filter(service => 
            service.title.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query) ||
            service.user_name.toLowerCase().includes(query)
          );
        }
        
        if (filters.categoryFilter && filters.categoryFilter !== 'all') {
          filteredServices = filteredServices.filter(service => 
            service.category === filters.categoryFilter
          );
        }
        
        if (filters.priceRange && filters.priceRange !== 'all') {
          const [minStr, maxStr] = filters.priceRange.split('-');
          const min = parseFloat(minStr || '0');
          const max = maxStr === '5000+' ? Infinity : parseFloat(maxStr || '0');
          
          filteredServices = filteredServices.filter(service => {
            if (max === Infinity) {
              return service.price >= min;
            } else {
              return service.price >= min && service.price <= max;
            }
          });
        }
        
        if (filters.locationFilter && filters.locationFilter !== 'all') {
          filteredServices = filteredServices.filter(service => 
            service.location === filters.locationFilter
          );
        }
      }

      // Apply pagination
      const total = filteredServices.length;
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedServices = filteredServices.slice(from, to);

      return {
        data: paginatedServices,
        total,
        page,
        limit,
        hasMore: to < total
      };
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  }

  /**
   * Get services for a specific user (talent)
   */
  async getUserServices(_userId: string): Promise<TalentService[]> {
    try {
      // For now, return empty array until tables are created
      return [];
    } catch (error) {
      console.error('Error fetching user services:', error);
      throw error;
    }
  }

  /**
   * Create a new service
   */
  async createService(userId: string, serviceData: ServiceFormData): Promise<TalentService> {
    try {
      // For now, simulate creation
      const newService: TalentService = {
        id: Date.now().toString(),
        user_id: userId,
        ...serviceData,
        status: 'draft',
        views_count: 0,
        requests_count: 0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Update an existing service
   */
  async updateService(serviceId: string, userId: string, serviceData: Partial<ServiceFormData>): Promise<TalentService> {
    try {
      // For now, simulate update
      const updatedService: TalentService = {
        id: serviceId,
        user_id: userId,
        title: serviceData.title || 'Updated Service',
        description: serviceData.description || 'Updated description',
        category: serviceData.category || 'diseno-grafico',
        price: serviceData.price || 100,
        currency: serviceData.currency || 'USD',
        delivery_time: serviceData.delivery_time || '1 semana',
        location: serviceData.location || 'Remoto',
        is_available: serviceData.is_available ?? true,
        status: 'active',
        portfolio_url: serviceData.portfolio_url,
        demo_url: serviceData.demo_url,
        tags: serviceData.tags || [],
        views_count: 0,
        requests_count: 0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: string, _userId: string): Promise<void> {
    try {
      // For now, simulate deletion
      console.log(`Deleting service ${serviceId} for user ${_userId}`);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  /**
   * Increment service views
   */
  async incrementServiceViews(serviceId: string): Promise<void> {
    try {
      // For now, simulate view increment
      console.log(`Incrementing views for service ${serviceId}`);
    } catch (error) {
      console.error('Error incrementing service views:', error);
      // Don't throw error for view tracking
    }
  }

  // ==================== SERVICE REQUESTS ====================

  /**
   * Get service requests for a user's services
   */
  async getServiceRequests(_userId: string): Promise<ServiceRequest[]> {
    try {
      // For now, return empty array until tables are created
      return [];
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  }

  /**
   * Create a service request
   */
  async createServiceRequest(serviceId: string, requestData: ServiceRequestFormData): Promise<ServiceRequest> {
    try {
      // For now, simulate request creation
      const newRequest: ServiceRequest = {
        id: Date.now().toString(),
        service_id: serviceId,
        requester_name: requestData.requester_name,
        requester_email: requestData.requester_email,
        requester_phone: requestData.requester_phone,
        company_name: requestData.company_name,
        message: requestData.message,
        budget_range: requestData.budget_range,
        timeline: requestData.timeline,
        project_type: requestData.project_type,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newRequest;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  /**
   * Update service request status
   */
  async updateRequestStatus(requestId: string, status: 'pending' | 'accepted' | 'declined' | 'completed'): Promise<ServiceRequest> {
    try {
      // For now, simulate status update
      const updatedRequest: ServiceRequest = {
        id: requestId,
        service_id: 'service1',
        requester_name: 'Test User',
        requester_email: 'test@example.com',
        message: 'Test message',
        budget_range: '1000-2500',
        timeline: 'normal',
        project_type: 'one-time',
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return updatedRequest;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  // ==================== SERVICE PUBLISHING REQUESTS ====================

  /**
   * Create a service publishing request
   */
  async createPublishingRequest(requestData: ServicePublishingFormData): Promise<ServicePublishingRequest> {
    try {
      // For now, simulate publishing request creation
      const newRequest: ServicePublishingRequest = {
        id: Date.now().toString(),
        contact_name: requestData.contact_name,
        contact_email: requestData.contact_email,
        contact_phone: requestData.contact_phone,
        company_name: requestData.company_name,
        service_type: requestData.service_type,
        budget: requestData.budget,
        timeline: requestData.timeline,
        description: requestData.description,
        requirements: requestData.requirements,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newRequest;
    } catch (error) {
      console.error('Error creating publishing request:', error);
      throw error;
    }
  }

  /**
   * Get all publishing requests (admin only)
   */
  async getPublishingRequests(): Promise<ServicePublishingRequest[]> {
    try {
      // For now, return empty array until tables are created
      return [];
    } catch (error) {
      console.error('Error fetching publishing requests:', error);
      throw error;
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get service statistics
   */
  async getServiceStats(_serviceId: string): Promise<ServiceStats> {
    try {
      // For now, return mock stats
      return {
        total_views: 45,
        total_requests: 12,
        average_rating: 4.8,
        total_reviews: 8
      };
    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw error;
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<{
    totalServices: number;
    activeProviders: number;
    averageRating: number;
    totalRequests: number;
  }> {
    try {
      // For now, return mock stats
      return {
        totalServices: 3,
        activeProviders: 3,
        averageRating: 4.7,
        totalRequests: 24
      };
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const marketplaceService = new MarketplaceService();
export default marketplaceService;