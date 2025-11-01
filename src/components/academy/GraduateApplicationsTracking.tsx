import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Briefcase, TrendingUp, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GraduateApplication {
  application_id: string;
  graduate_email: string;
  graduate_name: string | null;
  opportunity_title: string;
  company_name: string;
  application_status: string;
  applied_at: string;
  graduation_date: string | null;
  program_name: string | null;
}

interface GraduateApplicationsTrackingProps {
  academyId: string;
}

export const GraduateApplicationsTracking = ({ academyId }: GraduateApplicationsTrackingProps) => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<GraduateApplication[]>([]);

  useEffect(() => {
    loadApplications();
  }, [academyId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_academy_graduate_applications', {
        p_academy_id: academyId
      });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'hired':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'interviewing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      reviewing: 'En revisión',
      interviewing: 'Entrevistando',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      hired: 'Contratado',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <CardTitle>Aplicaciones de Graduados</CardTitle>
        </div>
        <CardDescription>
          Seguimiento de las aplicaciones de tus graduados a oportunidades laborales
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aún no hay aplicaciones de graduados registradas</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Graduado</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Oportunidad</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Aplicación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.application_id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{app.graduate_name || 'Sin nombre'}</span>
                        <span className="text-xs text-muted-foreground">{app.graduate_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {app.program_name && (
                          <Badge variant="outline" className="text-xs">
                            {app.program_name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate font-medium">{app.opportunity_title}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{app.company_name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(app.application_status)}>
                        {getStatusText(app.application_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.applied_at).toLocaleDateString('es')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
