import { Phone, Lock, Crown, MessageCircle } from 'lucide-react';
import { useSecurePhone } from '@/hooks/useSecurePhone';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SecurePhoneDisplayProps {
  talentUserId: string;
  showReason?: boolean;
}

/**
 * Component to securely display a talent's phone number
 * Only shows the phone if the current user has meaningful interaction:
 * - Has received an application from this talent
 * - Has had message exchanges
 * - Has premium subscription
 */
export const SecurePhoneDisplay = ({ talentUserId, showReason = true }: SecurePhoneDisplayProps) => {
  const { phone, isLoading, error } = useSecurePhone(talentUserId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (error) {
    console.error('Error loading phone:', error);
    return null;
  }

  if (!phone) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span className="text-sm">Teléfono protegido</span>
        {showReason && (
          <Badge variant="outline" className="text-xs">
            <MessageCircle className="h-3 w-3 mr-1" />
            Contacta primero
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Phone className="h-4 w-4 text-primary" />
      <a 
        href={`tel:${phone}`} 
        className="text-sm font-medium hover:underline"
      >
        {phone}
      </a>
      {showReason && (
        <Badge variant="secondary" className="text-xs">
          <Crown className="h-3 w-3 mr-1" />
          Acceso autorizado
        </Badge>
      )}
    </div>
  );
};
