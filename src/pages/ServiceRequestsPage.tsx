import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useTalentServices } from '@/hooks/useTalentServices';
import { useMessages } from '@/hooks/useMessages';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceServices } from '@/hooks/useMarketplaceServices';

const ServiceRequestsPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const { getOrCreateConversation } = useMessages();
  
  // Hooks para obtener datos del servicio y solicitudes
  const { services, serviceRequests, isLoading, isRequestsLoading, updateRequestStatus } = useTalentServices();
  const { services: marketplaceServices } = useMarketplaceServices();
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Cargar solicitudes cuando cambie el serviceId
  useEffect(() => {
    if (serviceId) {
      // Las solicitudes ya se cargan en el hook, solo necesitamos filtrarlas
    }
  }, [serviceId]);

  // Encontrar el servicio actual
  const currentService = services.find(s => s.id === serviceId) || 
                         marketplaceServices.find(s => s.id === serviceId);

  // Filtrar solicitudes para este servicio
  const requestsForService = serviceRequests.filter(
    req => req.service_id === serviceId
  );

  const pendingRequests = requestsForService.filter(r => r.status === 'pending');
  const acceptedRequests = requestsForService.filter(r => r.status === 'accepted');
  const declinedRequests = requestsForService.filter(r => r.status === 'declined');
  const completedRequests = requestsForService.filter(r => r.status === 'completed');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pendiente', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'accepted':
        return { 
          label: 'Aceptado', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'declined':
        return { 
          label: 'Rechazado', 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      case 'completed':
        return { 
          label: 'Completado', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle
        };
      default:
        return { 
          label: 'Desconocido', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
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

  const handleOpenConversation = async (request: typeof requestsForService[0]) => {
    if (!user || !request.requester_id) {
      toast({
        title: "Error",
        description: "No se puede abrir la conversación. Usuario no identificado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const conversationId = await getOrCreateConversation(
        request.requester_id,
        'service_inquiry',
        undefined,
        serviceId!
      );

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

  const handleUpdateStatus = async (
    requestId: string, 
    status: 'pending' | 'accepted' | 'declined' | 'completed'
  ) => {
    setIsUpdatingStatus(requestId);
    try {
      await updateRequestStatus(requestId, status);
      toast({
        title: "Estado actualizado",
        description: `La solicitud ha sido ${status === 'accepted' ? 'aceptada' : status === 'declined' ? 'rechazada' : 'actualizada'}.`,
      });
      setExpandedRequestId(null);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la solicitud.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const getBackPath = () => {
    const userRole = user?.user_metadata?.user_role || 'talent';
    return userRole.includes('business') 
      ? '/business-dashboard/my-services'
      : '/talent-dashboard/my-services';
  };

  if (isLoading || isRequestsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentService) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Servicio no encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              El servicio que estás buscando no existe o ha sido eliminado.
            </p>
            <Button onClick={() => navigate(getBackPath())}>
              Volver a Mis Servicios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(getBackPath())}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Mis Servicios
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{currentService.title}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gestiona las solicitudes recibidas para este servicio
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="text-sm">
                {pendingRequests.length} pendientes
              </Badge>
            )}
            <Badge variant="secondary" className="text-sm">
              {requestsForService.length} total
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">
              {pendingRequests.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              {acceptedRequests.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Aceptadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
              {declinedRequests.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Rechazadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
              {completedRequests.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Completadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {requestsForService.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
            <p className="text-muted-foreground text-center mb-4">
              Aún no has recibido solicitudes para este servicio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {requestsForService.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedRequestId === request.id;

            return (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-shrink-0">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {getInitials(request.requester_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {request.requester_name}
                          </h3>
                          <Badge className={`${statusInfo.color} text-xs`} variant="outline">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        {request.company_name && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{request.company_name}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{request.requester_email}</span>
                          </div>
                          {request.requester_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{request.requester_phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Message Preview */}
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                          {request.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto sm:items-start">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-xs sm:text-sm"
                        onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                      >
                        {isExpanded ? 'Ver menos' : 'Ver detalles'}
                      </Button>
                      
                      {request.requester_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                          onClick={() => handleOpenConversation(request)}
                        >
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Responder
                        </Button>
                      )}
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                            onClick={() => handleUpdateStatus(request.id, 'accepted')}
                            disabled={isUpdatingStatus === request.id}
                          >
                            {isUpdatingStatus === request.id ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Aceptar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none border-red-500 text-red-500 hover:bg-red-50 text-xs sm:text-sm"
                            onClick={() => handleUpdateStatus(request.id, 'declined')}
                            disabled={isUpdatingStatus === request.id}
                          >
                            {isUpdatingStatus === request.id ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Rechazar
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">Presupuesto:</span>
                          <span>{request.budget_range}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">Timeline:</span>
                          <span>{request.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">Fecha de solicitud:</span>
                          <span>
                            {new Date(request.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border">
                        <p className="font-medium text-sm sm:text-base mb-2">Mensaje completo:</p>
                        <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
                          {request.message}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceRequestsPage;
