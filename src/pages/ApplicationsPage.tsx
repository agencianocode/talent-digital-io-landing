import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth, isBusinessRole } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, MessageSquare, Calendar, Settings, CheckCircle2, XCircle, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ApplicationsLoading } from "@/components/ui/enhanced-loading";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

interface Application {
  id: string;
  opportunity_id: string;
  user_id: string;
  cover_letter: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  } | null;
  opportunities: {
    title: string;
    company_id: string;
  } | null;
}

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();
  const { activeCompany, hasPermission } = useCompany();
  const { updateApplicationStatus } = useSupabaseOpportunities();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calcular estadísticas por estado
  const statusCounts = {
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    contacted: applications.filter(app => app.status === 'contacted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    hired: applications.filter(app => app.status === 'hired').length,
  };

  // Handle URL filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, []);

  // Setup real-time notifications and updates
  useRealTimeNotifications({
    onNewApplication: () => {
      // Refresh applications list when new one arrives
      fetchApplications();
    },
    onApplicationUpdate: () => {
      // Refresh when applications are updated
      fetchApplications();
    },
    enableSound: true
  });

  useEffect(() => {
    if (isBusinessRole(userRole)) {
      if (activeCompany) {
        fetchApplications();
      } else {
        setIsLoading(false);
      }
    }
  }, [userRole, activeCompany]);

  const fetchApplications = async () => {
    if (!activeCompany) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get applications and related data separately to avoid join issues
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Get opportunities for this company
      const { data: opportunitiesData } = await supabase
        .from('opportunities')
        .select('id, title, company_id')
        .eq('company_id', activeCompany.id);

      // Filter applications for this company's opportunities
      const companyOpportunityIds = (opportunitiesData || []).map(opp => opp.id);
      const companyApplications = (applicationsData || []).filter(app => 
        companyOpportunityIds.includes(app.opportunity_id)
      );

      // Enrich with profile and opportunity data
      const enrichedApplications = await Promise.all(
        companyApplications.map(async (app) => {
          const [profileResult, opportunityResult] = await Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('user_id', app.user_id).single(),
            supabase.from('opportunities').select('title, company_id').eq('id', app.opportunity_id).single()
          ]);

          return {
            ...app,
            profiles: profileResult.data || null,
            opportunities: opportunityResult.data || null
          };
        })
      );

      setApplications(enrichedApplications as Application[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error al cargar las aplicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      toast.success(`Estado actualizado a ${getStatusText(newStatus)}`);
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'reviewed':
        return "bg-blue-100 text-blue-800";
      case 'contacted':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'hired':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En revisión';
      case 'reviewed':
        return 'Revisada';
      case 'contacted':
        return 'Contactado';
      case 'rejected':
        return 'Rechazado';
      case 'hired':
        return 'Contratado';
      default:
        return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.opportunities?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cover_letter?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!isBusinessRole(userRole)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los usuarios de empresa pueden acceder a esta página.</p>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <h1 className="text-2xl font-bold mb-4">Configura tu Empresa</h1>
          <p>Necesitas configurar una empresa para ver las aplicaciones.</p>
        </div>
        <Button onClick={() => navigate('/register-business')}>
          Crear Empresa
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <ApplicationsLoading />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            Aplicaciones Recibidas
            {statusCounts.pending > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {statusCounts.pending} nuevas
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las aplicaciones de talento a tus oportunidades
          </p>
        </div>
        <Button 
          onClick={() => navigate('/business-dashboard/opportunities')}
          variant="outline"
        >
          Ver Oportunidades
        </Button>
      </div>

      {/* Estadísticas rápidas por estado */}
      {hasPermission('admin') && applications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`p-3 rounded-lg border-2 transition-all ${
              statusFilter === 'pending'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</span>
            </div>
            <p className="text-xs text-muted-foreground text-left">En revisión</p>
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`p-3 rounded-lg border-2 transition-all ${
              statusFilter === 'reviewed'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{statusCounts.reviewed}</span>
            </div>
            <p className="text-xs text-muted-foreground text-left">Revisadas</p>
          </button>
          <button
            onClick={() => setStatusFilter('contacted')}
            className={`p-3 rounded-lg border-2 transition-all ${
              statusFilter === 'contacted'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{statusCounts.contacted}</span>
            </div>
            <p className="text-xs text-muted-foreground text-left">Contactados</p>
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`p-3 rounded-lg border-2 transition-all ${
              statusFilter === 'rejected'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{statusCounts.rejected}</span>
            </div>
            <p className="text-xs text-muted-foreground text-left">Rechazados</p>
          </button>
          <button
            onClick={() => setStatusFilter('hired')}
            className={`p-3 rounded-lg border-2 transition-all ${
              statusFilter === 'hired'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{statusCounts.hired}</span>
            </div>
            <p className="text-xs text-muted-foreground text-left">Contratados</p>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre, oportunidad o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados ({applications.length})</SelectItem>
            <SelectItem value="pending">En revisión ({statusCounts.pending})</SelectItem>
            <SelectItem value="reviewed">Revisadas ({statusCounts.reviewed})</SelectItem>
            <SelectItem value="contacted">Contactados ({statusCounts.contacted})</SelectItem>
            <SelectItem value="rejected">Rechazados ({statusCounts.rejected})</SelectItem>
            <SelectItem value="hired">Contratados ({statusCounts.hired})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {applications.length === 0 
              ? 'No hay aplicaciones recibidas aún'
              : 'No se encontraron aplicaciones con los filtros aplicados'
            }
          </div>
          {applications.length === 0 && (
            <Button onClick={() => navigate('/business-dashboard/opportunities/new')}>
              Publicar Primera Oportunidad
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.profiles?.avatar_url} />
                      <AvatarFallback>
                        {application.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {application.profiles?.full_name || 'Usuario'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Aplicó a: {application.opportunities?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(application.created_at), 'dd MMM yyyy', { locale: es })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadgeClass(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                      {hasPermission('admin') && (
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleStatusUpdate(application.id, value)}
                        >
                          <SelectTrigger className="w-48 border-2 border-primary/20 hover:border-primary/40 bg-background">
                            <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En revisión</SelectItem>
                            <SelectItem value="reviewed">Revisada</SelectItem>
                            <SelectItem value="contacted">Contactado</SelectItem>
                            <SelectItem value="rejected">Rechazado</SelectItem>
                            <SelectItem value="hired">Contratado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Mensaje de aplicación:</h4>
                  <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                    {application.cover_letter || 'Sin mensaje'}
                  </p>
                </div>
                
                {/* Sección de Gestión de Estado - Más visible */}
                {hasPermission('admin') && (
                  <div className="mb-4 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Cambiar Estado de la Aplicación
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Actualiza el estado de esta aplicación
                        </p>
                      </div>
                      <Select
                        value={application.status}
                        onValueChange={(value) => handleStatusUpdate(application.id, value)}
                      >
                        <SelectTrigger className="w-56 bg-background border-2 border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En revisión</SelectItem>
                          <SelectItem value="reviewed">Revisada</SelectItem>
                          <SelectItem value="contacted">Contactado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                          <SelectItem value="hired">Contratado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Botones de acción rápida */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(application.id, 'reviewed')}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Marcar como Revisada
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(application.id, 'contacted')}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Contactar
                          </Button>
                        </>
                      )}
                      {application.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Rechazar
                        </Button>
                      )}
                      {application.status !== 'hired' && application.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(application.id, 'hired')}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Contratar
                        </Button>
                      )}
                      {application.status === 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(application.id, 'pending')}
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Volver a Revisión
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Acciones de navegación */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/business-dashboard/talent-profile/${application.user_id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Perfil Completo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleStatusUpdate(application.id, 'contacted');
                      // Aquí podrías abrir un modal de contacto o redirigir a un chat
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage; 