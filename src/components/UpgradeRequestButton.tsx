import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useUpgradeRequests } from '@/hooks/useUpgradeRequests';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import UpgradeRequestModal from './UpgradeRequestModal';

const UpgradeRequestButton: React.FC = () => {
  const { userRole } = useSupabaseAuth();
  const { userRequest } = useUpgradeRequests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Verificar si hay una solicitud pendiente
  const hasPendingRequest = Boolean(userRequest && userRequest.status === 'pending');

  // Don't show for admin users or premium users
  if (userRole === 'admin' || userRole?.includes('premium')) {
    return null;
  }

  // Show current request status if exists
  if (userRequest) {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending':
          return <Clock className="h-4 w-4" />;
        case 'approved':
          return <CheckCircle className="h-4 w-4" />;
        case 'rejected':
          return <XCircle className="h-4 w-4" />;
        default:
          return <Clock className="h-4 w-4" />;
      }
    };

    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'pending':
          return 'secondary';
        case 'approved':
          return 'default';
        case 'rejected':
          return 'destructive';
        default:
          return 'secondary';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending':
          return 'En revisión';
        case 'approved':
          return 'Aprobada';
        case 'rejected':
          return 'Rechazada';
        default:
          return 'Desconocido';
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-primary" />
            Estado de Solicitud Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(userRequest.status)} className="flex items-center gap-1">
                {getStatusIcon(userRequest.status)}
                {getStatusText(userRequest.status)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Solicitud enviada el {new Date(userRequest.created_at).toLocaleDateString('es-ES')}
            </p>

            {userRequest.reason && (
              <div>
                <p className="text-sm font-medium">Razón:</p>
                <p className="text-sm text-muted-foreground">{userRequest.reason}</p>
              </div>
            )}

            {userRequest.admin_notes && (
              <div>
                <p className="text-sm font-medium">Notas del administrador:</p>
                <p className="text-sm text-muted-foreground">{userRequest.admin_notes}</p>
              </div>
            )}

            {userRequest.status === 'rejected' && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="w-full"
                variant="outline"
              >
                Solicitar Nuevamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show upgrade button for freemium users
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade a Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Accede a funcionalidades avanzadas con un plan Premium.
            </p>
            
            {hasPendingRequest && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Ya tienes una solicitud pendiente. Por favor espera a que sea revisada antes de enviar otra.
                </p>
              </div>
            )}
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="w-full"
              disabled={hasPendingRequest}
            >
              <Crown className="h-4 w-4 mr-2" />
              {hasPendingRequest ? 'Solicitud Pendiente' : 'Solicitar Premium'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpgradeRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default UpgradeRequestButton;