import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Eye, MessageSquare, Clock } from 'lucide-react';
import { stripHtml } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TalentCardAcademyBadge } from './TalentCardAcademyBadge';

export interface UnifiedTalentCardProps {
  // Datos básicos del talento
  userId: string;
  fullName: string;
  title: string;
  avatarUrl?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string;
  skills?: string[];
  
  // Estado del perfil
  lastActive?: string | null;
  userEmail?: string; // Para mostrar badge de academia
  isProfileIncomplete?: boolean; // Para mostrar badge de perfil incompleto
  
  // Acciones
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  secondaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  
  // Opciones de visualización
  showBio?: boolean;
  maxSkills?: number;
  className?: string;
}

export const UnifiedTalentCard: React.FC<UnifiedTalentCardProps> = ({
  userId,
  fullName,
  title,
  avatarUrl,
  location,
  city,
  country,
  bio,
  skills = [],
  lastActive,
  userEmail,
  isProfileIncomplete = false,
  primaryAction,
  secondaryAction,
  showBio = true,
  maxSkills = 3,
  className = ''
}) => {
  const navigate = useNavigate();

  // Construir ubicación
  const displayLocation = location || [city, country].filter(Boolean).join(', ') || 'Ubicación no especificada';
  
  // Obtener iniciales para avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Acción por defecto: navegar al perfil
  const handleCardClick = () => {
    navigate(`/business-dashboard/talent-profile/${userId}`);
  };

  // Skills a mostrar
  const visibleSkills = skills.slice(0, maxSkills);
  const remainingSkills = skills.length - maxSkills;

  // Limpiar HTML y truncar bio a 120 caracteres para mantener altura consistente
  const cleanBio = bio ? stripHtml(bio) : '';
  const truncatedBio = cleanBio && cleanBio.length > 120 ? `${cleanBio.substring(0, 120)}...` : cleanBio;

  return (
    <Card className={`h-full flex flex-col hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        {/* Header: Avatar, Nombre, Ubicación y Badge */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar Container - Con badge de academia posicionado */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
              <AvatarImage src={avatarUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-sm">{getInitials(fullName)}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Badge de perfil incompleto */}
            {isProfileIncomplete && (
              <Badge variant="outline" className="text-xs mb-1 border-amber-400 text-amber-600 bg-amber-50">
                Perfil incompleto
              </Badge>
            )}
            <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
              {fullName}
            </h3>
            <p className="text-sm text-muted-foreground truncate mb-1">
              {title}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
            
            {/* Academy Badge - integrado en el flujo */}
            {userEmail && (
              <TalentCardAcademyBadge 
                userId={userId}
                userEmail={userEmail}
                compact={true}
              />
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {visibleSkills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs max-w-[150px] truncate"
                title={skill}
              >
                {skill.length > 25 ? `${skill.substring(0, 25)}...` : skill}
              </Badge>
            ))}
            {remainingSkills > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{remainingSkills}
              </Badge>
            )}
          </div>
        )}

        {/* Bio */}
        {showBio && truncatedBio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {truncatedBio}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-4">
          {primaryAction ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              variant={primaryAction.variant || 'default'}
              size="sm"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              {primaryAction.label}
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Perfil
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                secondaryAction.onClick();
              }}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {secondaryAction.icon || <MessageSquare className="h-4 w-4 mr-2" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>

        {/* Last Active */}
        {lastActive && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 pt-3 border-t">
            <Clock className="h-3 w-3" />
            <span>
              Activo {formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: es })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedTalentCard;

