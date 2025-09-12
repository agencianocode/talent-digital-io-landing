import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, MapPin, Clock, User, Mail, Phone } from "lucide-react";

interface ApplicationCardProps {
  application: {
    id: string;
    user_id: string;
    status: string;
    created_at: string;
    cover_letter?: string;
    internal_rating?: number;
    contact_status?: string;
    viewed_at?: string;
    contacted_at?: string;
    // Profile data
    profile?: {
      full_name?: string;
      avatar_url?: string;
      city?: string;
      country?: string;
      phone?: string;
    };
    // Talent profile data
    talent_profile?: {
      title?: string;
      experience_level?: string;
      skills?: string[];
      bio?: string;
    };
  };
  onContact: (applicationId: string) => void;
  onDiscard: (applicationId: string) => void;
  onSave: (applicationId: string) => void;
  onRating: (applicationId: string, rating: number) => void;
  onViewProfile: (applicationId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-500';
    case 'viewed': return 'bg-yellow-500';
    case 'contacted': return 'bg-green-500';
    case 'hired': return 'bg-emerald-500';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'new': return 'Nueva';
    case 'viewed': return 'Vista';
    case 'contacted': return 'Contactado';
    case 'hired': return 'Contratado';
    case 'rejected': return 'Rechazado';
    default: return status;
  }
};

export const ApplicationCard = ({
  application,
  onContact,
  onDiscard,
  onSave,
  onRating,
  onViewProfile
}: ApplicationCardProps) => {
  const { profile, talent_profile } = application;

  const renderStars = () => {
    const rating = application.internal_rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 cursor-pointer transition-colors ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => onRating(application.id, star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-semibold">
              {profile?.full_name?.charAt(0) || <User className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {profile?.full_name || 'Usuario'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {talent_profile?.title || 'Sin título profesional'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(application.status)} text-white`}
            >
              {getStatusLabel(application.status)}
            </Badge>
            {renderStars()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {profile?.city && profile?.country 
                ? `${profile.city}, ${profile.country}`
                : 'Ubicación no especificada'
              }
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{talent_profile?.experience_level || 'No especificado'}</span>
          </div>
        </div>

        {talent_profile?.skills && talent_profile.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Skills principales:</h4>
            <div className="flex flex-wrap gap-1">
              {talent_profile.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {talent_profile.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{talent_profile.skills.length - 4} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {application.cover_letter && (
          <div>
            <h4 className="text-sm font-medium mb-2">Carta de presentación:</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {application.cover_letter}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={() => onViewProfile(application.id)}
            className="flex-1"
          >
            Ver Perfil
          </Button>
          {application.status === 'new' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onContact(application.id)}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-1" />
              Contactar
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onSave(application.id)}
          >
            Guardar
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onDiscard(application.id)}
          >
            Descartar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};