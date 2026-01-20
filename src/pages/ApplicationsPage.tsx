import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth, isBusinessRole } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { ApplicationsLoading } from "@/components/ui/enhanced-loading";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { ApplicantCard, ApplicationDetailModal, BulkActionsBar } from "@/components/applications";
import type { ApplicantCardData } from "@/components/applications";
import { sendNotification } from "@/lib/notifications";

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const [applications, setApplications] = useState<ApplicantCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Detail modal state
  const [selectedApplication, setSelectedApplication] = useState<ApplicantCardData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
      fetchApplications();
    },
    onApplicationUpdate: () => {
      fetchApplications();
    },
    enableSound: true
  });

  const fetchApplications = useCallback(async () => {
    if (!activeCompany) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get opportunities for this company
      const { data: opportunitiesData } = await supabase
        .from('opportunities')
        .select('id, title')
        .eq('company_id', activeCompany.id);

      const companyOpportunityIds = (opportunitiesData || []).map(opp => opp.id);
      const opportunityTitles = Object.fromEntries(
        (opportunitiesData || []).map(opp => [opp.id, opp.title])
      );

      if (companyOpportunityIds.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      // Get applications for company opportunities
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('id, user_id, status, created_at, internal_rating, is_viewed, viewed_at, external_form_completed, opportunity_id')
        .in('opportunity_id', companyOpportunityIds)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Enrich with profile data
      const enrichedApplications = await Promise.all(
        (applicationsData || []).map(async (app) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', app.user_id)
            .single();

          return {
            ...app,
            opportunity_title: opportunityTitles[app.opportunity_id],
            profile: profileData || undefined,
          } as ApplicantCardData;
        })
      );

      setApplications(enrichedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error al cargar las aplicaciones');
    } finally {
      setIsLoading(false);
    }
  }, [activeCompany]);

  useEffect(() => {
    if (isBusinessRole(userRole) && activeCompany) {
      fetchApplications();
    } else {
      setIsLoading(false);
    }
  }, [userRole, activeCompany, fetchApplications]);

  // Selection handlers
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Application detail handlers
  const handleOpenDetail = (application: ApplicantCardData) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedApplication(null);
    fetchApplications(); // Refresh to update view status
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/business-dashboard/talent-profile/${userId}`);
  };

  const handleContact = (userId: string) => {
    navigate(`/business-dashboard/messages?recipient=${userId}`);
  };

  const handleStatusChange = async (applicationId: string, status: string, message?: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Get application user_id and opportunity info
      const application = applications.find(app => app.id === applicationId);
      if (application && message) {
        // Send notification with message
        const statusLabels: Record<string, string> = {
          accepted: 'aceptada',
          rejected: 'no seleccionada',
          hired: 'contratado'
        };

        await sendNotification({
          userId: application.user_id,
          type: `application_${status}`,
          title: `Tu aplicación ha sido ${statusLabels[status] || status}`,
          message: message,
          actionUrl: '/talent-dashboard/applications',
        });

        // Also send as a direct message
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          await supabase.from('messages').insert({
            sender_id: userData.user.id,
            recipient_id: application.user_id,
            content: message,
            conversation_id: `app_${applicationId}`,
            message_type: 'application_update',
          });
        }
      }

      toast.success(`Aplicación ${status === 'accepted' ? 'aceptada' : status === 'rejected' ? 'rechazada' : 'actualizada'}`);
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  // Bulk action handlers
  const handleBulkRate = async (rating: number) => {
    try {
      const ids = Array.from(selectedIds);
      
      const { error } = await supabase
        .from('applications')
        .update({ internal_rating: rating })
        .in('id', ids);

      if (error) throw error;

      toast.success(`${ids.length} aplicaciones calificadas con ${rating} estrellas`);
      handleClearSelection();
      fetchApplications();
    } catch (error) {
      console.error('Error bulk rating:', error);
      toast.error('Error al calificar las aplicaciones');
    }
  };

  const handleBulkMessage = async (message: string) => {
    try {
      const ids = Array.from(selectedIds);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        toast.error('Error de autenticación');
        return;
      }

      // Get user_ids for selected applications
      const selectedApps = applications.filter(app => ids.includes(app.id));
      
      // Send message to each user
      for (const app of selectedApps) {
        await supabase.from('messages').insert({
          sender_id: userData.user.id,
          recipient_id: app.user_id,
          content: message,
          conversation_id: `bulk_${Date.now()}`,
          message_type: 'bulk_message',
        });
      }

      toast.success(`Mensaje enviado a ${ids.length} candidatos`);
      handleClearSelection();
    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast.error('Error al enviar los mensajes');
    }
  };

  // Filtering
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.opportunity_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(app => app.status === 'pending').length;

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
            {pendingCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingCount} nuevas
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

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre u oportunidad..."
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
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="reviewed">Revisadas</SelectItem>
            <SelectItem value="accepted">Aceptadas</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
            <SelectItem value="hired">Contratados</SelectItem>
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
        <div className="space-y-2">
          {filteredApplications.map((application) => (
            <ApplicantCard
              key={application.id}
              application={application}
              isSelected={selectedIds.has(application.id)}
              onSelect={handleSelect}
              onClick={handleOpenDetail}
              showOpportunity={true}
            />
          ))}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onBulkRate={handleBulkRate}
        onBulkMessage={handleBulkMessage}
      />

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onStatusChange={handleStatusChange}
        onViewProfile={handleViewProfile}
        onContact={handleContact}
        opportunityTitle={selectedApplication?.opportunity_title}
      />
    </div>
  );
};

export default ApplicationsPage;
