import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, Calendar, Eye, EyeOff } from 'lucide-react';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface ApplicantCardData {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  internal_rating?: number | null;
  is_viewed?: boolean;
  viewed_at?: string | null;
  external_form_completed?: boolean | null;
  opportunity_id?: string;
  opportunity_title?: string;
  profile?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface ApplicantCardProps {
  application: ApplicantCardData;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onClick: (application: ApplicantCardData) => void;
  showOpportunity?: boolean;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' };
    case 'reviewed':
      return { label: 'Revisada', className: 'bg-blue-100 text-blue-800' };
    case 'accepted':
      return { label: 'Aceptada', className: 'bg-green-100 text-green-800' };
    case 'rejected':
      return { label: 'Rechazada', className: 'bg-red-100 text-red-800' };
    case 'hired':
      return { label: 'Contratado', className: 'bg-purple-100 text-purple-800' };
    case 'contacted':
      return { label: 'Contactado', className: 'bg-indigo-100 text-indigo-800' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-800' };
  }
};

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  application,
  isSelected,
  onSelect,
  onClick,
  showOpportunity = false,
}) => {
  const statusConfig = getStatusConfig(application.status);
  const name = application.profile?.full_name || 'Usuario';
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  const rating = application.internal_rating || 0;

  const handleCheckboxChange = (checked: boolean) => {
    onSelect(application.id, checked);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on checkbox
    if ((e.target as HTMLElement).closest('[data-checkbox]')) {
      return;
    }
    onClick(application);
  };

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md border",
        isSelected && "ring-2 ring-primary bg-primary/5",
        !application.is_viewed && "border-l-4 border-l-primary"
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div data-checkbox onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-5 w-5"
          />
        </div>

        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={application.profile?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {name}
            </h3>
            {!application.is_viewed && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                Nueva
              </Badge>
            )}
          </div>
          
          {showOpportunity && application.opportunity_title && (
            <p className="text-sm text-muted-foreground truncate">
              {application.opportunity_title}
            </p>
          )}
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Status Badge */}
        <Badge variant="secondary" className={cn("flex-shrink-0", statusConfig.className)}>
          {statusConfig.label}
        </Badge>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(application.created_at), 'dd MMM yyyy', { locale: es })}</span>
        </div>

        {/* Viewed indicator */}
        <div className="flex-shrink-0" title={application.is_viewed ? 'Vista' : 'No vista'}>
          {application.is_viewed ? (
            <Eye className="h-4 w-4 text-muted-foreground" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground/50" />
          )}
        </div>
      </div>
    </Card>
  );
};

export default ApplicantCard;
