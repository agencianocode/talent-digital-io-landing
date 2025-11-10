import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Briefcase, Clock, Heart, Mail, Linkedin, Instagram, Youtube, Twitter, ExternalLink, GraduationCap } from "lucide-react";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import { useSupabaseAuth, isTalentRole } from "@/contexts/SupabaseAuthContext";
import { useAcademyAffiliations } from "@/hooks/useAcademyAffiliations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useLocation } from "react-router-dom";
import ProfileCompletenessModal from "@/components/ProfileCompletenessModal";
import { useProfileCompleteness } from "@/hooks/useProfileCompleteness";
import ApplicationModal from "@/components/ApplicationModal";
import { FormattedOpportunityText } from "@/lib/markdown-formatter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OpportunityDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, userRole } = useSupabaseAuth();
  const { hasApplied, getApplicationStatus } = useSupabaseOpportunities();
  const { isOpportunitySaved, saveOpportunity, unsaveOpportunity } = useSavedOpportunities();
  const { completeness } = useProfileCompleteness();
  
  // Obtener afiliaciones de academia del talento
  const { affiliations } = useAcademyAffiliations(user?.email);
  const academyIds = affiliations.map(a => a.academy_id);
  
  // Detectar si es una página de invitación
  const isInvitationPage = location.pathname.includes('/opportunity/invite/');
  
  const [opportunity, setOpportunity] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCompletenessModal, setShowCompletenessModal] = useState(false);

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Por Contrato' },
    { value: 'freelance', label: 'Freelance' }
  ];

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data: opportunityData, error: opportunityError } = await supabase
          .from('opportunities')
          .select(`
            *,
            companies (
              name,
              logo_url,
              description,
              website,
              location,
              industry,
              social_links
            )
          `)
          .eq('id', id)
          .single();

        if (opportunityError) throw opportunityError;
        
        setOpportunity(opportunityData);
        setCompany(opportunityData.companies);
        
        // Registrar una vista de oportunidad
        // Solo si el usuario no es el dueño de la empresa
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          try {
            // Verificar si el usuario es el dueño de la empresa
            const { data: companyData } = await supabase
              .from('companies')
              .select('user_id')
              .eq('id', opportunityData.company_id)
              .single();
            
            // Solo registrar vista si NO es el dueño de la empresa
            if (!companyData || companyData.user_id !== currentUser.id) {
              await (supabase as any)
                .from('opportunity_views')
                .insert({ 
                  opportunity_id: opportunityData.id,
                  viewer_id: currentUser.id 
                });
              console.log('✅ Vista registrada para oportunidad:', opportunityData.id);
            }
          } catch (insertErr) {
            console.warn('No se pudo registrar la vista:', insertErr);
          }
        }
      } catch (error) {
        console.error('Error fetching opportunity:', error);
        toast.error('Error al cargar la oportunidad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const handleApplyClick = () => {
    if (!opportunity) return;
    
    // Verificar completitud del perfil antes de mostrar el modal
    const minCompleteness = 60;
    if (completeness < minCompleteness) {
      setShowCompletenessModal(true);
      return;
    }
    
    setShowApplicationModal(true);
  };

  const handleApplicationSent = () => {
    setShowApplicationModal(false);
    window.location.reload();
  };

  const handleSaveToggle = async () => {
    if (!opportunity) return;
    
    try {
      if (isOpportunitySaved(opportunity.id)) {
        await unsaveOpportunity(opportunity.id);
        toast.success('Oportunidad removida de guardados');
      } else {
        await saveOpportunity(opportunity.id);
        toast.success('Oportunidad guardada');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Error al guardar/quitar la oportunidad');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSkeleton type="list" count={5} />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Oportunidad no encontrada</h1>
          <p className="text-muted-foreground mb-4">
            No se pudo encontrar la oportunidad con ID: {id}
          </p>
          <Button onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Validar acceso a oportunidades exclusivas de academia
  const isExclusiveOpportunity = opportunity.is_academy_exclusive;
  const isStudentOfAcademy = academyIds.includes(opportunity.company_id);

  // Si es una oportunidad exclusiva y el talento NO es estudiante, mostrar mensaje
  if (isTalentRole(userRole) && isExclusiveOpportunity && !isStudentOfAcademy) {
    return (
      <div className="p-8">
        <Button 
          onClick={() => navigate('/talent-dashboard/opportunities')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <Alert className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <AlertTitle className="text-lg font-semibold text-purple-900">
              Oportunidad Exclusiva para Estudiantes
            </AlertTitle>
            <AlertDescription className="text-purple-800 mt-2">
              Esta oportunidad es exclusiva para estudiantes y graduados de <strong>{company?.name}</strong>.
              <br /><br />
              Si deseas acceder a oportunidades exclusivas de esta academia, ponte en contacto con ellos 
              para obtener información sobre inscripciones y programas disponibles.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button 
              onClick={() => navigate('/talent-dashboard/opportunities')}
              className="w-full sm:w-auto"
            >
              Ver Otras Oportunidades
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const applied = hasApplied(opportunity.id);
  const saved = isOpportunitySaved(opportunity.id);
  const applicationStatus = getApplicationStatus(opportunity.id);

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-4 sm:py-6">
      {/* Banner de invitación */}
      {isInvitationPage && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Invitación Exclusiva</h3>
              <p className="text-sm text-blue-700">
                Has sido invitado/a directamente a aplicar para esta oportunidad. ¡No te la pierdas!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Breadcrumb */}
      {!isInvitationPage && (
        <div className="mb-4 sm:mb-6">
          <button 
            onClick={() => {
              // Navegación inteligente basada en la ruta
              if (location.pathname.includes('/business-dashboard/opportunities/')) {
                navigate('/business-dashboard/opportunities');
              } else if (location.pathname.includes('/talent-dashboard/opportunities/')) {
                navigate('/talent-dashboard/opportunities');
              } else if (location.pathname.includes('/talent-dashboard/marketplace') || location.pathname.includes('/talent-dashboard/explore')) {
                navigate('/talent-dashboard/explore');
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {opportunity.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {applied && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {applicationStatus || 'Aplicado'}
                </Badge>
              )}
              <Badge variant={opportunity.status === 'active' ? "default" : "secondary"}>
                {opportunity.status === 'active' ? 'ACTIVA' : 'PAUSADA'}
              </Badge>
            </div>
          </div>
          
          {company && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{company.name}</span>
              </div>
              {opportunity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{opportunity.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{jobTypes.find(t => t.value === opportunity.type)?.label || opportunity.type}</span>
              </div>
            </div>
          )}
        </div>
        
        {isTalentRole(userRole) && (
          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSaveToggle}
              className={saved ? "text-red-600 hover:text-red-700" : ""}
            >
              <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            </Button>
            
            {!applied && opportunity.status === 'active' && (
              <Button className="gap-2" onClick={handleApplyClick}>
                Aplicar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Descripción del Trabajo</h2>
            <div className="prose max-w-none">
              <FormattedOpportunityText 
                text={opportunity.description} 
                className="text-foreground leading-relaxed"
              />
            </div>
          </div>

          {opportunity.requirements && (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Requisitos</h2>
              <div className="prose max-w-none">
                <FormattedOpportunityText 
                  text={opportunity.requirements} 
                  className="text-foreground leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Información del Trabajo</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{opportunity.category}</Badge>
              </div>
              
              {opportunity.salary_min && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    ${opportunity.salary_min.toLocaleString()}
                    {opportunity.salary_max && ` - $${opportunity.salary_max.toLocaleString()}`}
                    {` ${opportunity.currency || 'USD'}`}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{jobTypes.find(t => t.value === opportunity.type)?.label || opportunity.type}</span>
              </div>
              
              {opportunity.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunity.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          {company && (
            <div 
              className="bg-card p-6 rounded-lg border cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group"
              onClick={() => navigate(`/company/${opportunity.company_id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/company/${opportunity.company_id}`);
                }
              }}
            >
              <h3 className="text-lg font-semibold mb-4">Acerca de la Empresa</h3>
              <div className="space-y-4">
                {/* Company Logo and Name */}
                <div className="flex items-center gap-3">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={`Logo de ${company.name}`}
                      className="w-12 h-12 rounded-lg object-cover border"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-lg group-hover:text-primary transition-colors">{company.name}</h4>
                    <p className="text-xs text-muted-foreground">Click para ver perfil completo</p>
                  </div>
                </div>

                {company.description && (
                  <p className="text-sm text-muted-foreground">{company.description}</p>
                )}

                {company.industry && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Industria:</span> {company.industry}
                  </div>
                )}

                {/* Social Media Links */}
                {company.social_links && (
                  <div className="flex items-center gap-3">
                    {company.social_links.linkedin && (
                      <a 
                        href={company.social_links.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {company.social_links.instagram && (
                      <a 
                        href={company.social_links.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-pink-600 hover:text-pink-700 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {company.social_links.youtube && (
                      <a 
                        href={company.social_links.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="YouTube"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {company.social_links.twitter && (
                      <a 
                        href={company.social_links.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-400 hover:text-blue-500 transition-colors"
                        title="Twitter"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}

                {company.website && (
                  <div className="text-sm">
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Sitio web de la empresa
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de completitud de perfil */}
      {showCompletenessModal && (
        <ProfileCompletenessModal
          isOpen={showCompletenessModal}
          onClose={() => setShowCompletenessModal(false)}
          minCompletenessRequired={60}
        />
      )}
      
      {/* Modal de aplicación */}
      {showApplicationModal && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          opportunity={opportunity}
          onApplicationSent={handleApplicationSent}
        />
      )}
    </div>
  );
};

export default OpportunityDetail;