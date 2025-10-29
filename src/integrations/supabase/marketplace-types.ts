// Marketplace Types for Supabase Integration
// This file contains TypeScript types for the marketplace tables

export interface TalentService {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  delivery_time: string;
  location: string;
  is_available: boolean;
  status: 'draft' | 'active' | 'paused' | 'sold';
  portfolio_url?: string;
  demo_url?: string;
  tags: string[];
  views_count: number;
  requests_count: number;
  rating?: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  service_id: string;
  requester_id?: string | null;
  requester_name: string;
  requester_email: string;
  requester_phone?: string | null;
  company_name?: string | null;
  message: string;
  budget_range: string;
  timeline: string;
  project_type: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ServicePublishingRequest {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string | null;
  company_name: string;
  service_type: string;
  budget?: string | null;
  timeline?: string | null;
  description: string;
  requirements?: string | null;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with user information
export interface TalentServiceWithUser extends TalentService {
  user_name: string;
  user_avatar?: string;
}

export interface ServiceRequestWithService extends ServiceRequest {
  service_title: string;
  service_category: string;
}

// Form data types
export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  delivery_time: string;
  location: string;
  is_available: boolean;
  portfolio_url?: string;
  demo_url?: string;
  tags: string[];
}

export interface ServiceRequestFormData {
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  company_name?: string;
  message: string;
  budget_range: string;
  timeline: string;
  project_type: string;
}

export interface ServicePublishingFormData {
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name: string;
  service_type: string;
  budget?: string;
  timeline?: string;
  description: string;
  requirements?: string;
}

// Filter types
export interface ServiceFilters {
  searchQuery: string;
  categoryFilter: string;
  priceRange: string;
  locationFilter: string;
  availabilityFilter: string;
  skillsFilter?: string;
}

// Statistics types
export interface ServiceStats {
  total_views: number;
  total_requests: number;
  average_rating: number;
  total_reviews: number;
}

export interface MarketplaceStats {
  totalServices: number;
  activeProviders: number;
  averageRating: number;
  totalRequests: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Database operation types
export type ServiceStatus = 'draft' | 'active' | 'paused' | 'sold';
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';
export type PublishingStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

// Category types
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Search and sort types
export interface SearchOptions {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  isAvailable?: boolean;
  sortBy?: 'created_at' | 'price' | 'rating' | 'views_count';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Analytics types
export interface ServiceAnalytics {
  service_id: string;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  requests_today: number;
  requests_this_week: number;
  requests_this_month: number;
  conversion_rate: number;
}

// Notification types
export interface MarketplaceNotification {
  id: string;
  user_id: string;
  type: 'new_request' | 'request_accepted' | 'request_declined' | 'service_published' | 'service_paused';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}
