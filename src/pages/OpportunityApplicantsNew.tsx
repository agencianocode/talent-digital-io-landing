import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Briefcase, 
  User, 
  Calendar, 
  Eye, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Filter,
  Star,
  Edit,
  DollarSign,
  Clock,
  MessageSquare,
  MoreVertical,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApplicationRatingDisplay } from '@/components/ApplicationRating/ApplicationRatingDisplay';
import { useApplicationRatings } from '@/hooks/useApplicationRatings';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ApplicationsEmptyState } from '@/components/EmptyStates/ApplicationsEmptyState';
import ShareOpportunity from '@/components/ShareOpportunity';
import OpportunityRecommendedTalents from '@/components/opportunity/OpportunityRecommendedTalents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OpportunityApplicantsNew = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  
  const [opportunity, setOpportunity] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  
  // Estado para expandir cartas de presentación
  const [expandedCoverLetters, setExpandedCoverLetters] = useState<Set<string>>(new Set());
  
  // Estado para selector de estrellas inline
  const [quickRatingAppId, setQuickRatingAppId] = useState<string | null>(null);
  
  const { user } = useSupabaseAuth();
  const { fetchApplicationRatings, createRating, updateRating } = useApplicationRatings();
  
  // Cerrar selector de estrellas al hacer clic fuera
  useEffect(() => {
    if (!quickRatingAppId) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.rating-selector-container')) {
        setQuickRatingAppId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [quickRatingAppId]);
  
  useEffect(() => {
    if (!opportunityId) {
      setError("ID de oportunidad no encontrado");
      setIsLoading(false);
      return;
    }
    
    const fetchData = async () => {
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
            cover_letter,
            resume_url
          `)
          .eq("opportunity_id", opportunityId)
          .order("created_at", { ascending: false });
          
        if (applicationsError) {
          console.error('Applications error:', applicationsError);
          setError("Error al cargar aplicaciones");
        } else {
          // Enriquecer con datos del perfil
          const enrichedApplications = await Promise.all(
            (applicationsData || []).map(async (application) => {
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from("profiles")
                  .select("full_name, avatar_url, position, city, country, linkedin, phone")
                  .eq("user_id", application.user_id)
                  .single();

                // Obtener calificaciones para esta aplicación
                const ratings = await fetchApplicationRatings(application.id);

                return {
                  ...application,
                  profiles: profileError ? null : profileData,
                  ratings: ratings || []
                };
              } catch (error) {
                console.warn('Error fetching data for application:', application.id, error);
                return {
                  ...application,
                  profiles: null,
                  ratings: []
                };
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
    };
    
    fetchData();
  }, [opportunityId]);
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "reviewed": return "Revisado";
      case "accepted": return "Aceptado";
      case "rejected": return "Rechazado";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewProfile = (userId: string) => {
    // Navegar al perfil del talento desde el dashboard de empresa
    navigate(`/business-dashboard/talent-profile/${userId}`);
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", applicationId);

      if (error) throw error;

      // Actualizar el estado local
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      toast.success(`Aplicación ${newStatus === 'accepted' ? 'aceptada' : 'rechazada'} exitosamente`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Error al actualizar el estado de la aplicación');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuickRating = async (applicationId: string, rating: number) => {
    try {
      if (!user) {
        toast.error('Debes estar autenticado para calificar');
        return;
      }

      if (!opportunityId) {
        toast.error('ID de oportunidad no encontrado');
        return;
      }

      if (!fetchApplicationRatings || !createRating || !updateRating) {
        toast.error('Error al inicializar funciones de calificación');
        return;
      }

      const existingRatings = await fetchApplicationRatings(applicationId);
      const userRating = existingRatings?.find((r: any) => r.rated_by_user_id === user.id);
      
      if (userRating) {
        await updateRating(userRating.id, {
          overall_rating: rating,
          criteria_ratings: {},
          recommendation: rating >= 4 ? 'hire' : rating >= 3 ? 'no_hire' : 'strong_no_hire',
        });
      } else {
        await createRating({
          application_id: applicationId,
          overall_rating: rating,
          criteria_ratings: {},
          recommendation: rating >= 4 ? 'hire' : rating >= 3 ? 'no_hire' : 'strong_no_hire',
        });
      }
      
      // Recargar las aplicaciones para mostrar la nueva calificación
      const { data: applicationsData, error: appsError } = await supabase
        .from("applications")
        .select(`
          id, 
          user_id, 
          status, 
          created_at,
          cover_letter,
          resume_url
        `)
        .eq("opportunity_id", opportunityId)
        .order("created_at", { ascending: false });
      
      if (appsError) {
        console.error('Error reloading applications:', appsError);
        toast.error('Error al recargar aplicaciones');
        return;
      }
      
      if (applicationsData) {
        const enrichedApplications = await Promise.all(
          applicationsData.map(async (application) => {
            try {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name, avatar_url, position, city, country, linkedin, phone")
                .eq("user_id", application.user_id)
                .single();

              const ratings = await fetchApplicationRatings(application.id);

              return {
                ...application,
                profiles: profileData,
                ratings: ratings || []
              };
            } catch (error) {
              console.warn('Error fetching data for application:', application.id, error);
              return {
                ...application,
                profiles: null,
                ratings: []
              };
            }
          })
        );
        
        setApplications(enrichedApplications);
      }
      
      setQuickRatingAppId(null);
      toast.success('Calificación guardada');
    } catch (error) {
      console.error('Error saving quick rating:', error);
      toast.error('Error al guardar la calificación');
    }
  };

  // Calcular contadores de filtros
  const filterCounts = useMemo(() => {
    const counts = {
      all: applications.length,
      pending: 0,
      reviewed: 0,
      contacted: 0,
      accepted: 0,
      rejected: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    };

    applications.forEach(app => {
      // Contar por estado
      if (app.status === 'pending') counts.pending++;
      else if (app.status === 'reviewed') counts.reviewed++;
      else if (app.status === 'contacted' || app.contact_status === 'contacted') counts.contacted++;
      else if (app.status === 'accepted') counts.accepted++;
      else if (app.status === 'rejected') counts.rejected++;

      // Contar por calificación promedio
      if (app.ratings && app.ratings.length > 0) {
        const avgRating = app.ratings.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / app.ratings.length;
        const roundedRating = Math.round(avgRating);
        if (roundedRating >= 1 && roundedRating <= 5) {
          counts[`rating${roundedRating}` as keyof typeof counts]++;
        }
      }
    });

    return counts;
  }, [applications]);

  // Filtrar aplicaciones
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Filtro por estado
      if (statusFilter !== 'all') {
        if (statusFilter === 'contacted' && app.contact_status !== 'contacted' && app.status !== 'contacted') {
          return false;
        } else if (statusFilter !== 'contacted' && app.status !== statusFilter) {
          return false;
        }
      }

      // Filtro por calificación
      if (ratingFilter > 0) {
        if (!app.ratings || app.ratings.length === 0) return false;
        const avgRating = app.ratings.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / app.ratings.length;
        const roundedRating = Math.round(avgRating);
        if (roundedRating !== ratingFilter) return false;
      }

      return true;
    });
  }, [applications, statusFilter, ratingFilter]);
  
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicaciones...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oportunidad no encontrada</h1>
          <p className="text-gray-600 mb-6">La oportunidad solicitada no existe.</p>
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

      {/* Detalles de la Oportunidad */}
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

      {/* Sección de Postulaciones */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Postulaciones Recibidas ({filterCounts.all})
        </h2>
      </div>
      
      {/* Filtros */}
      {applications.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                {/* Filtro por Estado */}
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
                  <DropdownMenuContent align="start" className="w-56 bg-background border z-50">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Todos</span>
                        <Badge variant="outline">{filterCounts.all}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Nueva</span>
                        <Badge variant="outline">{filterCounts.pending}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('reviewed')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Vista</span>
                        <Badge variant="outline">{filterCounts.reviewed}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('contacted')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Contactado</span>
                        <Badge variant="outline">{filterCounts.contacted}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Contratado</span>
                        <Badge variant="outline">{filterCounts.accepted}</Badge>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                      <div className="flex items-center justify-between w-full">
                        <span>Rechazado</span>
                        <Badge variant="outline">{filterCounts.rejected}</Badge>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Filtro por Calificación */}
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
                  <DropdownMenuContent align="start" className="w-48 bg-background border z-50">
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

                {/* Indicador de filtros activos */}
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

              {/* Resumen de filtros */}
              <div className="mt-3 text-sm text-muted-foreground">
                Mostrando {filteredApplications.length} de {applications.length} postulaciones
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
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
            <Card key={application.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Avatar y nombre */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <Avatar className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                      <AvatarImage 
                        src={application.profiles?.avatar_url} 
                        alt={application.profiles?.full_name || "Usuario"} 
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-base font-semibold">
                        {application.profiles?.full_name 
                          ? application.profiles.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                          : <User className="w-6 h-6" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                          {application.profiles?.full_name || "Usuario sin nombre"}
                        </h3>
                        <Badge className={`${getStatusColor(application.status)} border-0 text-xs whitespace-nowrap flex-shrink-0 sm:hidden`}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                      
                      {application.profiles?.position && (
                        <p className="text-sm sm:text-base text-gray-600 font-medium mb-2">
                          {application.profiles.position}
                        </p>
                      )}
                      
                      {/* Información de contacto */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Aplicó el {formatDate(application.created_at)}</span>
                        </div>
                        {(application.profiles?.city || application.profiles?.country) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>
                              {[application.profiles?.city, application.profiles?.country]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                        {application.profiles?.phone && (
                          <div className="flex items-center gap-1">
                            <span>📱</span>
                            <span>{application.profiles.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Badge en desktop */}
                  <Badge className={`${getStatusColor(application.status)} border-0 text-xs whitespace-nowrap hidden sm:block`}>
                    {getStatusText(application.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* LinkedIn y Carta de presentación en desktop lado a lado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* LinkedIn */}
                    {application.profiles?.linkedin && (
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">LinkedIn:</p>
                        <a 
                          href={application.profiles.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm break-all hover:underline"
                        >
                          {application.profiles.linkedin}
                        </a>
                      </div>
                    )}

                    {/* Carta de presentación */}
                    {application.cover_letter && (
                      <div className={application.profiles?.linkedin ? '' : 'sm:col-span-2'}>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Carta de presentación:</p>
                        <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                          <p className={`text-xs sm:text-sm text-gray-700 whitespace-pre-wrap ${!expandedCoverLetters.has(application.id) ? 'line-clamp-3' : ''}`}>
                            {application.cover_letter}
                          </p>
                          {application.cover_letter.length > 150 && (
                            <button
                              onClick={() => {
                                setExpandedCoverLetters(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(application.id)) {
                                    newSet.delete(application.id);
                                  } else {
                                    newSet.add(application.id);
                                  }
                                  return newSet;
                                });
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                            >
                              {expandedCoverLetters.has(application.id) ? 'Ver menos' : 'Ver más'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mostrar calificaciones si existen */}
                  {application.ratings && application.ratings.length > 0 && (
                    <>
                      <Separator className="my-3 sm:my-4" />
                      <ApplicationRatingDisplay 
                        ratings={application.ratings.map((rating: any) => ({
                          id: rating.id,
                          overallRating: rating.overall_rating || 0,
                          criteriaRatings: rating.criteria_ratings || {},
                          comments: rating.comments || '',
                          recommendation: rating.recommendation || 'no_hire',
                          ratedBy: {
                            name: rating.rated_by?.full_name || 'Usuario',
                            avatar: rating.rated_by?.avatar_url || undefined
                          },
                          ratedAt: rating.created_at || new Date().toISOString()
                        }))} 
                      />
                    </>
                  )}

                  <Separator className="my-3 sm:my-4" />

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Botones de acción principales */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(application.user_id)}
                        className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-9"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Ver Perfil Completo</span>
                        <span className="sm:hidden">Perfil</span>
                      </Button>
                      
                      {application.resume_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(application.resume_url, '_blank')}
                          className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-9"
                        >
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          Ver CV
                        </Button>
                      )}

                      {/* Selector de estrellas inline */}
                      <div className="relative rating-selector-container">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuickRatingAppId(quickRatingAppId === application.id ? null : application.id)}
                          className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-9 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                        >
                          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Calificar</span>
                        </Button>
                        
                        {quickRatingAppId === application.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const currentRating = application.ratings?.[0]?.overall_rating || 0;
                              return (
                                <button
                                  key={star}
                                  onClick={() => handleQuickRating(application.id, star)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title={`${star} estrella${star > 1 ? 's' : ''}`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= currentRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de estado a la derecha */}
                    <div className="flex flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigate(`/business-dashboard/messages?user=${application.user_id}`);
                        }}
                        className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-9"
                      >
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        Contactar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newStatus = application.status === 'reviewed' ? 'pending' : 'reviewed';
                          handleUpdateStatus(application.id, newStatus);
                        }}
                        className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-9"
                      >
                        {application.status === 'reviewed' ? (
                          <>
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Desmarcar como Revisada</span>
                            <span className="sm:hidden">No Revisada</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Marcar como Revisada</span>
                            <span className="sm:hidden">Revisada</span>
                          </>
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-9"
                          >
                            <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Opciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(application.id, 'accepted')}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar aplicación Aceptada
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(application.id, 'accepted')}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Contratado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OpportunityApplicantsNew;
