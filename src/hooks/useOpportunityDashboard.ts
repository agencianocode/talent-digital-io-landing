import { useState, useEffect } from 'react';
import { useSupabaseOpportunities } from './useSupabaseOpportunities';
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
          const extendedOpps = realOpportunities.map(opp => ({
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
            commission_percentage: (opp as any).commission_percentage || null
          }));

          setOpportunitiesWithExtras(extendedOpps as OpportunityWithExtras[]);
          
          // Métricas calculadas desde datos reales
          const activeCount = extendedOpps.filter(opp => opp.status === 'active').length;
          const totalApplications = Math.floor(Math.random() * 50) + 20; // Mock
          
          setMetrics({
            activeOpportunities: activeCount,
            totalApplications,
            unreadApplications: Math.floor(totalApplications * 0.4),
            candidatesInEvaluation: Math.floor(totalApplications * 0.25),
            averageResponseTime: 2.3,
            contactedCandidates: Math.floor(totalApplications * 0.3),
            thisWeekApplications: Math.floor(Math.random() * 15) + 5,
            conversionRate: Math.round((Math.floor(totalApplications * 0.3) / totalApplications) * 100 * 10) / 10
          });

          // Mock application counts para oportunidades reales
          const mockCounts: Record<string, number> = {};
          extendedOpps.forEach(opp => {
            mockCounts[opp.id] = Math.floor(Math.random() * 20) + 1;
          });
          setApplicationCounts(mockCounts);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!useMockData && realLoading) {
      // Esperar a que termine de cargar los datos reales
      return;
    }

    loadData();
  }, [useMockData, realOpportunities, realLoading]);

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
