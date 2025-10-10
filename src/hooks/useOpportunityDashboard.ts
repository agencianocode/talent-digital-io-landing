import { useState, useEffect } from 'react';
import { useSupabaseOpportunities } from './useSupabaseOpportunities';
import { useRealApplications } from './useRealApplications';
import { mockOpportunityData, getMockOpportunities, getMockMetrics } from '@/components/dashboard/MockOpportunityData';

interface DashboardMetrics {
  activeOpportunities: number;
  totalApplications: number;
  unreadApplications: number;
  candidatesInEvaluation: number;
  averageResponseTime: number;
  contactedCandidates: number;
  thisWeekApplications: number;
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
    unreadApplications: 0,
    candidatesInEvaluation: 0,
    averageResponseTime: 0,
    contactedCandidates: 0,
    thisWeekApplications: 0,
    conversionRate: 0,
  });
  
  const [opportunitiesWithExtras, setOpportunitiesWithExtras] = useState<OpportunityWithExtras[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Hook real de Supabase
  const { 
    opportunities: realOpportunities, 
    isLoading: realLoading, 
    deleteOpportunity,
    toggleOpportunityStatus
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
          setMetrics(mockMetrics);
          setApplicationCounts(mockOpportunityData.applications);
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

          // Filtrar para mostrar solo la última versión de cada borrador y todas las publicadas
          const opportunityMap = new Map();
          
          extendedOpps.forEach(opp => {
            // Si es publicada, siempre incluir
            if (opp.status === 'active' || opp.status === 'paused' || opp.status === 'closed') {
              opportunityMap.set(opp.id, opp);
            } 
            // Si es borrador, solo mantener la más reciente
            else if (opp.status === 'draft') {
              const existing = Array.from(opportunityMap.values()).find(
                existingOpp => existingOpp.status === 'draft' && 
                              existingOpp.title === opp.title && 
                              existingOpp.company_id === opp.company_id
              );
              
              if (!existing) {
                opportunityMap.set(opp.id, opp);
              } else {
                // Mantener solo el más reciente
                const existingDate = new Date(existing.created_at);
                const currentDate = new Date(opp.created_at);
                
                if (currentDate > existingDate) {
                  // Eliminar el anterior
                  opportunityMap.delete(existing.id);
                  // Agregar el más reciente
                  opportunityMap.set(opp.id, opp);
                }
              }
            }
          });

          extendedOpps = Array.from(opportunityMap.values());

          setOpportunitiesWithExtras(extendedOpps as OpportunityWithExtras[]);
          
          // Métricas calculadas desde datos reales
          const activeCount = extendedOpps.filter(opp => opp.status === 'active').length;
          
          // Usar métricas reales de aplicaciones
          setMetrics({
            activeOpportunities: activeCount,
            totalApplications: realApplicationMetrics.totalApplications,
            unreadApplications: realApplicationMetrics.unreadApplications,
            candidatesInEvaluation: Math.floor(realApplicationMetrics.totalApplications * 0.25),
            averageResponseTime: 2.3, // Mantener como mock por ahora
            contactedCandidates: realApplicationMetrics.contactedCandidates,
            thisWeekApplications: realApplicationMetrics.thisWeekApplications,
            conversionRate: realApplicationMetrics.conversionRate
          });

          // Usar conteos reales de aplicaciones por oportunidad
          setApplicationCounts(realApplicationMetrics.applicationsByOpportunity);
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
    isLoading,
    deleteOpportunity,
    toggleOpportunityStatus,
    // Función para alternar entre mock y real data
    toggleMockData: () => !useMockData
  };
};
