import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import MyPublishingRequests from '@/components/marketplace/MyPublishingRequests';

const BusinessMyServices: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Servicios</h1>
            <p className="text-muted-foreground">
              Gestiona tus servicios publicados en el marketplace
            </p>
          </div>
          <Button 
            onClick={() => navigate('/business-dashboard/marketplace')} 
            variant="outline"
          >
            Volver al Marketplace
          </Button>
        </div>
      </div>

      {/* My Publishing Requests */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Solicitudes de Publicación</h2>
          </div>
          <MyPublishingRequests />
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessMyServices;

