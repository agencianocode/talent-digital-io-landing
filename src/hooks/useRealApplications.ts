import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

interface Application {
  id: string;
  opportunity_id: string;
  user_id: string;
  cover_letter: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  opportunities?: {
    id: string;
    title: string;
    company_id: string;
  };
  profiles?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    position: string | null;
  };
}

interface ApplicationMetrics {
  totalApplications: number;
  unreadApplications: number;
  thisWeekApplications: number;
  thisMonthApplications: number;
  contactedCandidates: number;
  candidatesInEvaluation: number;
  averageResponseTime: number;
  conversionRate: number;
  applicationsByOpportunity: Record<string, number>;
}

export const useRealApplications = () => {
  const { activeCompany } = useCompany();
  const [applications, setApplications] = useState<Application[]>([]);
  const [metrics, setMetrics] = useState<ApplicationMetrics>({
    totalApplications: 0,
    unreadApplications: 0,
    thisWeekApplications: 0,
    thisMonthApplications: 0,
    contactedCandidates: 0,
    candidatesInEvaluation: 0,
    averageResponseTime: 0,
    conversionRate: 0,
    applicationsByOpportunity: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!activeCompany?.id) {
      setMetrics({
        totalApplications: 0,
        unreadApplications: 0,
        thisWeekApplications: 0,
        thisMonthApplications: 0,
        contactedCandidates: 0,
        candidatesInEvaluation: 0,
        averageResponseTime: 0,
        conversionRate: 0,
        applicationsByOpportunity: {}
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Primero obtener los IDs de oportunidades de la empresa
      const { data: opportunityIds, error: opportunityError } = await supabase
        .from('opportunities')
        .select('id')
        .eq('company_id', activeCompany.id);

      if (opportunityError) {
        console.error('Error fetching opportunity IDs:', opportunityError);
        throw opportunityError;
      }

      const oppIds = opportunityIds?.map(opp => opp.id) || [];

      if (oppIds.length === 0) {
        setApplications([]);
        setMetrics({
          totalApplications: 0,
          unreadApplications: 0,
          thisWeekApplications: 0,
          thisMonthApplications: 0,
          contactedCandidates: 0,
          candidatesInEvaluation: 0,
          averageResponseTime: 0,
          conversionRate: 0,
          applicationsByOpportunity: {}
        });
        return;
      }

      // Obtener aplicaciones para esas oportunidades
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities (
            id,
            title,
            company_id
          )
        `)
        .in('opportunity_id', oppIds);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw applicationsError;
      }

      const apps = (applicationsData || []) as Application[];
      setApplications(apps);

      // Calcular métricas reales
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalApplications = apps.length;
      const unreadApplications = apps.filter(app => app.status === 'pending').length;
      const thisWeekApplications = apps.filter(app => 
        new Date(app.created_at) >= oneWeekAgo
      ).length;
      const thisMonthApplications = apps.filter(app => 
        new Date(app.created_at) >= firstDayOfMonth
      ).length;
      const contactedCandidates = apps.filter(app => 
        app.status === 'contacted' || app.status === 'interviewed'
      ).length;
      // Candidatos en evaluación: pending o reviewed (aún no contactados, aceptados o rechazados)
      const candidatesInEvaluation = apps.filter(app => 
        app.status === 'pending' || app.status === 'reviewed'
      ).length;
      
      // Calcular promedio de tiempo de respuesta (en horas)
      // Solo para aplicaciones que han sido contactadas o tienen un status diferente a pending
      const respondedApplications = apps.filter(app => 
        app.status !== 'pending' && app.updated_at && app.created_at
      );
      
      let averageResponseTime = 0;
      if (respondedApplications.length > 0) {
        const totalResponseTime = respondedApplications.reduce((sum, app) => {
          const created = new Date(app.created_at).getTime();
          const updated = new Date(app.updated_at).getTime();
          const responseTimeHours = (updated - created) / (1000 * 60 * 60); // Convertir a horas
          return sum + responseTimeHours;
        }, 0);
        averageResponseTime = Math.round((totalResponseTime / respondedApplications.length) * 10) / 10;
      }
      
      const conversionRate = totalApplications > 0 
        ? Math.round((contactedCandidates / totalApplications) * 100 * 10) / 10
        : 0;

      // Contar aplicaciones por oportunidad
      const applicationsByOpportunity: Record<string, number> = {};
      apps.forEach(app => {
        if (app.opportunity_id) {
          applicationsByOpportunity[app.opportunity_id] = 
            (applicationsByOpportunity[app.opportunity_id] || 0) + 1;
        }
      });

      setMetrics({
        totalApplications,
        unreadApplications,
        thisWeekApplications,
        thisMonthApplications,
        contactedCandidates,
        candidatesInEvaluation,
        averageResponseTime,
        conversionRate,
        applicationsByOpportunity
      });

    } catch (error) {
      console.error('Error in fetchApplications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCompany?.id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    metrics,
    isLoading,
    refreshApplications: fetchApplications
  };
};
