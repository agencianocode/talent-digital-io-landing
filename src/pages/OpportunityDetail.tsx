import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreHorizontal, MapPin, DollarSign, Briefcase, Clock, Heart, Send } from "lucide-react";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import { useSupabaseAuth, isTalentRole } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";

const OpportunityDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { userRole } = useSupabaseAuth();
  const { applyToOpportunity, hasApplied, getApplicationStatus } = useSupabaseOpportunities();
  const { isOpportunitySaved, saveOpportunity, unsaveOpportunity } = useSavedOpportunities();
  
  const [opportunity, setOpportunity] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);

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
              industry
            )
          `)
          .eq('id', id)
          .single();

        if (opportunityError) throw opportunityError;
        
        setOpportunity(opportunityData);
        setCompany(opportunityData.companies);
      } catch (error) {
        console.error('Error fetching opportunity:', error);
        toast.error('Error al cargar la oportunidad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const handleApply = async () => {
    if (!opportunity) return;
    
    setIsApplying(true);
    try {
      await applyToOpportunity(opportunity.id, coverLetter);
      toast.success('¡Aplicación enviada exitosamente!');
      setShowApplicationDialog(false);
      setCoverLetter("");
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Error al enviar la aplicación');
    } finally {
      setIsApplying(false);
    }
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

  const applied = hasApplied(opportunity.id);
  const saved = isOpportunitySaved(opportunity.id);
  const applicationStatus = getApplicationStatus(opportunity.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
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
              <Badge variant={opportunity.is_active ? "default" : "secondary"}>
                {opportunity.is_active ? 'ACTIVA' : 'INACTIVA'}
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
            
            {!applied && opportunity.is_active && (
              <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Aplicar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Aplicar a {opportunity.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Carta de Presentación (Opcional)</label>
                      <Textarea
                        placeholder="Cuéntanos por qué eres ideal para esta posición..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="flex-1"
                      >
                        {isApplying ? 'Enviando...' : 'Enviar Aplicación'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowApplicationDialog(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </div>
          </div>

          {opportunity.requirements && (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Requisitos</h2>
              <div className="prose max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {opportunity.requirements}
                </p>
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
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Acerca de la Empresa</h3>
              <div className="space-y-3">
                <h4 className="font-medium">{company.name}</h4>
                {company.description && (
                  <p className="text-sm text-muted-foreground">{company.description}</p>
                )}
                {company.industry && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Industria:</span> {company.industry}
                  </div>
                )}
                {company.website && (
                  <div className="text-sm">
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Sitio web de la empresa
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;