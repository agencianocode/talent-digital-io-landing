import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { TalentPublishingRequest } from '@/hooks/useTalentPublishingRequests';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TalentPublishingRequestCardProps {
  request: TalentPublishingRequest;
  onCancel: (id: string) => void;
}

const TalentPublishingRequestCard: React.FC<TalentPublishingRequestCardProps> = ({
  request,
  onCancel
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Pendiente',
          badgeVariant: 'default' as const
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Aprobada',
          badgeVariant: 'default' as const
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rechazada',
          badgeVariant: 'destructive' as const
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Desconocido',
          badgeVariant: 'secondary' as const
        };
    }
  };

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{request.service_type}</h3>
              <Badge variant={statusConfig.badgeVariant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Empresa: {request.company_name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Enviada el {format(new Date(request.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          {request.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(request.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Descripción:</h4>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>

        {request.budget && (
          <div>
            <h4 className="text-sm font-medium mb-1">Presupuesto:</h4>
            <p className="text-sm text-muted-foreground">{request.budget}</p>
          </div>
        )}

        {request.timeline && (
          <div>
            <h4 className="text-sm font-medium mb-1">Tiempo estimado:</h4>
            <p className="text-sm text-muted-foreground">{request.timeline}</p>
          </div>
        )}

        {request.requirements && (
          <div>
            <h4 className="text-sm font-medium mb-1">Requisitos:</h4>
            <p className="text-sm text-muted-foreground">{request.requirements}</p>
          </div>
        )}

        {request.admin_notes && (
          <div className={`p-3 rounded-lg border ${statusConfig.color}`}>
            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
              <StatusIcon className="h-4 w-4" />
              Notas del administrador:
            </h4>
            <p className="text-sm">{request.admin_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TalentPublishingRequestCard;
