import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { TalentService } from '@/hooks/useTalentServices';
import { marketplaceService } from '@/services/marketplaceService';
import ServiceRequestModal from '@/components/marketplace/ServiceRequestModal';
import ServiceCard from '@/components/marketplace/ServiceCard';
import { MarketplaceService } from '@/hooks/useMarketplaceServices';

interface TalentServicesProps {
  userId: string;
  talentName: string;
  talentAvatar?: string;
  onContact?: () => void;
  isPublicView?: boolean;  // For public profile pages
}

export const TalentServices = ({ 
  userId, 
  talentName, 
  talentAvatar,
  onContact,
  isPublicView = false
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
      const fetchedServices = await marketplaceService.getPublicUserServices(userId);
      setServices(fetchedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error al cargar los servicios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestService = (service: MarketplaceService) => {
    setSelectedService(service);
    setIsRequestModalOpen(true);
  };

  const handleRequestSent = async () => {
    await fetchServices();
  };

  // Convert TalentService to MarketplaceService format
  const convertToMarketplaceService = (service: TalentService): MarketplaceService => ({
    ...service,
    user_name: talentName,
    user_avatar: talentAvatar
  });

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return null;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={convertToMarketplaceService(service)}
              onRequestService={isPublicView ? undefined : handleRequestService}
              variant={isPublicView ? 'public' : 'default'}
              hideUserInfo={true}
            />
          ))}
        </div>

        {!isPublicView && services.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <p className="text-sm text-muted-foreground">
                ¿No encuentras lo que buscas?
              </p>
              <Button variant="outline" size="sm" onClick={onContact} className="w-full sm:w-auto">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Contactar para proyecto personalizado</span>
                <span className="sm:hidden">Contactar</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Service Request Modal */}
      {!isPublicView && (
        <ServiceRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          service={selectedService}
          onRequestSent={handleRequestSent}
        />
      )}
    </Card>
  );
};
