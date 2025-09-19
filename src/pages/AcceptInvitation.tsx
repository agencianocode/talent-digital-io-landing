import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanyUserRoles } from '@/hooks/useCompanyUserRoles';
import { CheckCircle, Crown, Shield, Eye, Building, Loader2 } from 'lucide-react';

interface InvitationData {
  id: string;
  company_id: string;
  invited_email: string | null;
  role: 'owner' | 'admin' | 'viewer';
  status: string;
  company_name?: string;
  invited_by_name?: string;
}

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useSupabaseAuth();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invitationId = searchParams.get('id');
  
  // Use the hook for accepting invitations
  const { acceptInvitation } = useCompanyUserRoles();

  // Load invitation data
  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationId) {
        setError('ID de invitación no válido');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('company_user_roles')
          .select(`
            *,
            companies!company_user_roles_company_id_fkey (
              name
            )
          `)
          .eq('id', invitationId)
          .single();

        if (error || !data) {
          setError('Invitación no encontrada');
          return;
        }

        if (data.status !== 'pending') {
          setError(`Esta invitación ya ha sido ${data.status === 'accepted' ? 'aceptada' : 'rechazada'}`);
          return;
        }

        const companyData = Array.isArray(data.companies) ? data.companies[0] : data.companies;
        
        setInvitation({
          ...data,
          company_name: companyData?.name || 'Empresa'
        });
      } catch (err) {
        console.error('Error loading invitation:', err);
        setError('Error al cargar la invitación');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId]);

  // Accept invitation using the hook
  const handleAcceptInvitation = async () => {
    if (!invitation || !invitationId) return;

    setIsProcessing(true);
    try {
      console.log('Accepting invitation:', invitationId, 'for user:', user?.id);
      
      await acceptInvitation(invitationId);
      
      toast.success(`¡Te has unido exitosamente a ${invitation.company_name}!`);
      
      // Small delay to ensure the update is processed
      setTimeout(() => {
        navigate('/business-dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      // The hook already shows error toasts, but we can add specific handling here
      setError('Error al aceptar la invitación. Por favor intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'owner':
        return {
          icon: <Crown className="h-8 w-8 text-yellow-600" />,
          title: 'Propietario',
          description: 'Control total sobre la empresa y todos los permisos'
        };
      case 'admin':
        return {
          icon: <Shield className="h-8 w-8 text-blue-600" />,
          title: 'Administrador',
          description: 'Puede crear oportunidades, gestionar aplicaciones y ver reportes'
        };
      case 'viewer':
        return {
          icon: <Eye className="h-8 w-8 text-green-600" />,
          title: 'Visualizador',
          description: 'Puede ver aplicaciones y reportes básicos'
        };
      default:
        return {
          icon: <Eye className="h-8 w-8 text-gray-600" />,
          title: 'Usuario',
          description: 'Acceso básico a la plataforma'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate('/')}>
                Ir a TalentFlow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  // If user is not authenticated, redirect to login with invitation data
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Invitación a {invitation.company_name}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              {getRoleInfo(invitation.role).icon}
              <div>
                <p className="font-medium">{getRoleInfo(invitation.role).title}</p>
                <p className="text-sm text-muted-foreground">{getRoleInfo(invitation.role).description}</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Para aceptar esta invitación, necesitas iniciar sesión o crear una cuenta.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate(`/auth?invitation=${invitationId}`)} 
                className="w-full"
              >
                Iniciar Sesión / Registrarse
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated, show invitation details and accept option
  const roleInfo = getRoleInfo(invitation.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Invitación a {invitation.company_name}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              Has sido invitado a unirte como:
            </p>
            <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
              {roleInfo.icon}
              <div className="text-left">
                <p className="font-bold text-lg">{roleInfo.title}</p>
                <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvitation}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aceptar Invitación
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/business-dashboard')}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
