import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
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
}

interface ActivityItem {
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

interface ChartData {
  date: string;
  users: number;
  companies: number;
  opportunities: number;
  applications: number;
}

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalOpportunities: 0,
    activeOpportunities: 0,
    pausedOpportunities: 0,
    closedOpportunities: 0,
    totalServices: 0,
    activeServices: 0,
    usersByRole: {},
    recentActivity: 0
  });
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load real user stats using get-all-users Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      let totalUsers = 0;
      let usersByRole: Record<string, number> = {};

      if (session) {
        try {
          const { data, error } = await supabase.functions.invoke('get-all-users', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });

          if (!error && data?.users) {
            const users = data.users;
            totalUsers = users.length;
            const counts = users.reduce((acc: Record<string, number>, u: any) => {
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
        } catch (e) {
          console.error('Error calling get-all-users:', e);
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

      // Load service stats (temporary fix - table might not exist yet)
      let services: any[] = [];
      try {
        const { data: serviceData, error: serviceError } = await supabase
          .from('talent_services' as any)
          .select('is_available');
        
        if (!serviceError) {
          services = serviceData || [];
        }
      } catch (err) {
        console.log('talent_services table not found, using empty array');
        services = [];
      }

      // Process opportunity stats
      const activeOpportunities = opportunities?.filter(o => o.is_active && o.status === 'active').length || 0;
      const pausedOpportunities = opportunities?.filter(o => o.status === 'paused').length || 0;
      const closedOpportunities = opportunities?.filter(o => o.status === 'closed').length || 0;
      const totalOpportunities = opportunities?.length || 0;

      // Process service stats
      const activeServices = services.filter((s: any) => s.is_available).length;
      const totalServices = services.length;


      // Calculate recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentActivity, error: activityError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      if (activityError) throw activityError;

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
        recentActivity: recentActivity || 0
      });

    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
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

      // Combine and format activities
      const activities: ActivityItem[] = [];

      // Add user registrations
      recentUsers?.forEach(user => {
        activities.push({
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
        activities.push({
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
        activities.push({
          id: `opportunity-${opportunity.id}`,
          type: 'opportunity_published',
          title: 'Nueva oportunidad publicada',
          description: `Se publicó la oportunidad: ${opportunity.title}`,
          opportunity_title: opportunity.title,
          created_at: opportunity.created_at
        });
      });

      // Sort by date and take the most recent
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(activities.slice(0, 20));

    } catch (err) {
      console.error('Error loading recent activities:', err);
    }
  };

  const loadChartData = async () => {
    try {
      // Optimize by loading all data at once and grouping
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Load all profiles
      const { data: allUsers, error: userError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (userError) throw userError;

      // Load all companies
      const { data: allCompanies, error: companyError } = await supabase
        .from('companies')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (companyError) throw companyError;

      // Load all opportunities
      const { data: allOpportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (oppError) throw oppError;

      // Load all applications
      const { data: allApplications, error: appError } = await supabase
        .from('applications')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (appError) throw appError;

      // Group data by date
      const chartData: ChartData[] = [];
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!dateStr) continue;

        const users = allUsers?.filter(u => u.created_at?.startsWith(dateStr)).length || 0;
        const companies = allCompanies?.filter(c => c.created_at?.startsWith(dateStr)).length || 0;
        const opportunities = allOpportunities?.filter(o => o.created_at?.startsWith(dateStr)).length || 0;
        const applications = allApplications?.filter(a => a.created_at?.startsWith(dateStr)).length || 0;

        chartData.push({
          date: dateStr,
          users,
          companies,
          opportunities,
          applications
        });
      }

      setChartData(chartData);

    } catch (err) {
      console.error('Error loading chart data:', err);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadAdminStats(),
        loadRecentActivities(),
        loadChartData()
      ]);
    };

    loadAllData();
  }, []);

  return {
    stats,
    activities,
    chartData,
    isLoading,
    error,
    refetch: () => {
      loadAdminStats();
      loadRecentActivities();
      loadChartData();
    }
  };
};
