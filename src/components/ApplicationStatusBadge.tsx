import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ApplicationStatusBadgeProps {
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendiente',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
        };
      case 'reviewed':
        return {
          label: 'En Revisión',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        };
      case 'accepted':
        return {
          label: 'Aceptada',
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-100'
        };
      case 'rejected':
        return {
          label: 'Rechazada',
          variant: 'secondary' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-100'
        };
      default:
        return {
          label: 'Desconocido',
          variant: 'outline' as const,
          className: ''
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export default ApplicationStatusBadge;