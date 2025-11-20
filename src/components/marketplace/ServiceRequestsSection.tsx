import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { ServiceRequest } from '@/hooks/useTalentServices';

interface ServiceRequestsSectionProps {
  serviceId: string;
  serviceTitle: string;
  requests: ServiceRequest[];
  onUpdateStatus?: (requestId: string, status: ServiceRequest['status']) => Promise<boolean>;
  isUpdating?: boolean;
}

const ServiceRequestsSection: React.FC<ServiceRequestsSectionProps> = ({
  requests
}) => {
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalRequests = requests.length;

  if (totalRequests === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Solicitudes ({totalRequests})</span>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendingRequests.length} pendientes
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestsSection;

