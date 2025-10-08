import { useState } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  reviewer_id: string;
  helpful_count: number | null;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ServiceReviewsProps {
  serviceId: string;
  canReview: boolean;
}

export const ServiceReviews = ({ serviceId, canReview }: ServiceReviewsProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as any || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una calificación',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { error } = await supabase.from('service_reviews').insert({
        service_id: serviceId,
        reviewer_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({
        title: '¡Reseña publicada!',
        description: 'Gracias por tu feedback',
      });

      setRating(0);
      setComment('');
      loadReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {canReview && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Deja tu reseña</h3>
          
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)"
            className="mb-4"
            rows={4}
          />

          <Button onClick={handleSubmitReview} disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar reseña'}
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">Reseñas ({reviews.length})</h3>
        
        {isLoading ? (
          <p className="text-muted-foreground">Cargando reseñas...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">Aún no hay reseñas para este servicio</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={review.profiles?.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">
                        {review.profiles?.full_name || 'Usuario'}
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-muted-foreground mb-3">{review.comment}</p>
                  )}

                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Útil ({review.helpful_count || 0})</span>
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
