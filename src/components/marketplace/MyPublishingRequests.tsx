import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Loader2 } from 'lucide-react';
import { useMarketplaceServices } from '@/hooks/useMarketplaceServices';
import PublishingRequestCard from './PublishingRequestCard';
import { useToast } from '@/hooks/use-toast';

const MyPublishingRequests: React.FC = () => {
  const { myRequests, isLoadingRequests, loadMyRequests, cancelRequest } = useMarketplaceServices();
  const { toast } = useToast();
  const [cancelingId, setCancelingId] = React.useState<string | null>(null);

  useEffect(() => {
    loadMyRequests();
  }, [loadMyRequests]);

  const handleCancel = async (requestId: string) => {
    try {
      setCancelingId(requestId);
      await cancelRequest(requestId);
      toast({
        title: "Solicitud cancelada",
        description: "Tu solicitud de publicación ha sido cancelada exitosamente.",
      });
    } catch (error) {
      console.error('Error canceling request:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la solicitud. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setCancelingId(null);
    }
  };

  if (isLoadingRequests) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (myRequests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin solicitudes</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Aún no has enviado ninguna solicitud de publicación de servicio.
            Haz clic en "Publicar Servicio" para comenzar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Mis Solicitudes de Publicación</h2>
          <p className="text-muted-foreground">
            {myRequests.length} {myRequests.length === 1 ? 'solicitud' : 'solicitudes'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myRequests.map((request) => (
          <PublishingRequestCard
            key={request.id}
            request={request}
            onCancel={handleCancel}
            isCanceling={cancelingId === request.id}
          />
        ))}
      </div>
    </div>
  );
};

export default MyPublishingRequests;
