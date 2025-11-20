import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { ServiceRequest } from '@/hooks/useTalentServices';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ServiceRequestsSectionProps {
  serviceId: string;
  serviceTitle: string;
  requests: ServiceRequest[];
  onUpdateStatus: (requestId: string, status: ServiceRequest['status']) => Promise<boolean>;
  isUpdating?: boolean;
}

const ServiceRequestsSection: React.FC<ServiceRequestsSectionProps> = ({
  serviceId,
  serviceTitle,
  requests,
  onUpdateStatus,
  isUpdating = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { getOrCreateConversation } = useMessages();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalRequests = requests.length;

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleOpenConversation = async (request: ServiceRequest) => {
    if (!user || !request.requester_id) {
      toast({
        title: "Error",
        description: "No se puede abrir la conversación. Usuario no identificado.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear o obtener conversación
      const conversationId = await getOrCreateConversation(
        request.requester_id,
        'service_inquiry',
        undefined, // opportunityId
        serviceId // serviceId
      );

      // Navegar a la conversación
      const userRole = user.user_metadata?.user_role || 'talent';
      const basePath = userRole.includes('business') ? '/business-dashboard' : '/talent-dashboard';
      navigate(`${basePath}/messages/${conversationId}`);
    } catch (error) {
      console.error('Error opening conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo abrir la conversación. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (totalRequests === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Solicitudes ({totalRequests})</span>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendingRequests.length} pendientes
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {requests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const StatusIcon = statusInfo.icon;
            const isExpandedRequest = expandedRequestId === request.id;

            return (
              <div
                key={request.id}
                className="p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {getInitials(request.requester_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">
                        {request.requester_name}
                      </span>
                      <Badge className={statusInfo.color} variant="outline">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    {request.company_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{request.company_name}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {request.message}
                    </p>

                    {isExpandedRequest && (
                      <div className="mt-2 space-y-2 text-xs">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{request.requester_email}</span>
                          </div>
                          {request.requester_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{request.requester_phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{request.budget_range}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{request.timeline}</span>
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(request.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="p-2 bg-background rounded border text-xs">
                          <p className="font-medium mb-1">Mensaje completo:</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {request.message}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setExpandedRequestId(
                          isExpandedRequest ? null : request.id
                        )}
                      >
                        {isExpandedRequest ? 'Ver menos' : 'Ver detalles'}
                      </Button>
                      
                      {request.requester_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleOpenConversation(request)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Responder
                        </Button>
                      )}
                      
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => onUpdateStatus(request.id, 'accepted')}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => onUpdateStatus(request.id, 'declined')}
                            disabled={isUpdating}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceRequestsSection;

