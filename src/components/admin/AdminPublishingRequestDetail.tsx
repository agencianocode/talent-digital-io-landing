import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Mail, Phone, Building2, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { PublishingRequest } from '@/hooks/usePublishingRequests';

interface AdminPublishingRequestDetailProps {
  request: PublishingRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (requestId: string, notes?: string) => void;
  onReject: (requestId: string, notes?: string) => void;
  onCreateService?: (requestId: string) => void;
}

export const AdminPublishingRequestDetail: React.FC<AdminPublishingRequestDetailProps> = ({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onCreateService,
}) => {
  const [adminNotes, setAdminNotes] = useState('');

  if (!request) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-600/20">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600/20">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-600/20">Rechazada</Badge>;
      default:
        return null;
    }
  };

  const handleApprove = () => {
    onApprove(request.id, adminNotes);
    onOpenChange(false);
    setAdminNotes('');
  };

  const handleReject = () => {
    onReject(request.id, adminNotes);
    onOpenChange(false);
    setAdminNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalles de Solicitud de Publicación</DialogTitle>
            {getStatusBadge(request.status)}
          </div>
          <DialogDescription>
            Solicitud recibida el {new Date(request.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información de Contacto */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{request.contact_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{request.contact_email}</p>
                </div>
              </div>
              {request.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{request.contact_phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium">{request.company_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Servicio */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Detalles del Servicio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Servicio</p>
                  <p className="font-medium">{request.service_type}</p>
                </div>
              </div>
              {request.budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Presupuesto</p>
                    <p className="font-medium">{request.budget}</p>
                  </div>
                </div>
              )}
              {request.timeline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">{request.timeline}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Descripción</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>

          {/* Requisitos */}
          {request.requirements && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Requisitos Adicionales</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{request.requirements}</p>
              </div>
            </div>
          )}

          {/* Notas del Admin */}
          {request.status === 'pending' && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Notas Administrativas</h3>
              <Textarea
                placeholder="Agregar notas internas (opcional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          {request.admin_notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Notas del Administrador</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{request.admin_notes}</p>
              </div>
            </div>
          )}

          {/* Acciones */}
          {request.status === 'pending' && (
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleReject}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rechazar
              </Button>
              <Button
                onClick={handleApprove}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Aprobar
              </Button>
            </div>
          )}

          {/* Botón para crear servicio si la solicitud está aprobada */}
          {request.status === 'approved' && onCreateService && (
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  onCreateService(request.id);
                  onOpenChange(false);
                }}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Crear Servicio
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
