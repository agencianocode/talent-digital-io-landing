import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAcademyData } from '@/hooks/useAcademyData';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Briefcase, 
  Activity,
  Share2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface AcademyOverviewProps {
  academyId: string;
  onTabChange?: (tab: string) => void;
}

export const AcademyOverview: React.FC<AcademyOverviewProps> = ({ academyId, onTabChange }) => {
  const { stats, activity, isLoading } = useAcademyData(academyId);
  const [publicDirectoryEnabled, setPublicDirectoryEnabled] = useState<boolean | null>(null);
  const [loadingDirectoryStatus, setLoadingDirectoryStatus] = useState(true);

  useEffect(() => {
    const loadDirectoryStatus = async () => {
      try {
        setLoadingDirectoryStatus(true);
        const { data, error } = await supabase
          .from('companies')
          .select('public_directory_enabled')
          .eq('id', academyId)
          .single();

        if (error) throw error;

        setPublicDirectoryEnabled(data?.public_directory_enabled ?? false);
      } catch (error) {
        console.error('Error loading directory status:', error);
        setPublicDirectoryEnabled(false);
      } finally {
        setLoadingDirectoryStatus(false);
      }
    };

    if (academyId) {
      loadDirectoryStatus();
    }
  }, [academyId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_students}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_students} estudiantes totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitaciones Pendientes</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_invitations}</div>
            <p className="text-xs text-muted-foreground">
              Esperando respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aplicaciones Recientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_applications}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Exclusivas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exclusive_opportunities}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para estudiantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graduated_students}</div>
            <p className="text-xs text-muted-foreground">
              Certificados completados
            </p>
          </CardContent>
        </Card>

        <Card className={publicDirectoryEnabled === false ? 'border-orange-200 bg-orange-50/30' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Directorio Público</CardTitle>
            {loadingDirectoryStatus ? (
              <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
            ) : publicDirectoryEnabled ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-orange-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingDirectoryStatus ? (
                <span className="text-muted-foreground">...</span>
              ) : publicDirectoryEnabled ? (
                'Habilitado'
              ) : (
                'Deshabilitado'
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {publicDirectoryEnabled 
                ? 'Visible para el público'
                : 'No visible públicamente'
              }
            </p>
            {publicDirectoryEnabled === false && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => onTabChange?.('public-directory')}
              >
                <Share2 className="h-3 w-3 mr-2" />
                Configurar Directorio
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.type === 'new_member' && 'Nuevo miembro'}
                    {item.type === 'application' && 'Aplicación'}
                    {item.type === 'graduation' && 'Graduación'}
                    {item.type === 'invitation_sent' && 'Invitación'}
                    {item.type === 'profile_update' && 'Actualización'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademyOverview;
