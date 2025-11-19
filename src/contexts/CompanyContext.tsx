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
  user_id: string | null;
  role: 'owner' | 'admin' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  invited_by?: string;
  invited_email?: string;
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
  switchCompany: (companyId: string) => Promise<void>;
  
  // Helper functions
  hasPermission: (permission: 'owner' | 'admin' | 'viewer') => boolean;
  canManageUsers: () => boolean;
  canViewOpportunities: () => boolean;
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

      // Ordenar empresas: "Agencia de No Code" primero, luego el resto
      const sortedCompanies = (companies || []).sort((a, b) => {
        const aIsAgencia = a.name.toLowerCase().includes('agencia de no code') || 
                          a.name.toLowerCase().includes('agencianocode');
        const bIsAgencia = b.name.toLowerCase().includes('agencia de no code') || 
                          b.name.toLowerCase().includes('agencianocode');
        
        if (aIsAgencia && !bIsAgencia) return -1;
        if (!aIsAgencia && bIsAgencia) return 1;
        // Si ambas o ninguna son "Agencia de No Code", ordenar por fecha de creación
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      setUserCompanies(sortedCompanies.map(company => ({
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
        social_links: company.social_links ? (company.social_links as Record<string, string>) : undefined,
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
        invited_email: role.invited_email || undefined,
        invited_at: role.created_at,
        accepted_at: role.accepted_at || undefined,
        created_at: role.created_at,
        updated_at: role.updated_at,
      }));
      
      setUserRoles(mappedRoles);

      // Set active company from localStorage or preserve current active company
      const savedCompanyId = localStorage.getItem('activeCompanyId');
      // También verificar si hay una empresa activa actualmente
      const currentActiveId = activeCompany?.id || savedCompanyId;
      let activeComp = null;

      // Prioridad 1: Empresa activa actual (si todavía existe en la lista)
      if (currentActiveId) {
        activeComp = sortedCompanies?.find(c => c.id === currentActiveId);
      }
      
      // Prioridad 2: Empresa guardada en localStorage (si existe)
      if (!activeComp && savedCompanyId) {
        activeComp = sortedCompanies?.find(c => c.id === savedCompanyId);
      }
      
      // Prioridad 3: "Agencia de No Code" si existe (empresa principal)
      if (!activeComp && sortedCompanies && sortedCompanies.length > 0) {
        const agenciaNoCode = sortedCompanies.find(c => 
          c.name.toLowerCase().includes('agencia de no code') || 
          c.name.toLowerCase().includes('agencianocode')
        );
        if (agenciaNoCode) {
          activeComp = agenciaNoCode;
        }
      }
      
      // Prioridad 4: Primera empresa disponible (ya está ordenada, así que será "Agencia de No Code" si existe)
      if (!activeComp && sortedCompanies && sortedCompanies.length > 0) {
        activeComp = sortedCompanies[0];
      }

      if (activeComp) {
        const companyWithUndefined: Company = {
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
          social_links: activeComp.social_links ? (activeComp.social_links as Record<string, string>) : undefined,
          gallery_urls: ((activeComp.gallery_urls as any[]) || []).map((item: any) => ({
            id: item?.id || Math.random().toString(),
            type: item?.type || 'image',
            url: item?.url || '',
            title: item?.title || 'Sin título',
            description: item?.description,
            thumbnail: item?.thumbnail
          }))
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
  const switchCompany = async (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (!company) {
      toast.error('Empresa no encontrada');
      return;
    }

    try {
      // Recargar la información completa de la empresa desde la base de datos
      const { data: freshCompany, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) {
        console.error('Error loading company:', companyError);
        toast.error('Error al cargar la empresa');
        return;
      }

      if (!freshCompany) {
        toast.error('Empresa no encontrada');
        return;
      }

      // Formatear la empresa con los campos opcionales correctamente
      const companyWithUndefined: Company = {
        ...freshCompany,
        description: freshCompany.description ?? undefined,
        website: freshCompany.website ?? undefined,
        size: freshCompany.size ?? undefined,
        location: freshCompany.location ?? undefined,
        logo_url: freshCompany.logo_url ?? undefined,
        annual_revenue_range: freshCompany.annual_revenue_range ?? undefined,
        business_type: freshCompany.business_type ?? undefined,
        employee_count_range: freshCompany.employee_count_range ?? undefined,
        industry: freshCompany.industry ?? undefined,
        social_links: freshCompany.social_links ? (freshCompany.social_links as Record<string, string>) : undefined,
        gallery_urls: ((freshCompany.gallery_urls as any[]) || []).map((item: any) => ({
          id: item?.id || Math.random().toString(),
          type: item?.type || 'image',
          url: item?.url || '',
          title: item?.title || 'Sin título',
          description: item?.description,
          thumbnail: item?.thumbnail
        }))
      };

      // Actualizar el estado con la empresa fresca
      setActiveCompanyState(companyWithUndefined);
      localStorage.setItem('activeCompanyId', companyId);
      
      // Actualizar la lista de empresas con la información fresca
      setUserCompanies(prev => prev.map(c => 
        c.id === companyId ? companyWithUndefined : c
      ));
      
      // Update current user role
      const existingRole = userRoles.find(role => role.company_id === companyId);
      const userRole: CompanyUserRole | null = existingRole || 
        (freshCompany.user_id === user?.id ? {
          id: 'owner-role',
          company_id: freshCompany.id,
          user_id: user.id,
          role: 'owner' as const,
          status: 'accepted' as const,
          invited_by: undefined,
          invited_at: freshCompany.created_at,
          accepted_at: freshCompany.created_at,
          created_at: freshCompany.created_at,
          updated_at: freshCompany.updated_at,
        } : null);
      
      setCurrentUserRole(userRole);
      toast.success(`Cambiado a empresa: ${companyWithUndefined.name}`);
    } catch (error) {
      console.error('Error switching company:', error);
      toast.error('Error al cambiar de empresa');
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
  const canViewOpportunities = () => hasPermission('viewer'); // All roles can view
  const canCreateOpportunities = () => hasPermission('admin'); // Only admin and owner can create
  const canManageApplications = () => hasPermission('viewer'); // All roles can view applications
  const canEditCompany = () => hasPermission('admin');
  const canDeleteOpportunities = () => hasPermission('owner'); // Only owners can delete

  // Refresh companies data
  const refreshCompanies = async () => {
    // loadUserCompanies ya preserva la empresa activa actual si existe
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
    canViewOpportunities,
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