import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  ExternalLink
} from 'lucide-react';
import { ServiceRequest } from '@/hooks/useTalentServices';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ServiceRequestsSectionProps {
  serviceId: string;
  serviceTitle: string;
  requests: ServiceRequest[];
  onUpdateStatus: (requestId: string, status: ServiceRequest['status']) => Promise<boolean>;
  isUpdating?: boolean;
}

const ServiceRequestsSection: React.FC<ServiceRequestsSectionProps> = ({
  serviceId,
  serviceTitle,
  requests,
  onUpdateStatus,
  isUpdating = false
}) => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalRequests = requests.length;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pendiente', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock
        };
      case 'accepted':
        return { 
          label: 'Aceptado', 
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'declined':
        return { 
          label: 'Rechazado', 
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      case 'completed':
        return { 
          label: 'Completado', 
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle
        };
      default:
        return { 
          label: 'Desconocido', 
          color: 'bg-gray-100 text-gray-800',
          icon: Clock
        };
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

  if (totalRequests === 0) {
    return null;
  }

  const handleViewRequests = () => {
    const userRole = user?.user_metadata?.user_role || 'talent';
    const basePath = userRole.includes('business') ? '/business-dashboard' : '/talent-dashboard';
    navigate(`${basePath}/my-services/${serviceId}/requests`);
  };

  return (
    <div className="border-t pt-4 mt-4">
      <button
        onClick={handleViewRequests}
        className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Solicitudes ({totalRequests})</span>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendingRequests.length} pendientes
            </Badge>
          )}
        </div>
        <ExternalLink className="h-4 w-4" />
      </button>

      {/* Preview de las primeras 2 solicitudes pendientes */}
      {pendingRequests.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {pendingRequests.slice(0, 2).map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={request.id}
                className="p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {getInitials(request.requester_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">
                        {request.requester_name}
                      </span>
                      <Badge className={statusInfo.color} variant="outline">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    {request.company_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{request.company_name}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {request.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex-1"
                        onClick={handleViewRequests}
                      >
                        Ver todas las solicitudes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceRequestsSection;

