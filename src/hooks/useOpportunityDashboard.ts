import { useState, useEffect } from 'react';
import { useSupabaseOpportunities } from './useSupabaseOpportunities';
import { useRealApplications } from './useRealApplications';
import { mockOpportunityData, getMockOpportunities, getMockMetrics } from '@/components/dashboard/MockOpportunityData';

interface DashboardMetrics {
  activeOpportunities: number;
  totalApplications: number;
  applicationsInActiveOpportunities: number;
  unreadApplications: number;
  unreviewedApplications: number;
  candidatesInEvaluation: number;
  averageResponseTime: number | string;
  contactedCandidates: number;
  candidatesContacted: number;
  thisWeekApplications: number;
  applicationsThisMonth: number;
  conversionRate: number;
}

interface OpportunityWithExtras {
  id: string;
  title: string;
  category?: string | null;
  status?: string | null;
  location?: string | null;
  location_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_period?: string;
  payment_type?: string;
  commission_percentage?: number | null;
  description?: string | null;
  skills?: string[];
  experience_levels?: string[];
  deadline_date?: string | null;
  is_academy_exclusive?: boolean;
  created_at: string;
  company_id: string;
}

export const useOpportunityDashboard = (useMockData: boolean = false) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeOpportunities: 0,
    totalApplications: 0,
    applicationsInActiveOpportunities: 0,
    unreadApplications: 0,
    unreviewedApplications: 0,
    candidatesInEvaluation: 0,
    averageResponseTime: 0,
    contactedCandidates: 0,
    candidatesContacted: 0,
    thisWeekApplications: 0,
    applicationsThisMonth: 0,
    conversionRate: 0,
  });
  
  const [opportunitiesWithExtras, setOpportunitiesWithExtras] = useState<OpportunityWithExtras[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Hook real de Supabase
  const { 
    opportunities: realOpportunities, 
    isLoading: realLoading, 
    deleteOpportunity,
    toggleOpportunityStatus,
    closeOpportunity
  } = useSupabaseOpportunities();

  // Hook para aplicaciones reales
  const { 
    metrics: realApplicationMetrics, 
    isLoading: applicationsLoading 
  } = useRealApplications();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        if (useMockData) {
          // Usar datos mockeados
          const mockOpps = await getMockOpportunities();
          const mockMetrics = await getMockMetrics();
          
          setOpportunitiesWithExtras(mockOpps as OpportunityWithExtras[]);
          setMetrics({
            ...mockMetrics,
            applicationsInActiveOpportunities: mockMetrics.totalApplications,
            unreviewedApplications: mockMetrics.unreadApplications,
            candidatesContacted: mockMetrics.contactedCandidates,
            applicationsThisMonth: mockMetrics.thisWeekApplications
          });
          setApplicationCounts(mockOpportunityData.applications);
          // Generar conteos de vistas mock
          const mockViews: Record<string, number> = {};
          mockOpps.forEach(opp => {
            mockViews[opp.id] = Math.floor(Math.random() * 200) + 50;
          });
          setViewCounts(mockViews);
        } else {
          // Usar datos reales pero extendidos con campos mock
          let extendedOpps = realOpportunities.map(opp => ({
            ...opp,
            status: opp.status || 'draft',
            // Agregar campos que pueden no existir en la DB
            location_type: (opp as any).location_type || 'remote',
            salary_period: (opp as any).salary_period || 'monthly',
            payment_type: (opp as any).payment_type || 'fixed',
            skills: (opp as any).skills || ['React', 'JavaScript'], // Mock skills
            experience_levels: (opp as any).experience_levels || ['Mid-level'],
            deadline_date: (opp as any).deadline_date || null,
            is_academy_exclusive: (opp as any).is_academy_exclusive || false,
            commission_percentage: (opp as any).commission_percentage || null,
            // Agregar información de la empresa
            company_name: (opp as any).companies?.name || 'Mi Empresa'
          }));

          // Separar borradores y publicadas
          const publishedOpps = extendedOpps.filter(
            opp => opp.status === 'active' || opp.status === 'paused' || opp.status === 'closed'
          );
          
          const draftOpps = extendedOpps.filter(opp => opp.status === 'draft');
          
          // Para cada company_id, solo mantener el borrador más reciente
          const latestDraftsByCompany = new Map<string, typeof extendedOpps[0]>();
          
          draftOpps.forEach(draft => {
            const existingDraft = latestDraftsByCompany.get(draft.company_id);
            
            if (!existingDraft) {
              latestDraftsByCompany.set(draft.company_id, draft);
            } else {
              const existingDate = new Date(existingDraft.created_at);
              const currentDate = new Date(draft.created_at);
              
              if (currentDate > existingDate) {
                latestDraftsByCompany.set(draft.company_id, draft);
              }
            }
          });
          
          // Combinar publicadas + solo el último borrador de cada empresa
          extendedOpps = [...publishedOpps, ...Array.from(latestDraftsByCompany.values())];

          setOpportunitiesWithExtras(extendedOpps as OpportunityWithExtras[]);
          
          // Métricas calculadas desde datos reales
          const activeCount = extendedOpps.filter(opp => opp.status === 'active').length;
          
          // Usar métricas reales de aplicaciones
          setMetrics({
            activeOpportunities: activeCount,
            totalApplications: realApplicationMetrics.totalApplications,
            applicationsInActiveOpportunities: realApplicationMetrics.totalApplications,
            unreadApplications: realApplicationMetrics.unreadApplications,
            unreviewedApplications: realApplicationMetrics.unreadApplications,
            candidatesInEvaluation: realApplicationMetrics.candidatesInEvaluation || 0,
            averageResponseTime: 0, // Mostrar 0 hasta implementar cálculo real
            contactedCandidates: realApplicationMetrics.contactedCandidates,
            candidatesContacted: realApplicationMetrics.contactedCandidates,
            thisWeekApplications: realApplicationMetrics.thisWeekApplications,
            applicationsThisMonth: realApplicationMetrics.thisWeekApplications,
            conversionRate: realApplicationMetrics.conversionRate
          });

          // Usar conteos reales de aplicaciones por oportunidad
          setApplicationCounts(realApplicationMetrics.applicationsByOpportunity);

          // Obtener conteos de vistas reales desde la base de datos
          const { supabase } = await import('@/integrations/supabase/client');
          const opportunityIds = extendedOpps.map(opp => opp.id);
          
          if (opportunityIds.length > 0) {
            const { data: viewsData, error: viewsError } = await supabase
              .from('opportunity_views')
              .select('opportunity_id')
              .in('opportunity_id', opportunityIds);
            
            if (!viewsError && viewsData) {
              const viewCountsMap: Record<string, number> = {};
              viewsData.forEach(view => {
                viewCountsMap[view.opportunity_id] = (viewCountsMap[view.opportunity_id] || 0) + 1;
              });
              setViewCounts(viewCountsMap);
            }
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!useMockData && (realLoading || applicationsLoading)) {
      // Esperar a que termine de cargar los datos reales
      return;
    }

    loadData();
  }, [useMockData, realOpportunities, realLoading, realApplicationMetrics, applicationsLoading]);

  return {
    opportunities: opportunitiesWithExtras,
    metrics,
    applicationCounts,
    viewCounts,
    isLoading,
    deleteOpportunity,
    toggleOpportunityStatus,
    closeOpportunity,
    // Función para alternar entre mock y real data
    toggleMockData: () => !useMockData
  };
};
