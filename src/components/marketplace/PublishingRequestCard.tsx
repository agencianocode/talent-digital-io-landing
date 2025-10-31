import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Mail, Phone, Building2, DollarSign, X } from 'lucide-react';
import { ServicePublishingRequest } from '@/integrations/supabase/marketplace-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PublishingRequestCardProps {
  request: ServicePublishingRequest;
  onCancel?: (requestId: string) => void;
  isCanceling?: boolean;
}

const PublishingRequestCard: React.FC<PublishingRequestCardProps> = ({
  request,
  onCancel,
  isCanceling = false
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">🟡 Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">✅ Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">❌ Rechazada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{request.service_type}</CardTitle>
            {getStatusBadge(request.status)}
          </div>
          {request.status === 'pending' && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(request.id)}
              disabled={isCanceling}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{request.contact_email}</span>
          </div>
          {request.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{request.contact_phone}</span>
            </div>
          )}
          {request.company_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{request.company_name}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {request.description && (
          <div className="text-sm">
            <p className="text-muted-foreground line-clamp-2">{request.description}</p>
          </div>
        )}

        {/* Budget & Timeline */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {request.budget && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{request.budget}</span>
            </div>
          )}
          {request.timeline && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{request.timeline}</span>
            </div>
          )}
        </div>

        {/* Admin Notes (if rejected or approved) */}
        {request.admin_notes && request.status !== 'pending' && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-xs font-medium mb-1">Notas del administrador:</p>
            <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
          </div>
        )}

        {/* Date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Enviada el {format(new Date(request.created_at), "d 'de' MMMM, yyyy", { locale: es })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishingRequestCard;
