import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  ExternalLink,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { TalentService } from '@/hooks/useTalentServices';
import { marketplaceService } from '@/services/marketplaceService';
import ServiceRequestModal from '@/components/marketplace/ServiceRequestModal';
import { MarketplaceService } from '@/hooks/useMarketplaceServices';

// TalentService interface is now imported from the hook

interface TalentServicesProps {
  userId: string;
  talentName: string;
  talentAvatar?: string;
  onContact?: () => void;
}

export const TalentServices = ({ 
  userId, 
  talentName, 
  talentAvatar,
  onContact 
}: TalentServicesProps) => {
  const [services, setServices] = useState<TalentService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [userId]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const fetchedServices = await marketplaceService.getUserServices(userId);
      setServices(fetchedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error al cargar los servicios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestService = (service: TalentService) => {
    // Convert TalentService to MarketplaceService format for the modal
    const marketplaceService: MarketplaceService = {
      ...service,
      user_name: talentName,
      user_avatar: talentAvatar
    };
    setSelectedService(marketplaceService);
    setIsRequestModalOpen(true);
  };

  const handleRequestSent = async () => {
    // Refresh services after request is sent
    await fetchServices();
  };

  const getAvailabilityBadge = (isAvailable: boolean) => {
    if (isAvailable) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Disponible
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        No disponible
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Servicios Ofrecidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Servicios Ofrecidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {talentName} aún no ha publicado servicios
            </p>
            <Button variant="outline" onClick={onContact}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Contactar directamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Servicios Ofrecidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="border-2 hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {service.title}
                      </h3>
                      {getAvailabilityBadge(service.is_available)}
                    </div>
                    <Badge variant="secondary" className="mb-3">
                      {service.category}
                    </Badge>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Descripción del servicio
                  </h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                        Precio
                      </p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        ${service.price.toLocaleString()} {service.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Tiempo de entrega
                      </p>
                      <p className="font-semibold text-blue-700 dark:text-blue-300">
                        {service.delivery_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                        Publicado
                      </p>
                      <p className="font-semibold text-purple-700 dark:text-purple-300">
                        {new Date(service.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Provider Info & Actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-border">
                      <AvatarImage src={talentAvatar} />
                      <AvatarFallback className="text-sm font-semibold bg-primary/10">
                        {talentName?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Ofrecido por
                      </p>
                      <p className="font-semibold text-foreground">
                        {talentName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      size="default"
                      onClick={() => onContact && onContact()}
                      className="flex-1 md:flex-none"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                    {service.is_available && (
                      <Button 
                        size="default"
                        onClick={() => handleRequestService(service)}
                        className="flex-1 md:flex-none"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Solicitar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                ¿No encuentras lo que buscas?
              </p>
              <Button variant="outline" size="sm" onClick={onContact}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contactar para proyecto personalizado
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Service Request Modal */}
      <ServiceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        service={selectedService}
        onRequestSent={handleRequestSent}
      />
    </Card>
  );
};
