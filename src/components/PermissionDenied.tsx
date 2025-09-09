import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';

interface PermissionDeniedProps {
  title?: string;
  message?: string;
  requiredRole?: 'owner' | 'admin' | 'viewer';
  showBackButton?: boolean;
}

const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  title = "Permisos Insuficientes",
  message,
  requiredRole,
  showBackButton = true
}) => {
  const navigate = useNavigate();
  const { currentUserRole, activeCompany } = useCompany();

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'admin': return 'Administrador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  const defaultMessage = requiredRole 
    ? `Necesitas permisos de ${getRoleText(requiredRole)} para acceder a esta funcionalidad.`
    : "No tienes permisos suficientes para acceder a esta funcionalidad.";

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message || defaultMessage}
          </p>
          
          {currentUserRole && activeCompany && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p><strong>Tu rol actual:</strong> {getRoleText(currentUserRole.role)}</p>
              <p><strong>Empresa:</strong> {activeCompany.name}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            )}
            <Button
              onClick={() => navigate('/business-dashboard')}
              className="flex-1"
            >
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionDenied;