import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export interface ApplicationRating {
  id: string;
  application_id: string;
  rated_by_user_id: string;
  overall_rating: number;
  criteria_ratings: Record<string, number>;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  comments?: string;
  created_at: string;
  updated_at: string;
  rated_by?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateRatingData {
  application_id: string;
  overall_rating: number;
  criteria_ratings: Record<string, number>;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  comments?: string;
}

export const useApplicationRatings = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch ratings for a specific application
  const fetchApplicationRatings = useCallback(async (applicationId: string): Promise<ApplicationRating[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('application_ratings' as any)
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch rated_by user info separately
      const ratingsWithUsers = await Promise.all(
        (data || []).map(async (rating: any) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', rating.rated_by_user_id)
            .single();
          
          return {
            ...rating,
            rated_by: userData || { full_name: 'Usuario', avatar_url: null }
          };
        })
      );
      
      return ratingsWithUsers;
    } catch (error) {
      console.error('Error fetching application ratings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las calificaciones",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create a new rating
  const createRating = useCallback(async (ratingData: CreateRatingData): Promise<ApplicationRating | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para calificar",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('application_ratings' as any)
        .insert({
          application_id: ratingData.application_id,
          rated_by_user_id: user.id,
          overall_rating: ratingData.overall_rating,
          criteria_ratings: ratingData.criteria_ratings,
          recommendation: ratingData.recommendation,
          comments: ratingData.comments,
        })
        .select('*')
        .single();

      if (error) throw error;
      
      // Fetch user info
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      const ratingWithUser = {
        ...(data as any),
        rated_by: userData || { full_name: 'Usuario', avatar_url: null }
      };
      
      toast({
        title: "Éxito",
        description: "Calificación guardada correctamente",
      });
      
      return ratingWithUser;
    } catch (error) {
      console.error('Error creating rating:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Update an existing rating
  const updateRating = useCallback(async (ratingId: string, ratingData: Partial<CreateRatingData>): Promise<ApplicationRating | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para actualizar calificaciones",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('application_ratings' as any)
        .update({
          overall_rating: ratingData.overall_rating,
          criteria_ratings: ratingData.criteria_ratings,
          recommendation: ratingData.recommendation,
          comments: ratingData.comments,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ratingId)
        .eq('rated_by_user_id', user.id) // Ensure user can only update their own ratings
        .select('*')
        .single();

      if (error) throw error;
      
      // Fetch user info
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      const ratingWithUser = {
        ...(data as any),
        rated_by: userData || { full_name: 'Usuario', avatar_url: null }
      };
      
      toast({
        title: "Éxito",
        description: "Calificación actualizada correctamente",
      });
      
      return ratingWithUser;
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la calificación",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Delete a rating
  const deleteRating = useCallback(async (ratingId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar calificaciones",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('application_ratings' as any)
        .delete()
        .eq('id', ratingId)
        .eq('rated_by_user_id', user.id); // Ensure user can only delete their own ratings

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Calificación eliminada correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la calificación",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Check if user has already rated an application
  const hasUserRated = useCallback(async (applicationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('application_ratings' as any)
        .select('id')
        .eq('application_id', applicationId)
        .eq('rated_by_user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking if user has rated:', error);
      return false;
    }
  }, [user]);

  // Get rating statistics for an application
  const getRatingStats = useCallback(async (applicationId: string) => {
    try {
      const { data, error } = await supabase
        .from('application_ratings' as any)
        .select('overall_rating, recommendation')
        .eq('application_id', applicationId);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          recommendations: {
            strong_hire: 0,
            hire: 0,
            no_hire: 0,
            strong_no_hire: 0
          }
        };
      }

      const averageRating = (data as any[]).reduce((sum, rating) => sum + rating.overall_rating, 0) / data.length;
      const recommendations = (data as any[]).reduce((acc, rating) => {
        acc[rating.recommendation] = (acc[rating.recommendation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: data.length,
        recommendations
      };
    } catch (error) {
      console.error('Error getting rating stats:', error);
      return {
        averageRating: 0,
        totalRatings: 0,
        recommendations: {
          strong_hire: 0,
          hire: 0,
          no_hire: 0,
          strong_no_hire: 0
        }
      };
    }
  }, []);

  return {
    isLoading,
    fetchApplicationRatings,
    createRating,
    updateRating,
    deleteRating,
    hasUserRated,
    getRatingStats,
  };
};
