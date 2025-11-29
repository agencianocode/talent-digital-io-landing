import { useAdminStats } from './admin/useAdminStats';
import { useRecentActivities } from './admin/useRecentActivities';
import { useChartData } from './admin/useChartData';

export const useAdminData = () => {
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const { activities, isLoading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useRecentActivities();
  const { chartData, isLoading: chartLoading, error: chartError, refetch: refetchChart } = useChartData();

  const isLoading = statsLoading || activitiesLoading || chartLoading;
  const error = statsError || activitiesError || chartError;

  const refetch = () => {
    refetchStats();
    refetchActivities();
    refetchChart();
  };

  return {
    stats,
    activities,
    chartData,
    isLoading,
    error,
    refetch
  };
};
