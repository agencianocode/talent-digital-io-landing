import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  MapPin,
  Clock,
  DollarSign,
  Package,
  ExternalLink,
  Video,
  Link2
} from 'lucide-react';
import VideoThumbnail from '@/components/VideoThumbnail';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories';
import { normalizeDeliveryTime, formatPriceRange } from '@/lib/marketplace-utils';
import { ServiceReviews } from '@/components/marketplace/ServiceReviews';

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

const PublicServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const hasRecordedViewRef = useRef(false);
  const lastViewedIdRef = useRef<string | null>(null);
  
  const { categories: marketplaceCategories } = useMarketplaceCategories();

  useEffect(() => {
    if (id !== lastViewedIdRef.current) {
      hasRecordedViewRef.current = false;
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    loadServiceDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadServiceDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) {
        setError('ID de servicio no proporcionado');
        setIsLoading(false);
        return;
      }

      // Only fetch active/published services for public view
      const { data: serviceData, error: fetchError } = await supabase
        .from('marketplace_services')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .eq('is_available', true)
        .single();

      if (fetchError) {
        console.error('[PublicServiceDetail] Error fetching service:', fetchError);
        throw fetchError;
      }

      if (!serviceData) {
        setError('Servicio no encontrado');
        setIsLoading(false);
        return;
      }

      // Get provider info
      let providerName = 'Usuario';
      let providerAvatar: string | null = null;

      if (serviceData.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('name, logo_url')
          .eq('id', serviceData.company_id)
          .single();

        if (companyData) {
          providerName = companyData.name;
          providerAvatar = companyData.logo_url;
        }
      } else {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', serviceData.user_id)
          .single();

        if (profileData) {
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

      // Record view (anonymous)
      if (!hasRecordedViewRef.current || lastViewedIdRef.current !== id) {
        hasRecordedViewRef.current = true;
        lastViewedIdRef.current = id;
        
        try {
          await supabase
            .from('marketplace_service_views')
            .insert({
              service_id: id,
              service_owner_id: serviceData.user_id,
              viewer_id: null
            });
        } catch (viewError) {
          console.warn('[PublicServiceDetail] Error recording view:', viewError);
        }
      }
    } catch (err) {
      console.error('[PublicServiceDetail] Error loading service:', err);
      setError(err instanceof Error ? err.message : 'No se pudo cargar el servicio');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Servicio no encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {error || 'El servicio que buscas no existe o no está disponible.'}
              </p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const category = marketplaceCategories.find(cat => cat.name === service.category);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
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
                </div>
                <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.user_avatar || undefined} />
                    <AvatarFallback>
                      {getInitials(service.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{service.user_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{service.location}</span>
                    </div>
                  </div>
                  {service.rating != null && service.rating > 0 && service.reviews_count > 0 && (
                    <div className="ml-auto flex items-center gap-1">
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
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{service.views_count} vistas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{service.requests_count} solicitudes</span>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-3">Descripción</h3>
                  <div 
                    className="text-muted-foreground prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                  />
                </div>

                {/* Tags */}
                {service.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Demo Video */}
                {service.demo_url && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Demo
                      </h3>
                      <div 
                        className="cursor-pointer relative rounded-lg overflow-hidden aspect-video max-w-md"
                        onClick={() => setIsVideoModalOpen(true)}
                      >
                        <VideoThumbnail url={service.demo_url} />
                      </div>
                    </div>
                  </>
                )}

                {/* Portfolio Link */}
                {service.portfolio_url && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Portfolio
                      </h3>
                      <a 
                        href={service.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Ver portfolio
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <ServiceReviews 
              serviceId={service.id}
              canReview={false}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">
                      {formatPriceRange(service.price_min, service.price_max, service.currency, service.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{normalizeDeliveryTime(service.delivery_time)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate(`/profile/${service.user_id}`)}
                  >
                    Ver perfil del talento
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Inicia sesión para solicitar este servicio
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.user_avatar || undefined} />
                    <AvatarFallback>
                      {getInitials(service.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{service.user_name}</p>
                    <p className="text-sm text-muted-foreground">{service.location}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/profile/${service.user_id}`)}
                >
                  Ver perfil completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {service.demo_url && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={service.demo_url}
          title="Video Demo"
        />
      )}
    </div>
  );
};

export default PublicServiceDetail;
