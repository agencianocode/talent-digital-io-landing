import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextEnhanced';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  companyId: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  category: string;
  tags: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
  updatedAt: string;
  applicantsCount: number;
}

interface Application {
  id: string;
  opportunityId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  message: string;
  resume?: string;
}

interface OpportunitiesState {
  opportunities: Opportunity[];
  applications: Application[];
  savedOpportunities: string[];
  userApplications: Application[];
  isLoading: boolean;
  error: string | null;
}

interface OpportunitiesContextType extends OpportunitiesState {
  // Opportunities
  createOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'applicantsCount'>) => Promise<void>;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  getOpportunitiesByCompany: (companyId: string) => Opportunity[];
  
  // Applications
  applyToOpportunity: (opportunityId: string, message: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => Promise<void>;
  getApplicationsByOpportunity: (opportunityId: string) => Application[];
  
  // Saved opportunities
  saveOpportunity: (opportunityId: string) => Promise<void>;
  unsaveOpportunity: (opportunityId: string) => Promise<void>;
  
  // Filters and search
  searchOpportunities: (query: string) => Opportunity[];
  filterOpportunities: (filters: {
    category?: string;
    location?: string;
    type?: string;
    status?: string;
  }) => Opportunity[];
}

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

const STORAGE_KEY = 'talento_digital_opportunities';
const APPLICATIONS_STORAGE_KEY = 'talento_digital_applications';
const SAVED_STORAGE_KEY = 'talento_digital_saved';

// Mock data
const mockOpportunities: Opportunity[] = [
  {
    id: 'opp_1',
    title: 'Closer de ventas B2B',
    company: 'SalesXcelerator',
    companyId: 'comp_1',
    description: 'Buscamos un closer de ventas experimentado para unirse a nuestro equipo de alto rendimiento.',
    requirements: ['Experiencia en ventas B2B', 'Excelentes habilidades de comunicación', 'Orientado a resultados'],
    location: 'Madrid, España',
    type: 'remote',
    category: 'Ventas',
    tags: ['Ventas', 'Closer de ventas', 'Vendedor remoto', 'B2B'],
    salary: { min: 2000, max: 4000, currency: 'EUR' },
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    applicantsCount: 5
  },
  {
    id: 'opp_2',
    title: 'Media Buyer para Agencia de Diseño',
    company: 'Creative Agency',
    companyId: 'comp_2',
    description: 'Necesitamos un media buyer experto en Meta Ads y Google Ads para nuestros clientes.',
    requirements: ['Experiencia con Meta Ads', 'Conocimiento de Google Ads', 'Analítico'],
    location: 'Barcelona, España',
    type: 'hybrid',
    category: 'Marketing',
    tags: ['Ads', 'Media Buyer', 'Marketing', 'Meta Ads', 'Google Ads'],
    salary: { min: 1800, max: 3500, currency: 'EUR' },
    status: 'active',
    createdAt: '2024-01-10T09:30:00Z',
    updatedAt: '2024-01-10T09:30:00Z',
    applicantsCount: 3
  }
];

export const OpportunitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<OpportunitiesState>({
    opportunities: [],
    applications: [],
    savedOpportunities: [],
    userApplications: [],
    isLoading: true,
    error: null
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        // Load from localStorage or use mock data
        const savedOpportunities = localStorage.getItem(STORAGE_KEY);
        const savedApplications = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
        const savedSaved = localStorage.getItem(SAVED_STORAGE_KEY);

        const opportunities = savedOpportunities ? JSON.parse(savedOpportunities) : mockOpportunities;
        const applications = savedApplications ? JSON.parse(savedApplications) : [];
        const savedOpportunitiesIds = savedSaved ? JSON.parse(savedSaved) : [];

        // Filter user applications if authenticated
        const userApplications = isAuthenticated && user 
          ? applications.filter((app: Application) => app.applicantId === user.id)
          : [];

        setState({
          opportunities,
          applications,
          savedOpportunities: savedOpportunitiesIds,
          userApplications,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error loading opportunities data'
        }));
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  // Auto-save to localStorage
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  const createOpportunity = useCallback(async (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'applicantsCount'>) => {
    if (!user || user.type !== 'business') return;

    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: `opp_${Date.now()}`,
      companyId: user.company?.id || user.id,
      company: user.company?.name || 'Unknown Company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicantsCount: 0
    };

    const updatedOpportunities = [...state.opportunities, newOpportunity];
    setState(prev => ({ ...prev, opportunities: updatedOpportunities }));
    saveToStorage(STORAGE_KEY, updatedOpportunities);
  }, [user, state.opportunities, saveToStorage]);

  const updateOpportunity = useCallback(async (id: string, updates: Partial<Opportunity>) => {
    const updatedOpportunities = state.opportunities.map(opp =>
      opp.id === id ? { ...opp, ...updates, updatedAt: new Date().toISOString() } : opp
    );
    setState(prev => ({ ...prev, opportunities: updatedOpportunities }));
    saveToStorage(STORAGE_KEY, updatedOpportunities);
  }, [state.opportunities, saveToStorage]);

  const deleteOpportunity = useCallback(async (id: string) => {
    const updatedOpportunities = state.opportunities.filter(opp => opp.id !== id);
    setState(prev => ({ ...prev, opportunities: updatedOpportunities }));
    saveToStorage(STORAGE_KEY, updatedOpportunities);
  }, [state.opportunities, saveToStorage]);

  const applyToOpportunity = useCallback(async (opportunityId: string, message: string) => {
    if (!user || user.type !== 'talent') return;

    const application: Application = {
      id: `app_${Date.now()}`,
      opportunityId,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      message
    };

    const updatedApplications = [...state.applications, application];
    const updatedUserApplications = [...state.userApplications, application];

    // Update opportunity applicants count
    const updatedOpportunities = state.opportunities.map(opp =>
      opp.id === opportunityId 
        ? { ...opp, applicantsCount: opp.applicantsCount + 1 }
        : opp
    );

    setState(prev => ({
      ...prev,
      applications: updatedApplications,
      userApplications: updatedUserApplications,
      opportunities: updatedOpportunities
    }));

    saveToStorage(APPLICATIONS_STORAGE_KEY, updatedApplications);
    saveToStorage(STORAGE_KEY, updatedOpportunities);
  }, [user, state.applications, state.userApplications, state.opportunities, saveToStorage]);

  const updateApplicationStatus = useCallback(async (applicationId: string, status: Application['status']) => {
    const updatedApplications = state.applications.map(app =>
      app.id === applicationId ? { ...app, status } : app
    );
    
    const updatedUserApplications = state.userApplications.map(app =>
      app.id === applicationId ? { ...app, status } : app
    );

    setState(prev => ({
      ...prev,
      applications: updatedApplications,
      userApplications: updatedUserApplications
    }));

    saveToStorage(APPLICATIONS_STORAGE_KEY, updatedApplications);
  }, [state.applications, state.userApplications, saveToStorage]);

  const saveOpportunity = useCallback(async (opportunityId: string) => {
    if (!state.savedOpportunities.includes(opportunityId)) {
      const updatedSaved = [...state.savedOpportunities, opportunityId];
      setState(prev => ({ ...prev, savedOpportunities: updatedSaved }));
      saveToStorage(SAVED_STORAGE_KEY, updatedSaved);
    }
  }, [state.savedOpportunities, saveToStorage]);

  const unsaveOpportunity = useCallback(async (opportunityId: string) => {
    const updatedSaved = state.savedOpportunities.filter(id => id !== opportunityId);
    setState(prev => ({ ...prev, savedOpportunities: updatedSaved }));
    saveToStorage(SAVED_STORAGE_KEY, updatedSaved);
  }, [state.savedOpportunities, saveToStorage]);

  // Helper functions
  const getOpportunitiesByCompany = useCallback((companyId: string) => {
    return state.opportunities.filter(opp => opp.companyId === companyId);
  }, [state.opportunities]);

  const getApplicationsByOpportunity = useCallback((opportunityId: string) => {
    return state.applications.filter(app => app.opportunityId === opportunityId);
  }, [state.applications]);

  const searchOpportunities = useCallback((query: string) => {
    if (!query.trim()) return state.opportunities;
    
    const lowerQuery = query.toLowerCase();
    return state.opportunities.filter(opp =>
      opp.title.toLowerCase().includes(lowerQuery) ||
      opp.company.toLowerCase().includes(lowerQuery) ||
      opp.description.toLowerCase().includes(lowerQuery) ||
      opp.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [state.opportunities]);

  const filterOpportunities = useCallback((filters: {
    category?: string;
    location?: string;
    type?: string;
    status?: string;
  }) => {
    return state.opportunities.filter(opp => {
      if (filters.category && opp.category !== filters.category) return false;
      if (filters.location && !opp.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.type && opp.type !== filters.type) return false;
      if (filters.status && opp.status !== filters.status) return false;
      return true;
    });
  }, [state.opportunities]);

  return (
    <OpportunitiesContext.Provider value={{
      ...state,
      createOpportunity,
      updateOpportunity,
      deleteOpportunity,
      applyToOpportunity,
      updateApplicationStatus,
      saveOpportunity,
      unsaveOpportunity,
      getOpportunitiesByCompany,
      getApplicationsByOpportunity,
      searchOpportunities,
      filterOpportunities
    }}>
      {children}
    </OpportunitiesContext.Provider>
  );
};

export const useOpportunities = () => {
  const context = useContext(OpportunitiesContext);
  if (context === undefined) {
    throw new Error('useOpportunities must be used within an OpportunitiesProvider');
  }
  return context;
};