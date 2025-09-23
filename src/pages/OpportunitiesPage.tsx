import { useSupabaseAuth, isBusinessRole } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { OpportunityDashboard } from "@/components/dashboard/OpportunityDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Users, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OpportunitiesPage = () => {
  const { userRole, user } = useSupabaseAuth();
  const { activeCompany, canCreateOpportunities } = useCompany();

  // Función para corregir el rol del usuario
  const handleFixUserRole = async () => {
    try {
      if (!user?.id) {
        toast.error('Usuario no autenticado');
        return;
      }
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'freemium_business'
        });

      if (error) {
        toast.error('Error al cambiar el rol: ' + error.message);
      } else {
        toast.success('Rol actualizado correctamente. Recargando página...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error fixing user role:', error);
      toast.error('Error inesperado al cambiar el rol');
    }
  };

  // Verificar permisos
  if (!isBusinessRole(userRole)) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Acceso Restringido</h3>
                <p className="text-gray-500 mt-2">
                  Solo los usuarios con rol de empresa pueden acceder a esta sección.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Rol actual: {userRole || 'No definido'}
                </p>
              </div>
              <Button onClick={handleFixUserRole} className="mt-2">
                Corregir Rol de Usuario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sin Empresa Activa</h3>
                <p className="text-gray-500 mt-2">
                  Necesitas tener una empresa registrada para gestionar oportunidades.
                </p>
              </div>
              <Button onClick={() => window.location.href = '/business-dashboard'}>
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canCreateOpportunities()) {
    return (
      <div className="p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Actualiza tu Plan</h3>
                <p className="text-gray-500 mt-2">
                  Necesitas un plan premium para crear y gestionar oportunidades de trabajo.
                </p>
              </div>
              <Button onClick={() => window.location.href = '/pricing'}>
                Ver Planes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar el dashboard principal
  return (
    <div className="p-8">
      <OpportunityDashboard />
    </div>
  );
};

export default OpportunitiesPage;