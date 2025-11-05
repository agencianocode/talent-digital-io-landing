import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AcademyCertification {
  academy_id: string;
  academy_name: string;
  certification_date: string;
  program: string;
  badge_color: string;
}

interface AcademyCertificationBadgeProps {
  certification: AcademyCertification;
  size?: 'sm' | 'md' | 'lg';
  showProgram?: boolean;
}

export const AcademyCertificationBadge = ({ 
  certification, 
  size = 'md',
  showProgram = false 
}: AcademyCertificationBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="flex flex-col gap-1">
      <Badge 
        className={cn(
          'flex items-center gap-1.5 w-fit font-medium whitespace-nowrap',
          sizeClasses[size]
        )}
        style={{
          backgroundColor: '#f6efff',
          color: certification.badge_color || '#7c3aed',
          borderColor: certification.badge_color || '#e9d5ff',
        }}
      >
        <GraduationCap className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />
        {certification.academy_name}
      </Badge>
      {showProgram && certification.program && (
        <span className="text-xs text-muted-foreground ml-1">
          {certification.program}
        </span>
      )}
    </div>
  );
};

interface AcademyCertificationListProps {
  certifications: AcademyCertification[];
  maxDisplay?: number;
}

export const AcademyCertificationList = ({ 
  certifications, 
  maxDisplay = 3 
}: AcademyCertificationListProps) => {
  if (!certifications || certifications.length === 0) return null;

  const displayCerts = certifications.slice(0, maxDisplay);
  const remaining = certifications.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2">
      {displayCerts.map((cert, index) => (
        <AcademyCertificationBadge 
          key={`${cert.academy_id}-${index}`} 
          certification={cert}
          showProgram={true}
        />
      ))}
      {remaining > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remaining} más
        </Badge>
      )}
    </div>
  );
};
