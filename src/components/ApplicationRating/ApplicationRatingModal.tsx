import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  CheckCircle,
  Clock,
  User,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface RatingCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // 1-5, where 5 is most important
}

interface ApplicationRating {
  overallRating: number;
  criteriaRatings: Record<string, number>;
  comments: string;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
}

interface ApplicationRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    applicantName: string;
    applicantEmail: string;
    appliedAt: string;
    message: string;
    resume?: string;
    profiles?: {
      full_name: string;
      avatar_url?: string;
    };
    talent_profiles?: {
      title?: string;
      bio?: string;
      skills?: string[];
      years_experience?: number;
    };
  };
  onSaveRating: (rating: ApplicationRating) => Promise<void>;
}

const defaultCriteria: RatingCriteria[] = [
  {
    id: 'experience',
    name: 'Experiencia Relevante',
    description: 'Años y calidad de experiencia en el campo',
    weight: 5
  },
  {
    id: 'skills',
    name: 'Habilidades Técnicas',
    description: 'Dominio de las habilidades requeridas',
    weight: 5
  },
  {
    id: 'communication',
    name: 'Comunicación',
    description: 'Claridad y profesionalismo en la comunicación',
    weight: 4
  },
  {
    id: 'cultural_fit',
    name: 'Ajuste Cultural',
    description: 'Compatibilidad con la cultura de la empresa',
    weight: 3
  },
  {
    id: 'motivation',
    name: 'Motivación',
    description: 'Interés genuino en la posición y la empresa',
    weight: 4
  }
];

export const ApplicationRatingModal = ({
  isOpen,
  onClose,
  application,
  onSaveRating
}: ApplicationRatingModalProps) => {
  const [rating, setRating] = useState<ApplicationRating>({
    overallRating: 0,
    criteriaRatings: {},
    comments: '',
    recommendation: 'hire'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCriteriaRating = (criteriaId: string, value: number) => {
    setRating(prev => ({
      ...prev,
      criteriaRatings: {
        ...prev.criteriaRatings,
        [criteriaId]: value
      }
    }));
  };

  const calculateOverallRating = () => {
    const criteriaRatings = Object.values(rating.criteriaRatings);
    if (criteriaRatings.length === 0) return 0;
    
    const totalWeight = defaultCriteria.reduce((sum, criteria) => sum + criteria.weight, 0);
    const weightedSum = defaultCriteria.reduce((sum, criteria) => {
      const criteriaRating = rating.criteriaRatings[criteria.id] || 0;
      return sum + (criteriaRating * criteria.weight);
    }, 0);
    
    return Math.round(weightedSum / totalWeight);
  };

  const handleSave = async () => {
    if (Object.keys(rating.criteriaRatings).length === 0) {
      toast.error('Por favor califica al menos un criterio');
      return;
    }

    setIsSaving(true);
    try {
      const finalRating = {
        ...rating,
        overallRating: calculateOverallRating()
      };
      
      await onSaveRating(finalRating);
      toast.success('Calificación guardada exitosamente');
      onClose();
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Error al guardar la calificación');
    } finally {
      setIsSaving(false);
    }
  };

  // const getRecommendationColor = (recommendation: string) => {
  //   switch (recommendation) {
  //     case 'strong_hire':
  //       return 'bg-green-100 text-green-800 border-green-200';
  //     case 'hire':
  //       return 'bg-blue-100 text-blue-800 border-blue-200';
  //     case 'no_hire':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'strong_no_hire':
  //       return 'bg-red-100 text-red-800 border-red-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  // const getRecommendationIcon = (recommendation: string) => {
  //   switch (recommendation) {
  //     case 'strong_hire':
  //       return <CheckCircle className="h-4 w-4" />;
  //     case 'hire':
  //       return <ThumbsUp className="h-4 w-4" />;
  //     case 'no_hire':
  //       return <ThumbsDown className="h-4 w-4" />;
  //     case 'strong_no_hire':
  //       return <XCircle className="h-4 w-4" />;
  //     default:
  //       return <Clock className="h-4 w-4" />;
  //   }
  // };

  // const getRecommendationText = (recommendation: string) => {
  //   switch (recommendation) {
  //     case 'strong_hire':
  //       return 'Contratar Definitivamente';
  //     case 'hire':
  //       return 'Contratar';
  //     case 'no_hire':
  //       return 'No Contratar';
  //     case 'strong_no_hire':
  //       return 'Definitivamente No Contratar';
  //     default:
  //       return 'Pendiente';
  //   }
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Calificar Postulación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={application.profiles?.avatar_url} />
                  <AvatarFallback>
                    {application.applicantName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{application.applicantName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {application.applicantEmail}
                  </p>
                  
                  {application.talent_profiles?.title && (
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.talent_profiles.title}</span>
                    </div>
                  )}
                  
                  {application.talent_profiles?.years_experience && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {application.talent_profiles.years_experience} años de experiencia
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Postuló el {new Date(application.appliedAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
              
              {application.talent_profiles?.bio && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Biografía</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.talent_profiles.bio}
                  </p>
                </div>
              )}
              
              {application.talent_profiles?.skills && application.talent_profiles.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Habilidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.talent_profiles.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {application.message && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Mensaje de Postulación</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {application.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Criteria */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Criterios de Evaluación</h3>
            <div className="space-y-4">
              {defaultCriteria.map((criteria) => (
                <Card key={criteria.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{criteria.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {criteria.description}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          Peso: {criteria.weight}/5
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleCriteriaRating(criteria.id, value)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                            rating.criteriaRatings[criteria.id] === value
                              ? 'border-yellow-400 bg-yellow-100 text-yellow-600'
                              : 'border-gray-300 hover:border-yellow-300'
                          }`}
                        >
                          <Star className={`h-4 w-4 ${
                            rating.criteriaRatings[criteria.id] === value ? 'fill-current' : ''
                          }`} />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Overall Rating */}
          {Object.keys(rating.criteriaRatings).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Calificación General</h4>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-6 w-6 ${
                          value <= calculateOverallRating()
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-lg">
                    {calculateOverallRating()}/5
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendation */}
          <div>
            <Label htmlFor="recommendation" className="text-base font-medium">
              Recomendación Final
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {[
                { value: 'strong_hire', label: 'Contratar Definitivamente', color: 'green' },
                { value: 'hire', label: 'Contratar', color: 'blue' },
                { value: 'no_hire', label: 'No Contratar', color: 'yellow' },
                { value: 'strong_no_hire', label: 'Definitivamente No Contratar', color: 'red' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRating(prev => ({ ...prev, recommendation: option.value as any }))}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    rating.recommendation === option.value
                      ? `border-${option.color}-400 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments" className="text-base font-medium">
              Comentarios Adicionales
            </Label>
            <Textarea
              id="comments"
              placeholder="Agrega comentarios sobre la postulación, fortalezas, áreas de mejora, etc."
              value={rating.comments}
              onChange={(e) => setRating(prev => ({ ...prev, comments: e.target.value }))}
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || Object.keys(rating.criteriaRatings).length === 0}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar Calificación
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
