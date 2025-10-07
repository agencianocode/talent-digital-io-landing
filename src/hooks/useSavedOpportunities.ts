import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useSavedOpportunities = () => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved opportunities
  const loadSavedOpportunities = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSavedOpportunities([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const savedIds = data?.map(item => item.opportunity_id) || [];
      setSavedOpportunities(savedIds);
      setError(null);
    } catch (err) {
      console.error('Error loading saved opportunities:', err);
      setError(err instanceof Error ? err.message : 'Error loading saved opportunities');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Save opportunity
  const saveOpportunity = useCallback(async (opportunityId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to save opportunities');
    }

    if (savedOpportunities.includes(opportunityId)) {
      return; // Already saved
    }
    
    try {
      const { error } = await supabase
        .from('saved_opportunities')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
        });

      if (error) throw error;

      setSavedOpportunities(prev => [...prev, opportunityId]);
    } catch (err) {
      console.error('Error saving opportunity:', err);
      throw err;
    }
  }, [user, isAuthenticated, savedOpportunities]);

  // Unsave opportunity
  const unsaveOpportunity = useCallback(async (opportunityId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to unsave opportunities');
    }

    try {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId);

      if (error) throw error;

      setSavedOpportunities(prev => prev.filter(id => id !== opportunityId));
    } catch (err) {
      console.error('Error unsaving opportunity:', err);
      throw err;
    }
  }, [user, isAuthenticated]);

  // Check if opportunity is saved
  const isOpportunitySaved = useCallback((opportunityId: string) => {
    return savedOpportunities.includes(opportunityId);
  }, [savedOpportunities]);

  // Get saved opportunities with full data
  const getSavedOpportunitiesWithData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return [];
    }

    try {
      // First get saved opportunities
      const { data: savedData, error: savedError } = await supabase
        .from('saved_opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        return [];
      }

      // Then get full opportunity data
      const enrichedData = await Promise.all(
        savedData.map(async (savedItem) => {
          const { data: opportunityData, error: oppError } = await supabase
            .from('opportunities')
            .select(`
              *,
              companies (
                name,
                logo_url
              )
            `)
            .eq('id', savedItem.opportunity_id)
            .single();

          if (oppError) {
            console.error('Error fetching opportunity:', oppError);
            return null;
          }

          return {
            ...savedItem,
            opportunities: opportunityData
          };
        })
      );

      return enrichedData.filter(item => item !== null);
    } catch (err) {
      console.error('Error fetching saved opportunities with data:', err);
      return [];
    }
  }, [user, isAuthenticated]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadSavedOpportunities();
  }, [loadSavedOpportunities]);

  return {
    savedOpportunities,
    isLoading,
    error,
    saveOpportunity,
    unsaveOpportunity,
    isOpportunitySaved,
    getSavedOpportunitiesWithData,
    refreshSavedOpportunities: loadSavedOpportunities,
  };
};