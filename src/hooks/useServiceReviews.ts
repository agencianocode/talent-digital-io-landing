import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  service_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  helpful_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ServiceStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export const useServiceReviews = (serviceId: string) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ServiceStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reseñas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviewsData.forEach((review) => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      totalRating += review.rating;
    });

    setStats({
      averageRating: reviewsData.length > 0 ? totalRating / reviewsData.length : 0,
      totalReviews: reviewsData.length,
      ratingDistribution: distribution,
    });
  };

  const loadUserReview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('service_reviews')
        .select('*')
        .eq('service_id', serviceId)
        .eq('reviewer_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setUserReview(data);
    } catch (error) {
      console.error('Error loading user review:', error);
    }
  };

  const createReview = async (rating: number, comment: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('service_reviews')
        .insert({
          service_id: serviceId,
          reviewer_id: user.id,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '¡Reseña publicada!',
        description: 'Gracias por tu feedback',
      });

      setUserReview(data);
      await loadReviews();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment: string | null) => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .update({ rating, comment })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Reseña actualizada',
        description: 'Tu reseña ha sido actualizada',
      });

      setUserReview(data);
      await loadReviews();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: 'Reseña eliminada',
        description: 'Tu reseña ha sido eliminada',
      });

      setUserReview(null);
      await loadReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    loadReviews();
    loadUserReview();
  }, [serviceId]);

  return {
    reviews,
    stats,
    isLoading,
    userReview,
    createReview,
    updateReview,
    deleteReview,
    refreshReviews: loadReviews,
  };
};
