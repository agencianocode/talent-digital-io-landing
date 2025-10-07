import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Briefcase, User, Mail, Calendar, Eye, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OpportunityApplicantsNew = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  
  const [opportunity, setOpportunity] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
          .select("id, title, status")
          .eq("id", opportunityId)
          .single();
          
        if (opportunityError) {
          setError("Oportunidad no encontrada");
          return;
        }
        
        setOpportunity(opportunityData);
        
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

                console.log('Profile query for user:', application.user_id, {
                  profileData,
                  profileError
                });

                return {
                  ...application,
                  profiles: profileError ? null : profileData
                };
              } catch (error) {
                console.warn('Error fetching profile for user:', application.user_id, error);
                return {
                  ...application,
                  profiles: null
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
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/business-dashboard/opportunities")}
          className="mb-3 sm:mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
            Postulantes para: {opportunity.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 truncate">ID: {opportunity.id}</p>
        </div>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="text-gray-500 mb-4">
                <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                <p className="text-sm sm:text-base">No hay aplicaciones para esta oportunidad</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                      <AvatarImage 
                        src={application.profiles?.avatar_url} 
                        alt={application.profiles?.full_name || "Usuario"} 
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-base sm:text-lg font-semibold">
                        {application.profiles?.full_name 
                          ? application.profiles.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                          : <User className="w-6 h-6 sm:w-8 sm:h-8" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900">
                        {application.profiles?.full_name || "Usuario sin nombre"}
                      </h3>
                      {application.profiles?.position && (
                        <p className="text-sm sm:text-base text-gray-600 font-medium truncate">
                          {application.profiles.position}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1 gap-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">Aplicó el {formatDate(application.created_at)}</span>
                        </div>
                        {(application.profiles?.city || application.profiles?.country) && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {[application.profiles?.city, application.profiles?.country]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:text-right">
                    <Badge className={`${getStatusColor(application.status)} border-0 text-xs whitespace-nowrap`}>
                      {getStatusText(application.status)}
                    </Badge>
                    {application.profiles?.phone && (
                      <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        📱 {application.profiles.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 p-4 sm:p-6">
                {/* Información de contacto */}
                {application.profiles?.linkedin && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">LinkedIn:</p>
                    <a 
                      href={application.profiles.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm break-all"
                    >
                      {application.profiles.linkedin}
                    </a>
                  </div>
                )}

                {/* Carta de presentación */}
                {application.cover_letter && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Carta de presentación:</p>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700">
                        {application.cover_letter.length > 150 
                          ? `${application.cover_letter.substring(0, 150)}...` 
                          : application.cover_letter
                        }
                      </p>
                    </div>
                  </div>
                )}

                <Separator className="my-3 sm:my-4" />

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(application.user_id)}
                      className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      Ver Perfil Completo
                    </Button>
                    
                    {application.resume_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.resume_url, '_blank')}
                        className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        Ver CV
                      </Button>
                    )}
                  </div>

                  {application.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(application.id, 'accepted')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Aceptar
                      </Button>
                    </div>
                  )}
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
