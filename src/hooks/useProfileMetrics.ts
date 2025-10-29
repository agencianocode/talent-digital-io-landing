import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useProfileMetrics = () => {
  const { user } = useSupabaseAuth();
  const [views, setViews] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);

        // Fetch profile views count
        const { count: viewsCount, error: viewsError } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_user_id', user.id);

        if (viewsError) throw viewsError;

        // Fetch saved/favorites count
        const { count: savedCountResult, error: savedError } = await supabase
          .from('saved_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('profile_user_id', user.id);

        if (savedError) throw savedError;

        setViews(viewsCount || 0);
        setSavedCount(savedCountResult || 0);
      } catch (error) {
        console.error('Error fetching profile metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user?.id]);

  return {
    views,
    savedCount,
    loading
  };
};
