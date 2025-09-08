import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth, isBusinessRole, isTalentRole } from './SupabaseAuthContext';

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
  subcategory?: string;
  experienceLevel?: 'junior' | 'semi-senior' | 'senior';
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

// Enhanced mock data with more fields
const mockOpportunities: Opportunity[] = [
  {
    id: 'opp_1',
    title: 'Closer de ventas B2B',
    company: 'SalesXcelerator',
    companyId: 'comp_1',
    description: 'Buscamos un closer de ventas experimentado para unirse a nuestro equipo de alto rendimiento. Trabajarás con leads cualificados y tendrás la oportunidad de generar ingresos significativos.',
    requirements: [
      'Experiencia mínima de 2 años en ventas B2B',
      'Excelentes habilidades de comunicación',
      'Orientado a resultados y metas',
      'Experiencia con CRM (HubSpot, Salesforce)',
      'Capacidad de trabajar bajo presión'
    ],
    location: 'Madrid, España',
    type: 'remote',
    category: 'ventas',
    subcategory: 'closer',
    experienceLevel: 'semi-senior',
    tags: ['Ventas', 'Closer de ventas', 'Vendedor remoto', 'B2B', 'CRM', 'HubSpot'],
    salary: { min: 35, max: 60, currency: 'EUR' },
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    applicantsCount: 8
  },
  {
    id: 'opp_2',
    title: 'Media Buyer para Agencia de Diseño',
    company: 'Creative Agency',
    companyId: 'comp_2',
    description: 'Necesitamos un media buyer experto en Meta Ads y Google Ads para nuestros clientes. Manejarás presupuestos significativos y optimizarás campañas para maximizar el ROI.',
    requirements: [
      'Experiencia de 3+ años con Meta Ads',
      'Conocimiento avanzado de Google Ads',
      'Experiencia con herramientas de análisis',
      'Capacidad analítica y de optimización',
      'Portfolio demostrable de campañas exitosas'
    ],
    location: 'Barcelona, España',
    type: 'hybrid',
    category: 'marketing',
    subcategory: 'media-buyer',
    experienceLevel: 'senior',
    tags: ['Ads', 'Media Buyer', 'Marketing', 'Meta Ads', 'Google Ads', 'PPC', 'ROI'],
    salary: { min: 40, max: 65, currency: 'EUR' },
    status: 'active',
    createdAt: '2024-01-10T09:30:00Z',
    updatedAt: '2024-01-10T09:30:00Z',
    applicantsCount: 12
  },
  {
    id: 'opp_3',
    title: 'SDR - Sales Development Representative',
    company: 'TechStartup Pro',
    companyId: 'comp_3',
    description: 'Únete a nuestro equipo como SDR y ayúdanos a generar leads cualificados para nuestro equipo de ventas. Posición ideal para alguien que quiera crecer en ventas.',
    requirements: [
      'Experiencia de 1+ año en prospección',
      'Conocimiento de LinkedIn Sales Navigator',
      'Excelentes habilidades de comunicación escrita',
      'Proactividad y perseverancia',
      'Nivel de inglés conversacional'
    ],
    location: 'Valencia, España',
    type: 'remote',
    category: 'ventas',
    subcategory: 'sdr',
    experienceLevel: 'junior',
    tags: ['SDR', 'Prospección', 'LinkedIn', 'Lead Generation', 'Sales Navigator'],
    salary: { min: 25, max: 35, currency: 'EUR' },
    status: 'active',
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-08T14:20:00Z',
    applicantsCount: 5
  },
  {
    id: 'opp_4',
    title: 'Content Creator & Social Media Manager',
    company: 'Influencer Marketing Hub',
    companyId: 'comp_4',
    description: 'Buscamos un creador de contenido que maneje nuestras redes sociales y cree contenido viral para nuestros clientes en el sector del marketing de influencers.',
    requirements: [
      'Portfolio de contenido en redes sociales',
      'Experiencia con herramientas de diseño (Canva, Photoshop)',
      'Conocimiento de tendencias en redes sociales',
      'Capacidad de storytelling',
      'Experiencia con scheduling tools'
    ],
    location: 'Sevilla, España',
    type: 'hybrid',
    category: 'marketing',
    subcategory: 'content-creator',
    experienceLevel: 'semi-senior',
    tags: ['Content Creator', 'Social Media', 'Instagram', 'TikTok', 'Diseño', 'Storytelling'],
    salary: { min: 30, max: 45, currency: 'EUR' },
    status: 'active',
    createdAt: '2024-01-05T11:15:00Z',
    updatedAt: '2024-01-05T11:15:00Z',
    applicantsCount: 15
  },
  {
    id: 'opp_5',
    title: 'Operations Manager - E-commerce',
    company: 'EcommercePro Solutions',
    companyId: 'comp_5',
    description: 'Gestiona las operaciones diarias de nuestro e-commerce, coordina con proveedores, maneja inventario y optimiza procesos para maximizar la eficiencia.',
    requirements: [
      'Experiencia de 4+ años en operaciones',
      'Conocimiento de e-commerce platforms',
      'Habilidades de gestión de equipos',
      'Experiencia con análisis de datos',
      'Capacidad de optimización de procesos'
    ],
    location: 'Bilbao, España',
    type: 'onsite',
    category: 'operaciones',
    subcategory: 'operations-manager',
    experienceLevel: 'senior',
    tags: ['Operations', 'E-commerce', 'Management', 'Inventario', 'Proveedores', 'Análisis'],
    salary: { min: 45, max: 70, currency: 'EUR' },
    status: 'active',
    createdAt: '2024-01-03T16:45:00Z',
    updatedAt: '2024-01-03T16:45:00Z',
    applicantsCount: 7
  }
];

export const OpportunitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, userRole, company, profile } = useSupabaseAuth();
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
    if (!user || !isBusinessRole(userRole)) return;

    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: `opp_${Date.now()}`,
      companyId: company?.id || user.id,
      company: company?.name || 'Mi Empresa',
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
    if (!user || !isTalentRole(userRole)) return;

    const application: Application = {
      id: `app_${Date.now()}`,
      opportunityId,
      applicantId: user.id,
      applicantName: profile?.full_name || 'Usuario',
      applicantEmail: user?.email || '',
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
      opp.location.toLowerCase().includes(lowerQuery) ||
      opp.category.toLowerCase().includes(lowerQuery) ||
      opp.subcategory?.toLowerCase().includes(lowerQuery) ||
      opp.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      opp.requirements.some(req => req.toLowerCase().includes(lowerQuery))
    );
  }, [state.opportunities]);

  const filterOpportunities = useCallback((filters: {
    category?: string;
    subcategory?: string;
    location?: string;
    type?: string;
    status?: string;
    experienceLevel?: string;
    salaryRange?: number[];
    workMode?: string;
  }) => {
    return state.opportunities.filter(opp => {
      if (filters.category && opp.category !== filters.category) return false;
      if (filters.subcategory && opp.subcategory !== filters.subcategory) return false;
      if (filters.location && !opp.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.type && opp.type !== filters.type) return false;
      if (filters.workMode && opp.type !== filters.workMode) return false;
      if (filters.status && opp.status !== filters.status) return false;
      if (filters.experienceLevel && opp.experienceLevel !== filters.experienceLevel) return false;
      
      // Salary range filter
      if (filters.salaryRange && opp.salary) {
        const [minSalary, maxSalary] = filters.salaryRange;
        if (opp.salary.max < minSalary || opp.salary.min > maxSalary) return false;
      }
      
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