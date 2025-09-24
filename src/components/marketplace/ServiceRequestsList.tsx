import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { ServiceRequest } from '@/hooks/useTalentServices';
import { useToast } from '@/hooks/use-toast';

interface ServiceRequestsListProps {
  requests: ServiceRequest[];
  onUpdateStatus: (requestId: string, status: ServiceRequest['status']) => Promise<boolean>;
  isUpdating?: boolean;
}

const ServiceRequestsList: React.FC<ServiceRequestsListProps> = ({
  requests,
  onUpdateStatus,
  isUpdating = false
}) => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pendiente', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock
        };
      case 'accepted':
        return { 
          label: 'Aceptado', 
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'declined':
        return { 
          label: 'Rechazado', 
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      case 'completed':
        return { 
          label: 'Completado', 
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle
        };
      default:
        return { 
          label: 'Desconocido', 
          color: 'bg-gray-100 text-gray-800',
          icon: Clock
        };
    }
  };

  const getBudgetLabel = (budgetRange: string) => {
    switch (budgetRange) {
      case 'exact':
        return 'Presupuesto exacto';
      case 'flexible':
        return 'Presupuesto flexible';
      case 'negotiable':
        return 'Presupuesto negociable';
      case 'custom':
        return 'Presupuesto personalizado';
      default:
        return budgetRange;
    }
  };

  const getTimelineLabel = (timeline: string) => {
    switch (timeline) {
      case 'urgent':
        return 'Urgente (1-3 días)';
      case 'fast':
        return 'Rápido (1 semana)';
      case 'normal':
        return 'Normal (2-4 semanas)';
      case 'flexible':
        return 'Flexible (1-3 meses)';
      default:
        return timeline;
    }
  };

  const getProjectTypeLabel = (projectType: string) => {
    switch (projectType) {
      case 'one-time':
        return 'Proyecto único';
      case 'ongoing':
        return 'Trabajo continuo';
      case 'consultation':
        return 'Consultoría';
      case 'partnership':
        return 'Colaboración';
      default:
        return projectType;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (requestId: string, status: ServiceRequest['status']) => {
    const success = await onUpdateStatus(requestId, status);
    if (success) {
      toast({
        title: "Estado actualizado",
        description: `La solicitud ha sido ${status === 'accepted' ? 'aceptada' : status === 'declined' ? 'rechazada' : 'marcada como completada'}.`,
      });
      setIsDetailModalOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
          <p className="text-muted-foreground text-center">
            Cuando los clientes soliciten tus servicios, aparecerán aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const statusInfo = getStatusInfo(request.status);
        const StatusIcon = statusInfo.icon;

        return (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {getInitials(request.requester_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{request.requester_name}</h3>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    {request.company_name && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Building className="h-4 w-4" />
                        <span>{request.company_name}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {request.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{getBudgetLabel(request.budget_range)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getTimelineLabel(request.timeline)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'accepted')}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aceptar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'declined')}
                        disabled={isUpdating}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitud de Servicio</DialogTitle>
            <DialogDescription>
              Detalles completos de la solicitud
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Requester Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedRequest.requester_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    {selectedRequest.requester_name}
                  </h3>
                  {selectedRequest.company_name && (
                    <div className="flex items-center gap-1 text-muted-foreground mb-2">
                      <Building className="h-4 w-4" />
                      <span>{selectedRequest.company_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{selectedRequest.requester_email}</span>
                    </div>
                    {selectedRequest.requester_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{selectedRequest.requester_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={getStatusInfo(selectedRequest.status).color}>
                  {getStatusInfo(selectedRequest.status).label}
                </Badge>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Presupuesto</Label>
                  <p className="text-sm">{getBudgetLabel(selectedRequest.budget_range)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timeline</Label>
                  <p className="text-sm">{getTimelineLabel(selectedRequest.timeline)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de Proyecto</Label>
                  <p className="text-sm">{getProjectTypeLabel(selectedRequest.project_type)}</p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mensaje</Label>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha de Solicitud</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedRequest.created_at)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Cerrar
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'declined')}
                  disabled={isUpdating}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'accepted')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceptar Solicitud
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequestsList;
