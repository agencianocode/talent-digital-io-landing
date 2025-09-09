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
      // Load owned companies
      const { data: ownedCompanies, error: ownedError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);

      if (ownedError) throw ownedError;

      // Load roles in other companies (using any until types are regenerated)
      const { data: roles, error: rolesError } = await (supabase as any)
        .from('company_user_roles')
        .select('*, companies(*)')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (rolesError) throw rolesError;

      // Combine owned companies with member companies
      const memberCompanies = roles?.map((role: any) => role.companies).filter(Boolean) || [];
      const allCompanies = [...(ownedCompanies || []), ...memberCompanies];
      
      // Remove duplicates by id
      const uniqueCompanies = allCompanies.filter(
        (company, index, self) => index === self.findIndex(c => c.id === company.id)
      );

      setUserCompanies(uniqueCompanies);
      setUserRoles(roles || []);

      // Set active company from localStorage or first available
      const savedCompanyId = localStorage.getItem('activeCompanyId');
      let activeComp = null;

      if (savedCompanyId) {
        activeComp = uniqueCompanies.find(c => c.id === savedCompanyId);
      }
      
      if (!activeComp && uniqueCompanies.length > 0) {
        activeComp = uniqueCompanies[0];
      }

      if (activeComp) {
        setActiveCompanyState(activeComp);
        localStorage.setItem('activeCompanyId', activeComp.id);
        
        // Set current user role
        const userRole = roles?.find((role: any) => role.company_id === activeComp.id) || 
          (ownedCompanies?.find(c => c.id === activeComp.id) ? {
            id: 'owner-role',
            company_id: activeComp.id,
            user_id: user.id,
            role: 'owner' as const,
            status: 'accepted' as const,
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
      const userRole = userRoles.find(role => role.company_id === companyId) ||
        (company.user_id === user?.id ? {
          id: 'owner-role',
          company_id: company.id,
          user_id: user.id,
          role: 'owner' as const,
          status: 'accepted' as const,
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
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};