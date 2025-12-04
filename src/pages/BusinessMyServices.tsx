import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';
import MyPublishingRequests from '@/components/marketplace/MyPublishingRequests';
import { useTalentServices } from '@/hooks/useTalentServices';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import TalentServiceCard from '@/components/marketplace/TalentServiceCard';
import { supabase } from '@/integrations/supabase/client';

const BusinessMyServices: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const [companyServices, setCompanyServices] = useState<any[]>([]);
  const [isLoadingCompanyServices, setIsLoadingCompanyServices] = useState(false);

  // Hook para servicios personales (donde user_id = current user)
  const {
    services: personalServices,
    loading: loadingPersonal,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleStatus,
    onViewPortfolio,
    loadServices: loadPersonalServices
  } = useTalentServices(user?.id || '');

  // Cargar servicios de la empresa
  useEffect(() => {
    const loadCompanyServices = async () => {
      if (!activeCompany?.id) return;
      
      setIsLoadingCompanyServices(true);
      try {
        const { data, error } = await supabase
          .from('marketplace_services')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCompanyServices(data || []);
      } catch (error) {
        console.error('Error loading company services:', error);
      } finally {
        setIsLoadingCompanyServices(false);
      }
    };

    loadCompanyServices();
  }, [activeCompany?.id]);

  const allServices = [...personalServices, ...companyServices];
  const isLoading = loadingPersonal || isLoadingCompanyServices;

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
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/business-dashboard/marketplace')} 
              variant="outline"
            >
              Volver al Marketplace
            </Button>
            <Button 
              onClick={() => navigate('/business-dashboard/marketplace')} 
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </div>
      </div>

      {/* Published Services */}
      {allServices.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Servicios Publicados ({allServices.length})</h2>
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando servicios...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allServices.map((service) => (
                  <TalentServiceCard
                    key={service.id}
                    service={service}
                    serviceRequests={[]}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onToggleStatus={onToggleStatus}
                    onViewPortfolio={onViewPortfolio}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

