import React, { useEffect, useState } from 'react';
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
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryById } from '@/lib/marketplace-categories';
import ServiceRequestModal from '@/components/marketplace/ServiceRequestModal';
import { ServiceReviews } from '@/components/marketplace/ServiceReviews';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadServiceDetail();
      if (user) {
        checkReviewEligibility();
      }
    }
  }, [id, user]);

  const loadServiceDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) return;

      const { data: serviceData, error: fetchError } = await supabase
        .from('marketplace_services')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (serviceData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', serviceData.user_id)
          .single();

        setService({
          id: serviceData.id,
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          price: serviceData.price,
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
          user_name: profileData?.full_name || 'Usuario',
          user_avatar: profileData?.avatar_url || null,
          is_available: serviceData.is_available
        });

        // Increment view count
        if (id) {
          await supabase
            .from('marketplace_services')
            .update({ views_count: serviceData.views_count + 1 })
            .eq('id', id);
        }
      }
    } catch (err) {
      console.error('Error loading service:', err);
      setError('No se pudo cargar el servicio');
    } finally {
      setIsLoading(false);
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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
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

  const category = getCategoryById(service.category);

  return (
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
                  <Badge className={category.color}>
                    {category.icon} {category.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {service.delivery_time}
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
                {service.rating && (
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
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {service.description}
                </p>
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

          {/* Reviews Section */}
          <ServiceReviews serviceId={service.id} canReview={canReview} />
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
                    {formatPrice(service.price, service.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{service.delivery_time}</span>
                </div>
              </div>

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
            </CardContent>
          </Card>

          {/* Links Card */}
          {(service.portfolio_url || service.demo_url) && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Enlaces</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {service.portfolio_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(service.portfolio_url!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Portfolio
                  </Button>
                )}
                {service.demo_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(service.demo_url!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Demo
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Service Request Modal */}
      {service && (
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
    </div>
  );
};

export default ServiceDetail;
