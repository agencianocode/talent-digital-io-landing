import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  CheckCircle, 
  ThumbsUp, 
  ThumbsDown, 
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ApplicationRating {
  id: string;
  overallRating: number;
  criteriaRatings: Record<string, number>;
  comments: string;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  ratedBy: {
    name: string;
    avatar?: string;
  };
  ratedAt: string;
}

interface ApplicationRatingDisplayProps {
  ratings: ApplicationRating[];
  showHeader?: boolean;
}

const criteriaLabels: Record<string, string> = {
  experience: 'Experiencia Relevante',
  skills: 'Habilidades Técnicas',
  communication: 'Comunicación',
  cultural_fit: 'Ajuste Cultural',
  motivation: 'Motivación'
};

export const ApplicationRatingDisplay = ({ 
  ratings, 
  showHeader = true 
}: ApplicationRatingDisplayProps) => {
  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">
            Sin calificaciones
          </h3>
          <p className="text-sm text-gray-600">
            Esta postulación aún no ha sido calificada
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_hire':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hire':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_hire':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'strong_no_hire':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_hire':
        return <CheckCircle className="h-4 w-4" />;
      case 'hire':
        return <ThumbsUp className="h-4 w-4" />;
      case 'no_hire':
        return <ThumbsDown className="h-4 w-4" />;
      case 'strong_no_hire':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_hire':
        return 'Contratar Definitivamente';
      case 'hire':
        return 'Contratar';
      case 'no_hire':
        return 'No Contratar';
      case 'strong_no_hire':
        return 'Definitivamente No Contratar';
      default:
        return 'Pendiente';
    }
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.overallRating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const getConsensusRecommendation = () => {
    if (ratings.length === 0) return null;
    
    const recommendations = ratings.map(r => r.recommendation);
    const counts = recommendations.reduce((acc, rec) => {
      acc[rec] = (acc[rec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (counts[a[0]] || 0) > (counts[b[0]] || 0) ? a : b)[0];
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Calificaciones</h3>
            <p className="text-sm text-muted-foreground">
              {ratings.length} calificación{ratings.length !== 1 ? 'es' : ''}
            </p>
          </div>
          
          {ratings.length > 1 && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{calculateAverageRating()}/5</span>
              </div>
              <p className="text-xs text-muted-foreground">Promedio</p>
            </div>
          )}
        </div>
      )}

      {/* Consensus Recommendation */}
      {ratings.length > 1 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Consenso del Equipo</h4>
                <Badge className={`${getRecommendationColor(getConsensusRecommendation() || '')} border-0`}>
                  {getRecommendationIcon(getConsensusRecommendation() || '')}
                  <span className="ml-1">
                    {getRecommendationText(getConsensusRecommendation() || '')}
                  </span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Ratings */}
      <div className="space-y-4">
        {ratings.map((rating) => (
          <Card key={rating.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={rating.ratedBy.avatar} />
                    <AvatarFallback>
                      {rating.ratedBy.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{rating.ratedBy.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(rating.ratedAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{rating.overallRating}/5</span>
                  </div>
                  <Badge className={`${getRecommendationColor(rating.recommendation)} border-0`}>
                    {getRecommendationIcon(rating.recommendation)}
                    <span className="ml-1">
                      {getRecommendationText(rating.recommendation)}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Criteria Ratings */}
              <div className="mb-4">
                <h4 className="font-medium mb-3">Criterios Evaluados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(rating.criteriaRatings).map(([criteriaId, score]) => (
                    <div key={criteriaId} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {criteriaLabels[criteriaId] || criteriaId}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              className={`h-3 w-3 ${
                                value <= score
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium ml-2">{score}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              {rating.comments && (
                <div>
                  <h4 className="font-medium mb-2">Comentarios</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {rating.comments}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
