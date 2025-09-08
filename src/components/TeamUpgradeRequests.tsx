import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { useUpgradeRequests } from '@/hooks/useUpgradeRequests';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';

const TeamUpgradeRequests: React.FC = () => {
  const { userRole } = useSupabaseAuth();
  const { requests, isLoading } = useUpgradeRequests();

  // Only show for business users
  if (!isBusinessRole(userRole)) {
    return null;
  }

  // Filter requests related to business/academy roles
  const businessRequests = requests.filter(request => 
    request.requested_role.includes('business') || request.requested_role.includes('academy')
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading || businessRequests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Solicitudes de Upgrade del Equipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {businessRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
                  {getStatusIcon(request.status)}
                  {request.status}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{request.requested_role}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {businessRequests.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{businessRequests.length - 3} solicitudes más
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamUpgradeRequests;