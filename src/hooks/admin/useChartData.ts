import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChartData {
  date: string;
  users: number;
  companies: number;
  opportunities: number;
  applications: number;
  activeUsers: number;
}

export const useChartData = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Load all data in parallel
      const [usersResult, companiesResult, opportunitiesResult, applicationsResult, activeUsersResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('companies')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('opportunities')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('applications')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('profiles')
          .select('updated_at')
          .gte('updated_at', startDate.toISOString())
          .lte('updated_at', endDate.toISOString())
      ]);

      if (usersResult.error) throw usersResult.error;
      if (companiesResult.error) throw companiesResult.error;
      if (opportunitiesResult.error) throw opportunitiesResult.error;
      if (applicationsResult.error) throw applicationsResult.error;
      if (activeUsersResult.error) throw activeUsersResult.error;

      // Group data by date
      const dataByDate: ChartData[] = [];
      const today = new Date();

      // Helper to format date as YYYY-MM-DD in local timezone
      const formatLocalDate = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatLocalDate(date);
        
        if (!dateStr) continue;

        const users = usersResult.data?.filter(u => u.created_at?.startsWith(dateStr)).length || 0;
        const companies = companiesResult.data?.filter(c => c.created_at?.startsWith(dateStr)).length || 0;
        const opportunities = opportunitiesResult.data?.filter(o => o.created_at?.startsWith(dateStr)).length || 0;
        const applications = applicationsResult.data?.filter(a => a.created_at?.startsWith(dateStr)).length || 0;
        const activeUsers = activeUsersResult.data?.filter(u => u.updated_at?.startsWith(dateStr)).length || 0;

        dataByDate.push({
          date: dateStr,
          users,
          companies,
          opportunities,
          applications,
          activeUsers
        });
      }

      setChartData(dataByDate);

    } catch (err) {
      console.error('Error loading chart data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  return { chartData, isLoading, error, refetch: loadChartData };
};
