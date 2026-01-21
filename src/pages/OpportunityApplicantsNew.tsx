import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin,
  Filter,
  Star,
  Edit,
  DollarSign,
  Clock,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApplicationsEmptyState } from '@/components/EmptyStates/ApplicationsEmptyState';
import ShareOpportunity from '@/components/ShareOpportunity';
import OpportunityRecommendedTalents from '@/components/opportunity/OpportunityRecommendedTalents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicantCard, ApplicationDetailModal, BulkActionsBar } from "@/components/applications";
import type { ApplicantCardData } from "@/components/applications";


const OpportunityApplicantsNew = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  
  const [opportunity, setOpportunity] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicantCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Detail modal state
  const [selectedApplication, setSelectedApplication] = useState<ApplicantCardData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!opportunityId) {
      setError("ID de oportunidad no encontrado");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data: opportunityData, error: opportunityError } = await supabase
        .from("opportunities")
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            description,
            industry
          )
        `)
        .eq("id", opportunityId)
        .single();
        
      if (opportunityError) {
        setError("Oportunidad no encontrada");
        return;
      }
      
      setOpportunity(opportunityData);
      setCompany(opportunityData.companies);
      
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("applications")
        .select(`
          id, 
          user_id, 
          status, 
          created_at,
          internal_rating,
          is_viewed,
          viewed_at,
          external_form_completed,
          opportunity_id
        `)
        .eq("opportunity_id", opportunityId)
        .order("created_at", { ascending: false });
        
      if (applicationsError) {
        console.error('Applications error:', applicationsError);
        setError("Error al cargar aplicaciones");
      } else {
        // Enrich with profile data
        const enrichedApplications = await Promise.all(
          (applicationsData || []).map(async (application) => {
            try {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("user_id", application.user_id)
                .single();

              return {
                ...application,
                profile: profileData || undefined,
              } as ApplicantCardData;
            } catch (error) {
              console.warn('Error fetching profile for application:', application.id, error);
              return {
                ...application,
                profile: undefined,
              } as ApplicantCardData;
            }
          })
        );
        
        setApplications(enrichedApplications);
      }
      
    } catch (error) {
      setError("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  }, [opportunityId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    // Actualizar estado local sin recargar para mejor UX
    if (selectedApplication) {
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id 
          ? { 
              ...app, 
              is_viewed: true, 
              status: app.status === 'pending' ? 'reviewed' : app.status 
            }
          : app
      ));
    }
    setIsDetailModalOpen(false);
    setSelectedApplication(null);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/business-dashboard/talent-profile/${userId}`);
  };

  const handleContact = (userId: string) => {
    navigate(`/business-dashboard/messages?user=${userId}`);
  };

  // SIMPLIFIED: The modal (ApplicationDetailModal) handles DB updates and notifications
  // This callback only refreshes the UI after the modal completes its work
  const handleStatusChange = async (applicationId: string, status: string, _message?: string) => {
    console.log('[OpportunityApplicantsNew.handleStatusChange] Called - UI refresh only', { applicationId, status });
    toast.success(`Aplicación ${status === 'accepted' ? 'aceptada' : status === 'rejected' ? 'rechazada' : 'actualizada'}`);
    fetchData();
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
      fetchData();
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

      const selectedApps = applications.filter(app => ids.includes(app.id));
      
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

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts = {
      all: applications.length,
      pending: 0,
      reviewed: 0,
      contacted: 0,
      accepted: 0,
      rejected: 0,
      hired: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    };

    applications.forEach(app => {
      if (app.status === 'pending') counts.pending++;
      else if (app.status === 'reviewed') counts.reviewed++;
      else if (app.status === 'contacted') counts.contacted++;
      else if (app.status === 'accepted') counts.accepted++;
      else if (app.status === 'rejected') counts.rejected++;
      else if (app.status === 'hired') counts.hired++;

      const rating = app.internal_rating || 0;
      if (rating >= 1 && rating <= 5) {
        counts[`rating${rating}` as keyof typeof counts]++;
      }
    });

    return counts;
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }

      if (ratingFilter > 0) {
        const rating = app.internal_rating || 0;
        if (rating !== ratingFilter) return false;
      }

      return true;
    });
  }, [applications, statusFilter, ratingFilter]);
  
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando aplicaciones...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/business-dashboard/opportunities")}>
            Volver a Oportunidades
          </Button>
        </div>
      </div>
    );
  }
  
  if (!opportunity) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Oportunidad no encontrada</h1>
          <p className="text-muted-foreground mb-6">La oportunidad solicitada no existe.</p>
          <Button onClick={() => navigate("/business-dashboard/opportunities")}>
            Volver a Oportunidades
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/business-dashboard/opportunities")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Oportunidades
        </Button>
      </div>

      {/* Opportunity Details Card */}
      <Card className="mb-6">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {company?.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {opportunity.title}
                    </h1>
                    <p className="text-muted-foreground">{company?.name}</p>
                  </div>
                  <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                    {opportunity.status === 'active' ? 'Activa' : 'Pausada'}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {opportunity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{opportunity.location}</span>
                    </div>
                  )}
                  {opportunity.type && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{opportunity.type}</span>
                    </div>
                  )}
                  {opportunity.salary_min && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        ${opportunity.salary_min.toLocaleString()}
                        {opportunity.salary_max && ` - $${opportunity.salary_max.toLocaleString()}`}
                        {` ${opportunity.currency || 'USD'}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/business-dashboard/opportunities/${opportunityId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Oportunidad
            </Button>
            <ShareOpportunity 
              opportunityId={opportunityId || ''}
              opportunityTitle={opportunity.title}
              variant="button"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/business-dashboard/company-profile')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Editar Perfil de Empresa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Postulaciones Recibidas ({filterCounts.all})
        </h2>
      </div>
      
      {/* Filters */}
      {applications.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Estado
                      {statusFilter !== 'all' && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {filterCounts[statusFilter as keyof typeof filterCounts]}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Todos</span>
                        <Badge variant="outline">{filterCounts.all}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Pendiente</span>
                        <Badge variant="outline">{filterCounts.pending}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('reviewed')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Revisada</span>
                        <Badge variant="outline">{filterCounts.reviewed}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Aceptada</span>
                        <Badge variant="outline">{filterCounts.accepted}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Rechazada</span>
                        <Badge variant="outline">{filterCounts.rejected}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('hired')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Contratado</span>
                        <Badge variant="outline">{filterCounts.hired}</Badge>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Rating Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Star className="w-4 h-4" />
                      Calificación
                      {ratingFilter > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {ratingFilter}⭐
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => setRatingFilter(0)}>
                      <div className="flex items-center justify-between w-full">
                        <span>Todas</span>
                      </div>
                    </DropdownMenuItem>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <DropdownMenuItem key={rating} onClick={() => setRatingFilter(rating)}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <Badge variant="outline">
                            {filterCounts[`rating${rating}` as keyof typeof filterCounts]}
                          </Badge>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear filters */}
                {(statusFilter !== 'all' || ratingFilter > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all');
                      setRatingFilter(0);
                    }}
                    className="text-muted-foreground"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                Mostrando {filteredApplications.length} de {applications.length} postulaciones
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-2">
        {applications.length === 0 ? (
          <>
            <ApplicationsEmptyState
              opportunityTitle={opportunity.title}
              opportunityId={opportunityId || ''}
            />
            {opportunityId && (
              <OpportunityRecommendedTalents opportunityId={opportunityId} />
            )}
          </>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay postulaciones con estos filtros
              </h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar los filtros para ver más resultados
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setRatingFilter(0);
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <ApplicantCard
              key={application.id}
              application={application}
              isSelected={selectedIds.has(application.id)}
              onSelect={handleSelect}
              onClick={handleOpenDetail}
              showOpportunity={false}
            />
          ))
        )}
      </div>

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
        opportunityTitle={opportunity?.title}
      />
    </div>
  );
};

export default OpportunityApplicantsNew;
