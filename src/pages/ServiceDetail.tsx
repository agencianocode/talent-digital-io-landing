import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Star,
  Eye,
  MessageSquare,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Package,
  Edit,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  Play
} from 'lucide-react';
import VideoThumbnail from '@/components/VideoThumbnail';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories';
import ServiceRequestModal from '@/components/marketplace/ServiceRequestModal';
import { normalizeDeliveryTime, formatPriceRange } from '@/lib/marketplace-utils';
import { ServiceReviews } from '@/components/marketplace/ServiceReviews';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTalentServices } from '@/hooks/useTalentServices';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import ServiceForm from '@/components/marketplace/ServiceForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_min: number;
  price_max: number;
  currency: string;
  delivery_time: string;
  location: string;
  tags: string[];
  portfolio_url: string | null;
  demo_url: string | null;
  rating: number | null;
  reviews_count: number;
  views_count: number;
  requests_count: number;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  is_available: boolean;
}

const ServiceDetail: React.FC = () => {
  // Soportar tanto 'id' como 'serviceId' para compatibilidad con diferentes rutas
  const params = useParams<{ id?: string; serviceId?: string }>();
  const id = params.id || params.serviceId;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const { getOrCreateConversation } = useMessages();
  const { 
    serviceRequests, 
    updateRequestStatus, 
    updateService,
    loadServiceRequests 
  } = useTalentServices();
  
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const { categories: marketplaceCategories } = useMarketplaceCategories();
  
  // Detectar si viene de /my-services (es propietario)
  const isOwnerView = location.pathname.includes('/my-services/');
  
  // Filtrar solicitudes para este servicio
  const requestsForService = isOwnerView 
    ? serviceRequests.filter(req => req.service_id === id)
    : [];

  useEffect(() => {
    if (!id) {
      console.warn('[ServiceDetail] No ID in URL params');
      setIsLoading(false);
      return;
    }

    console.log('[ServiceDetail] useEffect triggered with:', { id, isOwnerView, hasUser: !!user });

    const loadData = async () => {
      try {
        await loadServiceDetail();
        
        if (user) {
          checkReviewEligibility();
        }
        
        if (isOwnerView) {
          console.log('[ServiceDetail] Loading service requests for owner view');
          await loadServiceRequests();
        }
      } catch (error) {
        console.error('[ServiceDetail] Error in loadData:', error);
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadServiceDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) {
        console.error('[ServiceDetail] No service ID provided');
        setError('ID de servicio no proporcionado');
        setIsLoading(false);
        return;
      }

      console.log('[ServiceDetail] Loading service with ID:', id);

      const { data: serviceData, error: fetchError } = await supabase
        .from('marketplace_services')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('[ServiceDetail] Error fetching service:', fetchError);
        throw fetchError;
      }

      if (!serviceData) {
        console.error('[ServiceDetail] Service not found for ID:', id);
        setError('Servicio no encontrado');
        setIsLoading(false);
        return;
      }

      console.log('[ServiceDetail] Service data loaded:', serviceData);

      // Si el servicio tiene company_id, obtener nombre de la empresa; si no, del perfil
      let providerName = 'Usuario';
      let providerAvatar: string | null = null;

      if (serviceData.company_id) {
        // Servicio publicado a nombre de empresa
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name, logo_url')
          .eq('id', serviceData.company_id)
          .single();

        if (!companyError && companyData) {
          providerName = companyData.name;
          providerAvatar = companyData.logo_url;
        }
      } else {
        // Servicio publicado a nombre personal
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', serviceData.user_id)
          .single();

        if (!profileError && profileData) {
          providerName = profileData.full_name || 'Usuario';
          providerAvatar = profileData.avatar_url;
        }
      }

      setService({
        id: serviceData.id,
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: serviceData.price ?? 0,
        price_min: serviceData.price_min,
        price_max: serviceData.price_max,
        currency: serviceData.currency,
        delivery_time: serviceData.delivery_time,
        location: serviceData.location,
        tags: serviceData.tags || [],
        portfolio_url: serviceData.portfolio_url,
        demo_url: serviceData.demo_url,
        rating: serviceData.rating,
        reviews_count: serviceData.reviews_count,
        views_count: serviceData.views_count,
        requests_count: serviceData.requests_count,
        user_id: serviceData.user_id,
        user_name: providerName,
        user_avatar: providerAvatar,
        is_available: serviceData.is_available
      });

      console.log('[ServiceDetail] Service state updated successfully');

      // Increment view count and record view (solo si no es vista de propietario)
      const isOwnerViewCheck = location.pathname.includes('/my-services/');
      if (id && !isOwnerViewCheck) {
        try {
          // Get current user
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          // Only record if not the owner
          if (!currentUser || currentUser.id !== serviceData.user_id) {
            // Insert into marketplace_service_views (trigger will send notification)
            await supabase.from('marketplace_service_views').insert({
              service_id: id,
              service_owner_id: serviceData.user_id,
              viewer_id: currentUser?.id || null
            });
            console.log('[ServiceDetail] View recorded for notification');
          }
          
          // Increment counter
          await supabase
            .from('marketplace_services')
            .update({ views_count: serviceData.views_count + 1 })
            .eq('id', id);
        } catch (viewError) {
          console.warn('[ServiceDetail] Error recording view:', viewError);
          // No fallar si no se puede registrar la vista
        }
      }
    } catch (err) {
      console.error('[ServiceDetail] Error loading service:', err);
      setError(err instanceof Error ? err.message : 'No se pudo cargar el servicio');
    } finally {
      setIsLoading(false);
      console.log('[ServiceDetail] Loading finished, isLoading set to false');
    }
  };

  const checkReviewEligibility = async () => {
    if (!user || !id) {
      setCanReview(false);
      return;
    }

    // For now, allow any logged-in user to review
    // TODO: Add service_requests table and check if user completed a request
    setCanReview(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
        id!
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
      await loadServiceRequests();
      await loadServiceDetail();
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

  const handleEditService = async (formData: any) => {
    if (!id) return false;
    try {
      await updateService(id, formData);
      setIsEditModalOpen(false);
      await loadServiceDetail();
      toast({
        title: "Servicio actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio.",
        variant: "destructive",
      });
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Servicio no encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error || 'El servicio que buscas no existe o fue eliminado.'}
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const category = marketplaceCategories.find(cat => cat.name === service.category);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => {
          if (isOwnerView) {
            const userRole = user?.user_metadata?.user_role || 'talent';
            const basePath = userRole.includes('business') ? '/business-dashboard' : '/talent-dashboard';
            navigate(`${basePath}/my-services`);
          } else {
            navigate(-1);
          }
        }}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-3">
                {category && (
                  <Badge variant="secondary">
                    {category.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {normalizeDeliveryTime(service.delivery_time)}
                </Badge>
                {!service.is_available && (
                  <Badge variant="destructive">No disponible</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={service.user_avatar || undefined} />
                  <AvatarFallback>{getInitials(service.user_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{service.user_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{service.location}</span>
                  </div>
                </div>
                {service.rating != null && service.rating > 0 && service.reviews_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-muted-foreground">
                      ({service.reviews_count} reseñas)
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                <div 
                  className="text-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              </div>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Etiquetas</h2>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {service.views_count} vistas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {service.requests_count} solicitudes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section o Solicitudes Section según si es propietario */}
          {isOwnerView ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Solicitudes de Servicio</h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona las solicitudes recibidas para este servicio
                </p>
              </CardHeader>
              <CardContent>
                {requestsForService.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Aún no has recibido solicitudes para este servicio.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requestsForService.map((request) => {
                      const statusInfo = getStatusInfo(request.status);
                      const StatusIcon = statusInfo.icon;
                      const isExpanded = expandedRequestId === request.id;
                      const messageLines = request.message.split('\n').length;
                      const shouldTruncate = messageLines > 3 || request.message.length > 200;

                      return (
                        <Card 
                          key={request.id} 
                          className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                            isExpanded ? 'ring-2 ring-primary/20' : ''
                          }`}
                          onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 flex-shrink-0">
                                <AvatarFallback className="text-sm font-semibold">
                                  {getInitials(request.requester_name)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h3 className="font-semibold text-base truncate">{request.requester_name}</h3>
                                      <Badge className={`${statusInfo.color} font-medium`} variant="outline">
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusInfo.label}
                                      </Badge>
                                    </div>
                                    
                                    {request.company_name && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                        <Building className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{request.company_name}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div 
                                  className="text-sm text-foreground mb-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {shouldTruncate && !isExpanded ? (
                                    <p className="line-clamp-3">{request.message}</p>
                                  ) : (
                                    <p className="whitespace-pre-wrap">{request.message}</p>
                                  )}
                                </div>

                                <div 
                                  className="flex items-center justify-between gap-2 pt-2 border-t"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {request.requester_id && (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenConversation(request);
                                        }}
                                        className="bg-primary hover:bg-primary/90"
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1.5" />
                                        Responder
                                      </Button>
                                    )}
                                    
                                    {!isExpanded && shouldTruncate && (
                                      <span className="text-xs text-muted-foreground">
                                        Click para ver más
                                      </span>
                                    )}
                                  </div>
                                  
                                  {request.status === 'pending' && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                          <span className="sr-only">Más acciones</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(request.id, 'accepted');
                                          }}
                                          disabled={isUpdatingStatus === request.id}
                                          className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                        >
                                          {isUpdatingStatus === request.id ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                          )}
                                          Aceptar solicitud
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(request.id, 'declined');
                                          }}
                                          disabled={isUpdatingStatus === request.id}
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                          {isUpdatingStatus === request.id ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          ) : (
                                            <XCircle className="h-4 w-4 mr-2" />
                                          )}
                                          Rechazar solicitud
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>

                                {isExpanded && (
                                  <div 
                                    className="mt-4 pt-4 border-t space-y-4"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                      <div className="flex items-start gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium text-foreground">Presupuesto:</span>
                                          <p className="text-muted-foreground mt-0.5">{request.budget_range}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium text-foreground">Timeline:</span>
                                          <p className="text-muted-foreground mt-0.5">{request.timeline}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 sm:col-span-2">
                                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium text-foreground">Email:</span>
                                          <p className="text-muted-foreground mt-0.5 break-all">{request.requester_email}</p>
                                        </div>
                                      </div>
                                      {request.requester_phone && (
                                        <div className="flex items-start gap-2 sm:col-span-2">
                                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                          <div>
                                            <span className="font-medium text-foreground">Teléfono:</span>
                                            <p className="text-muted-foreground mt-0.5">{request.requester_phone}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-start gap-2 sm:col-span-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium text-foreground">Fecha de solicitud:</span>
                                          <p className="text-muted-foreground mt-0.5">
                                            {new Date(request.created_at).toLocaleDateString('es-ES', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <ServiceReviews serviceId={service.id} canReview={canReview} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {formatPriceRange(service.price_min, service.price_max, service.currency, service.price)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{normalizeDeliveryTime(service.delivery_time)}</span>
                </div>
              </div>

              {isOwnerView ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Servicio
                </Button>
              ) : (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsRequestModalOpen(true)}
                    disabled={!service.is_available || service.user_id === user?.id}
                  >
                    Solicitar Servicio
                  </Button>

                  {service.user_id === user?.id && (
                    <p className="text-xs text-center text-muted-foreground">
                      Este es tu servicio
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Video Demo Card */}
          {service.demo_url && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Video Demo</h3>
                  <Badge variant="secondary" className="text-xs">
                    {service.demo_url.includes('youtube') || service.demo_url.includes('youtu.be') ? 'YouTube' :
                     service.demo_url.includes('loom') ? 'Loom' :
                     service.demo_url.includes('vimeo') ? 'Vimeo' :
                     service.demo_url.includes('drive.google') ? 'Google Drive' :
                     service.demo_url.includes('dropbox') ? 'Dropbox' : 'Video'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative cursor-pointer group rounded-lg overflow-hidden aspect-video"
                  onClick={() => setIsVideoModalOpen(true)}
                >
                  <VideoThumbnail url={service.demo_url} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Play className="h-4 w-4" />
                      Reproducir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Link Card */}
          {service.portfolio_url && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Portfolio</h3>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(service.portfolio_url!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Portfolio
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Service Request Modal */}
      {service && !isOwnerView && (
        <ServiceRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          service={{
            ...service,
            portfolio_url: service.portfolio_url || undefined,
            demo_url: service.demo_url || undefined,
            rating: service.rating || undefined,
            user_avatar: service.user_avatar || undefined,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }}
          onRequestSent={() => {
            loadServiceDetail();
            setIsRequestModalOpen(false);
          }}
        />
      )}

      {/* Service Edit Modal */}
      {service && isOwnerView && (
        <ServiceForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditService}
          initialData={{
            title: service.title,
            description: service.description,
            category: service.category,
            price_min: service.price_min,
            price_max: service.price_max,
            currency: service.currency || 'USD',
            delivery_time: service.delivery_time,
            location: service.location,
            is_available: service.is_available,
            portfolio_url: service.portfolio_url || undefined,
            demo_url: service.demo_url || undefined,
            tags: service.tags
          }}
          isSubmitting={false}
          mode="edit"
        />
      )}

      {/* Video Player Modal */}
      {service?.demo_url && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={service.demo_url}
          title="Video Demo del Servicio"
        />
      )}
    </div>
  );
};

export default ServiceDetail;
