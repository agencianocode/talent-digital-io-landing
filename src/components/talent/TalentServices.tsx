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
            <div 
              key={service.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-foreground">
                      {service.title}
                    </h3>
                    {getAvailabilityBadge(service.is_available)}
                  </div>
                  <Badge variant="outline" className="mb-2">
                    {service.category}
                  </Badge>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 leading-relaxed">
                {service.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    ${service.price.toLocaleString()} {service.currency}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{service.delivery_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>Publicado {new Date(service.created_at).toLocaleDateString('es-ES')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={talentAvatar} />
                    <AvatarFallback className="text-xs">
                      {talentName?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    Ofrecido por {talentName}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onContact && onContact()}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                  {service.is_available && (
                    <Button 
                      size="sm"
                      onClick={() => handleRequestService(service)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Solicitar
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
