import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/hooks/useCustomHooks';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import ApplicationStatusBadge from './ApplicationStatusBadge';

interface Application {
  id: string;
  opportunityId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  message: string;
  resume?: string;
}

interface ApplicantsListProps {
  opportunityId: string;
}

const ApplicantsList: React.FC<ApplicantsListProps> = ({ opportunityId }) => {
  const navigate = useNavigate();
  const { updateApplicationStatus } = useApplications();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch applications for this opportunity
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            profiles (
              full_name
            )
          `)
          .eq('opportunity_id', opportunityId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        toast({
          title: "Error",
          description: "No se pudieron cargar las aplicaciones",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [opportunityId, toast]);

  const handleStatusUpdate = async (applicationId: string, newStatus: Application['status']) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      toast({
        title: "Estado actualizado",
        description: `La aplicación ha sido ${newStatus === 'accepted' ? 'aceptada' : 'rechazada'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la aplicación",
        variant: "destructive"
      });
    }
  };

  const handleViewProfile = (applicantId: string) => {
    navigate(`/talent-profile/${applicantId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cargando aplicaciones...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aún no hay postulantes para esta oportunidad
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${application.user_id}`} />
                  <AvatarFallback>
                    {(application.profiles?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{application.profiles?.full_name || 'Usuario'}</h3>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {application.user_id}
                  </p>

                  <div className="bg-secondary p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium mb-1">Mensaje de aplicación:</p>
                    <p className="text-sm text-foreground">{application.cover_letter || 'Sin mensaje'}</p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Aplicó el {format(new Date(application.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProfile(application.user_id)}
                >
                  Ver Perfil
                </Button>

                {application.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(application.id, 'accepted')}
                    >
                      Aceptar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                    >
                      Rechazar
                    </Button>
                  </>
                )}

                {application.status === 'accepted' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStatusUpdate(application.id, 'rejected')}
                  >
                    Rechazar
                  </Button>
                )}

                {application.status === 'rejected' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(application.id, 'accepted')}
                  >
                    Aceptar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApplicantsList;