import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalOpportunities: number;
  activeOpportunities: number;
  pausedOpportunities: number;
  closedOpportunities: number;
  totalServices: number;
  activeServices: number;
  usersByRole: Record<string, number>;
  recentActivity: number;
  activeUsers30Days: number;
  activeUsers90Days: number;
  deletedUsers30Days: number;
}

const DEFAULT_STATS: AdminStats = {
  totalUsers: 0,
  totalCompanies: 0,
  totalOpportunities: 0,
  activeOpportunities: 0,
  pausedOpportunities: 0,
  closedOpportunities: 0,
  totalServices: 0,
  activeServices: 0,
  usersByRole: {},
  recentActivity: 0,
  activeUsers30Days: 0,
  activeUsers90Days: 0,
  deletedUsers30Days: 0
};

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user stats
      const { data: { session } } = await supabase.auth.getSession();
      let totalUsers = 0;
      let usersByRole: Record<string, number> = {};

      if (session) {
        const { data, error: usersError } = await supabase.functions.invoke('get-all-users', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (!usersError && data?.users) {
          totalUsers = data.users.length;
          const counts = data.users.reduce((acc: Record<string, number>, u: any) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
          }, {});

          usersByRole = {
            admin: 0,
            premium_business: 0,
            freemium_business: 0,
            business: 0,
            premium_talent: 0,
            talent: 0,
            ...counts
          };
        }
      }

      // Load company stats
      const { count: companyCount, error: companyError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      if (companyError) throw companyError;

      // Load opportunity stats
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('is_active, status');

      if (oppError) throw oppError;

      // Load service stats from correct table
      const { data: services } = await supabase
        .from('marketplace_services')
        .select('is_available');

      const activeOpportunities = opportunities?.filter(o => o.is_active && o.status === 'active').length || 0;
      const pausedOpportunities = opportunities?.filter(o => o.status === 'paused').length || 0;
      const closedOpportunities = opportunities?.filter(o => o.status === 'closed').length || 0;
      const totalOpportunities = opportunities?.length || 0;

      const activeServices = services?.filter(s => s.is_available).length || 0;
      const totalServices = services?.length || 0;

      // Calculate recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentActivity, error: activityError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      if (activityError) throw activityError;

      // Calculate active users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers30 } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Calculate active users in last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { count: activeUsers90 } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', ninetyDaysAgo.toISOString());

      setStats({
        totalUsers,
        totalCompanies: companyCount || 0,
        totalOpportunities,
        activeOpportunities,
        pausedOpportunities,
        closedOpportunities,
        totalServices,
        activeServices,
        usersByRole,
        recentActivity: recentActivity || 0,
        activeUsers30Days: activeUsers30 || 0,
        activeUsers90Days: activeUsers90 || 0,
        deletedUsers30Days: 0 // Would need audit table to track this
      });

    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, isLoading, error, refetch: loadStats };
};
