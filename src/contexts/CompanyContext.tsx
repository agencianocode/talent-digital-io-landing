import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logo_url?: string;
  business_type?: string;
  employee_count_range?: string;
  annual_revenue_range?: string;
  social_links?: Record<string, string>;
  gallery_urls?: Array<{
    id: string;
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
  }>;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyUserRole {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

interface CompanyContextType {
  // Current active company
  activeCompany: Company | null;
  setActiveCompany: (company: Company | null) => void;
  
  // User's companies (owned or member)
  userCompanies: Company[];
  
  // User's roles across companies
  userRoles: CompanyUserRole[];
  
  // Current user's role in active company
  currentUserRole: CompanyUserRole | null;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  refreshCompanies: () => Promise<void>;
  switchCompany: (companyId: string) => void;
  
  // Helper functions
  hasPermission: (permission: 'owner' | 'admin' | 'viewer') => boolean;
  canManageUsers: () => boolean;
  canCreateOpportunities: () => boolean;
  canManageApplications: () => boolean;
  canEditCompany: () => boolean;
  canDeleteOpportunities: () => boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [userRoles, setUserRoles] = useState<CompanyUserRole[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<CompanyUserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load companies and roles for current user
  const loadUserCompanies = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Use the new helper function to get user companies
      const { data: userCompanyIds, error: companiesError } = await supabase
        .rpc('get_user_companies', { user_uuid: user.id });

      if (companiesError) {
        console.error('Error getting user companies:', companiesError);
        throw companiesError;
      }

      if (!userCompanyIds || userCompanyIds.length === 0) {
        setUserCompanies([]);
        setUserRoles([]);
        setActiveCompanyState(null);
        setCurrentUserRole(null);
        localStorage.removeItem('activeCompanyId');
        return;
      }

      // Load full company details
      const { data: companies, error: companyDetailsError } = await supabase
        .from('companies')
        .select('*')
        .in('id', userCompanyIds);

      if (companyDetailsError) throw companyDetailsError;

      // Load user roles for these companies
      const { data: roles, error: rolesError } = await supabase
        .from('company_user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .in('company_id', userCompanyIds);

      if (rolesError) throw rolesError;

      setUserCompanies((companies || []).map(company => ({
        ...company,
        description: company.description ?? undefined,
        website: company.website ?? undefined,
        size: company.size ?? undefined,
        location: company.location ?? undefined,
        annual_revenue_range: company.annual_revenue_range ?? undefined,
        business_type: company.business_type ?? undefined,
        employee_count_range: company.employee_count_range ?? undefined,
        industry: company.industry ?? undefined,
        industry_id: company.industry_id ?? undefined,
        logo_url: company.logo_url ?? undefined,
        social_links: (company.social_links as Record<string, string>) || {},
        gallery_urls: ((company.gallery_urls as any[]) || []).map((item: any) => ({
          id: item?.id || Math.random().toString(),
          type: item?.type || 'image',
          url: item?.url || '',
          title: item?.title || 'Sin título',
          description: item?.description,
          thumbnail: item?.thumbnail
        }))
      })));
      
      // Map roles to ensure all required fields are present
      const mappedRoles: CompanyUserRole[] = (roles || []).map(role => ({
        id: role.id,
        company_id: role.company_id,
        user_id: role.user_id,
        role: role.role as 'owner' | 'admin' | 'viewer',
        status: role.status as 'pending' | 'accepted' | 'declined',
        invited_by: role.invited_by || undefined,
        invited_at: role.created_at, // Use created_at as invited_at since it's when the record was created
        accepted_at: role.accepted_at || undefined,
        created_at: role.created_at,
        updated_at: role.updated_at,
      }));
      
      setUserRoles(mappedRoles);

      // Set active company from localStorage or first available
      const savedCompanyId = localStorage.getItem('activeCompanyId');
      let activeComp = null;

      if (savedCompanyId) {
        activeComp = companies?.find(c => c.id === savedCompanyId);
      }
      
      if (!activeComp && companies && companies.length > 0) {
        activeComp = companies[0];
      }

      if (activeComp) {
        const companyWithUndefined = {
          ...activeComp,
          description: activeComp.description ?? undefined,
          website: activeComp.website ?? undefined,
          size: activeComp.size ?? undefined,
          location: activeComp.location ?? undefined,
          logo_url: activeComp.logo_url ?? undefined,
          annual_revenue_range: activeComp.annual_revenue_range ?? undefined,
          business_type: activeComp.business_type ?? undefined,
          employee_count_range: activeComp.employee_count_range ?? undefined,
          industry: activeComp.industry ?? undefined,
          industry_id: activeComp.industry_id ?? undefined,
        };
        setActiveCompanyState(companyWithUndefined);
        localStorage.setItem('activeCompanyId', activeComp.id);
        
        // Set current user role
        const existingRole = mappedRoles.find(role => role.company_id === activeComp.id);
        const userRole: CompanyUserRole | null = existingRole || 
          (activeComp.user_id === user.id ? {
            id: 'owner-role',
            company_id: activeComp.id,
            user_id: user.id,
            role: 'owner' as const,
            status: 'accepted' as const,
            invited_by: undefined,
            invited_at: activeComp.created_at,
            accepted_at: activeComp.created_at,
            created_at: activeComp.created_at,
            updated_at: activeComp.updated_at,
          } : null);
        
        setCurrentUserRole(userRole);
      }

    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Error al cargar empresas');
      
      // Reset state on error to prevent inconsistent UI
      setUserCompanies([]);
      setUserRoles([]);
      setActiveCompanyState(null);
      setCurrentUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to different company
  const switchCompany = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company) {
      setActiveCompanyState(company);
      localStorage.setItem('activeCompanyId', companyId);
      
      // Update current user role
      const existingRole = userRoles.find(role => role.company_id === companyId);
      const userRole: CompanyUserRole | null = existingRole ||
        (company.user_id === user?.id ? {
          id: 'owner-role',
          company_id: company.id,
          user_id: user.id,
          role: 'owner' as const,
          status: 'accepted' as const,
          invited_by: undefined,
          invited_at: company.created_at,
          accepted_at: company.created_at,
          created_at: company.created_at,
          updated_at: company.updated_at,
        } : null);
      
      setCurrentUserRole(userRole);
      toast.success(`Cambiado a empresa: ${company.name}`);
    }
  };

  // Set active company with persistence
  const setActiveCompany = (company: Company | null) => {
    setActiveCompanyState(company);
    if (company) {
      localStorage.setItem('activeCompanyId', company.id);
    } else {
      localStorage.removeItem('activeCompanyId');
    }
  };

  // Check if user has permission
  const hasPermission = (requiredRole: 'owner' | 'admin' | 'viewer'): boolean => {
    if (!currentUserRole) return false;

    const roleHierarchy = { owner: 3, admin: 2, viewer: 1 };
    return roleHierarchy[currentUserRole.role] >= roleHierarchy[requiredRole];
  };

  // Helper functions
  const canManageUsers = () => hasPermission('admin');
  const canCreateOpportunities = () => hasPermission('admin');
  const canManageApplications = () => hasPermission('viewer'); // All roles can view applications
  const canEditCompany = () => hasPermission('admin');
  const canDeleteOpportunities = () => hasPermission('owner'); // Only owners can delete

  // Refresh companies data
  const refreshCompanies = async () => {
    await loadUserCompanies();
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserCompanies();
    } else {
      // Clear data when user logs out
      setActiveCompanyState(null);
      setUserCompanies([]);
      setUserRoles([]);
      setCurrentUserRole(null);
      localStorage.removeItem('activeCompanyId');
    }
  }, [user]);

  const value: CompanyContextType = {
    activeCompany,
    setActiveCompany,
    userCompanies,
    userRoles,
    currentUserRole,
    isLoading,
    refreshCompanies,
    switchCompany,
    hasPermission,
    canManageUsers,
    canCreateOpportunities,
    canManageApplications,
    canEditCompany,
    canDeleteOpportunities,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};