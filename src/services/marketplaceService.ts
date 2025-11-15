import { supabase } from '@/integrations/supabase/client';
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
      // Build query - first get services
      let query = supabase
        .from('marketplace_services')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .eq('is_available', true);

      // Apply filters
      if (filters) {
        if (filters.searchQuery) {
          query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
        }
        
        if (filters.categoryFilter && filters.categoryFilter !== 'all') {
          query = query.eq('category', filters.categoryFilter);
        }
        
        if (filters.priceRange && filters.priceRange !== 'all') {
          const [minStr, maxStr] = filters.priceRange.split('-');
          const min = parseFloat(minStr || '0');
          
          if (maxStr === '5000+') {
            query = query.gte('price', min);
          } else {
            const max = parseFloat(maxStr || '0');
            query = query.gte('price', min).lte('price', max);
          }
        }
        
        if (filters.locationFilter && filters.locationFilter !== 'all') {
          query = query.eq('location', filters.locationFilter);
        }
        
        if (filters.skillsFilter && filters.skillsFilter !== 'all') {
          // Filter by tags array containing the skill
          query = query.contains('tags', [filters.skillsFilter]);
        }
      }

      // Apply pagination and ordering
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set((data || []).map((service: any) => service.user_id).filter(Boolean))];
      
      // Fetch profiles for all users
      let profilesMap = new Map();
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        
        if (profilesData) {
          profilesMap = new Map(
            profilesData.map((p: any) => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }])
          );
        }
      }

      // Transform data to include user info
      const servicesWithUser: TalentServiceWithUser[] = (data || []).map((service: any) => {
        const profile = profilesMap.get(service.user_id);
        
        return {
          ...service,
          tags: Array.isArray(service.tags) ? service.tags : [],
          user_name: profile?.full_name || 'Usuario',
          user_avatar: profile?.avatar_url || null
        };
      });

      return {
        data: servicesWithUser,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to + 1
      };
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  }

  /**
   * Get services for a specific user (talent)
   */
  async getUserServices(userId: string): Promise<TalentService[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_services')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TalentService[];
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
      const { data, error } = await supabase
        .from('marketplace_services')
        .insert({
          user_id: userId,
          ...serviceData,
          status: serviceData.is_available ? 'active' : 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data as TalentService;
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
      const { data, error } = await supabase
        .from('marketplace_services')
        .update(serviceData)
        .eq('id', serviceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as TalentService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('marketplace_services')
        .delete()
        .eq('id', serviceId)
        .eq('user_id', userId);

      if (error) throw error;
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
      // Get current views count
      const { data: service } = await supabase
        .from('marketplace_services')
        .select('views_count')
        .eq('id', serviceId)
        .single();

      if (service) {
        await supabase
          .from('marketplace_services')
          .update({ views_count: service.views_count + 1 })
          .eq('id', serviceId);
      }
    } catch (error) {
      console.error('Error incrementing service views:', error);
      // Don't throw error for view tracking
    }
  }

  // ==================== SERVICE REQUESTS ====================

  /**
   * Get service requests for a user's services
   */
  async getServiceRequests(userId: string): Promise<ServiceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_service_requests')
        .select(`
          *,
          marketplace_services!inner (
            user_id
          )
        `)
        .eq('marketplace_services.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ServiceRequest[];
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
      // Get current user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('marketplace_service_requests')
        .insert({
          service_id: serviceId,
          requester_id: user?.id,
          ...requestData
        })
        .select()
        .single();

      if (error) throw error;

      // Increment requests count
      const { data: service } = await supabase
        .from('marketplace_services')
        .select('requests_count')
        .eq('id', serviceId)
        .single();

      if (service) {
        await supabase
          .from('marketplace_services')
          .update({ requests_count: service.requests_count + 1 })
          .eq('id', serviceId);
      }

      return data as ServiceRequest;
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
      const { data, error } = await supabase
        .from('marketplace_service_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  // ==================== SERVICE PUBLISHING REQUESTS ====================

  /**
   * Create a service publishing request
   */
  async createPublishingRequest(requestData: ServicePublishingFormData): Promise<void> {
    try {
      // Get current user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('marketplace_publishing_requests')
        .insert({
          ...requestData,
          requester_id: user?.id
        });

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('marketplace_publishing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ServicePublishingRequest[];
    } catch (error) {
      console.error('Error fetching publishing requests:', error);
      throw error;
    }
  }

  /**
   * Get current user's publishing requests
   */
  async getMyPublishingRequests(): Promise<ServicePublishingRequest[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_publishing_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as ServicePublishingRequest[];
    } catch (error) {
      console.error('Error fetching my publishing requests:', error);
      throw error;
    }
  }

  /**
   * Cancel a pending publishing request
   */
  async cancelPublishingRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('marketplace_publishing_requests')
        .delete()
        .eq('id', requestId)
        .eq('status', 'pending');
      
      if (error) throw error;
    } catch (error) {
      console.error('Error canceling publishing request:', error);
      throw error;
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get service statistics
   */
  async getServiceStats(serviceId: string): Promise<ServiceStats> {
    try {
      const { data, error } = await supabase
        .from('marketplace_services')
        .select('views_count, requests_count, rating, reviews_count')
        .eq('id', serviceId)
        .single();

      if (error) throw error;

      return {
        total_views: data.views_count,
        total_requests: data.requests_count,
        average_rating: data.rating || 0,
        total_reviews: data.reviews_count
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
      const { count: totalServices } = await supabase
        .from('marketplace_services')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: providers } = await supabase
        .from('marketplace_services')
        .select('user_id')
        .eq('status', 'active');

      const uniqueProviders = new Set(providers?.map(p => p.user_id) || []);

      const { data: stats } = await supabase
        .from('marketplace_services')
        .select('rating, requests_count')
        .eq('status', 'active');

      const avgRating = stats && stats.length > 0
        ? stats.reduce((sum, s) => sum + (s.rating || 0), 0) / stats.filter(s => s.rating).length
        : 0;

      const totalRequests = stats?.reduce((sum, s) => sum + s.requests_count, 0) || 0;

      return {
        totalServices: totalServices || 0,
        activeProviders: uniqueProviders.size,
        averageRating: Number(avgRating.toFixed(1)),
        totalRequests
      };
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      return {
        totalServices: 0,
        activeProviders: 0,
        averageRating: 0,
        totalRequests: 0
      };
    }
  }
}

// Export singleton instance
export const marketplaceService = new MarketplaceService();
export default marketplaceService;