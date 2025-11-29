import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityItem {
  id: string;
  type: 'user_registered' | 'company_created' | 'opportunity_published' | 'service_published' | 'application_submitted' | 'user_upgraded';
  title: string;
  description: string;
  user_name?: string;
  company_name?: string;
  opportunity_title?: string;
  service_title?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export const useRecentActivities = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load recent user registrations
      const { data: recentUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (userError) throw userError;

      // Load recent companies
      const { data: recentCompanies, error: companyError } = await supabase
        .from('companies')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (companyError) throw companyError;

      // Load recent opportunities
      const { data: recentOpportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (oppError) throw oppError;

      const activitiesList: ActivityItem[] = [];

      // Add user registrations
      recentUsers?.forEach(user => {
        activitiesList.push({
          id: `user-${user.id}`,
          type: 'user_registered',
          title: 'Nuevo usuario registrado',
          description: `${user.full_name || 'Usuario'} se registró en la plataforma`,
          user_name: user.full_name || undefined,
          created_at: user.created_at
        });
      });

      // Add company creations
      recentCompanies?.forEach(company => {
        activitiesList.push({
          id: `company-${company.id}`,
          type: 'company_created',
          title: 'Nueva empresa registrada',
          description: `${company.name} se registró en la plataforma`,
          company_name: company.name,
          created_at: company.created_at
        });
      });

      // Add opportunity publications
      recentOpportunities?.forEach(opportunity => {
        activitiesList.push({
          id: `opportunity-${opportunity.id}`,
          type: 'opportunity_published',
          title: 'Nueva oportunidad publicada',
          description: `Se publicó la oportunidad: ${opportunity.title}`,
          opportunity_title: opportunity.title,
          created_at: opportunity.created_at
        });
      });

      // Sort by date and take the most recent
      activitiesList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(activitiesList.slice(0, 20));

    } catch (err) {
      console.error('Error loading recent activities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return { activities, isLoading, error, refetch: loadActivities };
};
