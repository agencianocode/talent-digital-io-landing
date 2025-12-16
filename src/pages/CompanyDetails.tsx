import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { stripHtml } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ExternalLink, 
  MapPin, 
  Users, 
  DollarSign, 
  Youtube, 
  Facebook, 
  MessageCircle,
  Edit,
  Linkedin,
  Instagram,
  Twitter,
  ArrowLeft,
  Briefcase,
  Eye,
  UserCheck,
  Share2
} from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOpportunityDashboard } from '@/hooks/useOpportunityDashboard';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesModal } from '@/components/UnsavedChangesModal';

const CompanyDetails = () => {
  const navigate = useNavigate();
  const { activeCompany, refreshCompanies } = useCompany();
  const { opportunities, applicationCounts, isLoading: loadingOpportunities } = useOpportunityDashboard(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('business-data');
  
  // Form data states
  const [formData, setFormData] = useState({
    benefits: '',
    work_culture: '',
    business_impact: '',
    team_values: ''
  });

  // Initial data for comparison
  const [initialData, setInitialData] = useState({
    benefits: '',
    work_culture: '',
    business_impact: '',
    team_values: ''
  });


  useEffect(() => {
    if (activeCompany) {
      const benefitsValue = (activeCompany as any).benefits || '';
      const workCultureValue = (activeCompany as any).work_culture || '';
      const businessImpactValue = (activeCompany as any).business_impact || '';
      const teamValuesValue = (activeCompany as any).team_values || '';
      
      setFormData({
        benefits: benefitsValue,
        work_culture: workCultureValue,
        business_impact: businessImpactValue,
        team_values: teamValuesValue
      });
      
      // Set initial data for comparison
      setInitialData({
        benefits: benefitsValue,
        work_culture: workCultureValue,
        business_impact: businessImpactValue,
        team_values: teamValuesValue
      });
    }
  }, [activeCompany]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      formData.benefits !== initialData.benefits ||
      formData.work_culture !== initialData.work_culture ||
      formData.business_impact !== initialData.business_impact ||
      formData.team_values !== initialData.team_values
    );
  }, [formData, initialData]);

  // Handle save function for unsaved changes
  const handleSaveForNavigation = async () => {
    setIsSaving(true);
    try {
      await handleSave();
    } finally {
      setIsSaving(false);
    }
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setFormData({
      benefits: initialData.benefits,
      work_culture: initialData.work_culture,
      business_impact: initialData.business_impact,
      team_values: initialData.team_values
    });
  };

  // Use unsaved changes hook
  const {
    showModal,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    handleCancel
  } = useUnsavedChanges({
    hasUnsavedChanges,
    onSave: handleSaveForNavigation,
    onDiscard: handleDiscardChanges,
    message: 'Tienes cambios sin guardar en los detalles de la empresa. ¿Quieres guardar antes de salir?'
  });

  const handleSave = async () => {
    if (!activeCompany) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          benefits: formData.benefits,
          work_culture: formData.work_culture,
          business_impact: formData.business_impact,
          team_values: formData.team_values
        } as any)
        .eq('id', activeCompany.id);

      if (error) throw error;
      
      // Update initial data to reflect saved state
      setInitialData({
        benefits: formData.benefits,
        work_culture: formData.work_culture,
        business_impact: formData.business_impact,
        team_values: formData.team_values
      });
      
      toast.success('Datos guardados exitosamente');
      await refreshCompanies();
    } catch (error: any) {
      console.error('Error saving company data:', error);
      toast.error('Error al guardar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No hay empresa activa</h2>
          <p className="text-muted-foreground mb-4">
            Selecciona una empresa o crea una nueva para continuar
          </p>
          <Button onClick={() => navigate('/business-dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/business-dashboard')}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Button>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="p-8">
            {/* Company Header */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side - Company Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-6">
                  {/* Company Logo - Square */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {activeCompany.logo_url ? (
                      <img 
                        src={activeCompany.logo_url} 
                        alt={activeCompany.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-xl font-semibold">
                        {activeCompany.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Company Details */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {activeCompany.name}
                    </h1>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <ExternalLink className="w-4 h-4" />
                      <span>{activeCompany.website || 'Web.com'}</span>
                      <span className="mx-2">🌐</span>
                      <MapPin className="w-4 h-4" />
                      <span>{activeCompany.location || 'Costa Rica'}</span>
                    </div>
                    
                    <div 
                      className="text-foreground/80 mb-4 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: activeCompany.description || 'Academia de ventas high ticket. Ayudamos a personas a escapar del 9-5 convirtiéndose en vendedores remotos' }}
                    />
                    
                    {/* Metrics */}
                    {(activeCompany.employee_count_range || activeCompany.annual_revenue_range) && (
                      <div className="flex items-center gap-6 mb-4">
                        {activeCompany.employee_count_range && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{activeCompany.employee_count_range}</span>
                          </div>
                        )}
                        {activeCompany.annual_revenue_range && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>{activeCompany.annual_revenue_range}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                      {activeCompany.social_links?.linkedin && (
                        <Tooltip content="LinkedIn">
                          <TooltipTrigger asChild>
                            <a 
                              href={activeCompany.social_links.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Linkedin className="w-5 h-5" />
                            </a>
                          </TooltipTrigger>
                        </Tooltip>
                      )}
                      {activeCompany.social_links?.instagram && (
                        <Tooltip content="Instagram">
                          <TooltipTrigger asChild>
                            <a 
                              href={activeCompany.social_links.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700 transition-colors"
                            >
                              <Instagram className="w-5 h-5" />
                            </a>
                          </TooltipTrigger>
                        </Tooltip>
                      )}
                      {activeCompany.social_links?.youtube && (
                        <Tooltip content="YouTube">
                          <TooltipTrigger asChild>
                            <a 
                              href={activeCompany.social_links.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Youtube className="w-5 h-5" />
                            </a>
                          </TooltipTrigger>
                        </Tooltip>
                      )}
                      {activeCompany.social_links?.twitter && (
                        <Tooltip content="Twitter (X)">
                          <TooltipTrigger asChild>
                            <a 
                              href={activeCompany.social_links.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-700 transition-colors"
                            >
                              <Twitter className="w-5 h-5" />
                            </a>
                          </TooltipTrigger>
                        </Tooltip>
                      )}
                      {activeCompany.social_links?.facebook && (
                        <Tooltip content="Facebook">
                          <TooltipTrigger asChild>
                            <a 
                              href={activeCompany.social_links.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Facebook className="w-5 h-5" />
                            </a>
                          </TooltipTrigger>
                        </Tooltip>
                      )}
                      {activeCompany.social_links?.whatsapp && (
                        <Tooltip content="WhatsApp">
                          <TooltipTrigger asChild>
                            <a 
                              href={`https://wa.me/${activeCompany.social_links.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 transition-colors"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </a>
                          </TooltipTrigger>
                        </Tooltip>
                      )}
                      {/* Show message when no social links are configured */}
                      {!activeCompany.social_links?.linkedin && 
                       !activeCompany.social_links?.instagram && 
                       !activeCompany.social_links?.youtube && 
                       !activeCompany.social_links?.twitter && 
                       !activeCompany.social_links?.facebook && 
                       !activeCompany.social_links?.whatsapp && (
                        <span className="text-sm text-gray-500 italic">
                          No hay redes sociales configuradas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[220px]">
                <Tooltip content="Editar información de la empresa">
                  <Button 
                    variant="outline" 
                    className="w-full h-11 border-gray-300 hover:bg-gray-50 hover:text-foreground shadow-sm font-medium"
                    onClick={() => navigate('/business-dashboard/company-profile')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Tooltip>
                
                <Tooltip content="Compartir perfil de empresa">
                  <Button 
                    variant="outline" 
                    className="w-full h-11 border-gray-300 hover:bg-gray-50 hover:text-foreground shadow-sm font-medium"
                    onClick={async () => {
                      if (!activeCompany?.id) {
                        toast.error('No se pudo obtener la información de la empresa');
                        return;
                      }
                      
                      // Use the direct app URL for sharing
                      const shareUrl = `https://app.talentodigital.io/company/${activeCompany.id}`;
                      
                      try {
                        // Copy to clipboard
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(shareUrl);
                          toast.success('Enlace del perfil copiado al portapapeles');
                        } else {
                          // Manual fallback for older browsers
                          const textarea = document.createElement('textarea');
                          textarea.value = shareUrl;
                          textarea.style.position = 'fixed';
                          textarea.style.opacity = '0';
                          document.body.appendChild(textarea);
                          textarea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textarea);
                          toast.success('Enlace del perfil copiado al portapapeles');
                        }
                      } catch (error) {
                        console.error('Error sharing profile:', error);
                        toast.error('No se pudo copiar el enlace. Intenta nuevamente.');
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir Perfil
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-t-xl border-b bg-gray-50 h-auto p-0">
              <TabsTrigger 
                value="business-data" 
                className="rounded-tl-xl border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4 font-medium"
              >
                Datos del negocio
              </TabsTrigger>
              <TabsTrigger 
                value="opportunities" 
                className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4 font-medium"
              >
                Oportunidades Publicadas
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4 font-medium"
              >
                Servicios
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="business-data" className="mt-0">
              <div className="p-8">
                <Card className="shadow-md border border-gray-200">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Beneficios */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Beneficios que ofrece la empresa
                        </label>
                        <RichTextEditor
                          value={formData.benefits}
                          onChange={(value) => setFormData(prev => ({ ...prev, benefits: value }))}
                          placeholder="Ej: Seguro médico, trabajo remoto, días libres adicionales, capacitaciones..."
                        />
                      </div>
                      
                      {/* Cultura de trabajo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          ¿Cómo describirías tu cultura de trabajo?
                        </label>
                        <RichTextEditor
                          value={formData.work_culture}
                          onChange={(value) => setFormData(prev => ({ ...prev, work_culture: value }))}
                          placeholder="Ej: Somos un equipo colaborativo y flexible, valoramos la autonomía y el aprendizaje continuo..."
                        />
                      </div>
                      
                      {/* Impacto del negocio */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          ¿Qué impacto querés generar con tu negocio?
                        </label>
                        <RichTextEditor
                          value={formData.business_impact}
                          onChange={(value) => setFormData(prev => ({ ...prev, business_impact: value }))}
                          placeholder="Ej: Queremos democratizar el acceso a la educación digital y ayudar a personas a alcanzar su máximo potencial..."
                        />
                      </div>
                      
                      {/* Valores del equipo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          ¿Qué valores son innegociables en tu equipo?
                        </label>
                        <RichTextEditor
                          value={formData.team_values}
                          onChange={(value) => setFormData(prev => ({ ...prev, team_values: value }))}
                          placeholder="Ej: Integridad, compromiso con la excelencia, respeto mutuo, innovación..."
                        />
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                      <Button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 shadow-md px-8 py-3 text-base font-medium"
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="opportunities" className="mt-0">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Oportunidades Publicadas</h3>
                    <p className="text-gray-600 mt-1">Gestiona las oportunidades de empleo de tu empresa</p>
                  </div>
                  <Button 
                    onClick={() => navigate('/business-dashboard/opportunities')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Ver Todas
                  </Button>
                </div>

                {loadingOpportunities ? (
                  <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="shadow-md border border-gray-200">
                        <CardContent className="p-6">
                          <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : opportunities.length === 0 ? (
                  <Card className="shadow-md border border-gray-200">
                    <CardContent className="p-12 text-center">
                      <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay oportunidades publicadas
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Comienza publicando tu primera oportunidad de empleo
                      </p>
                      <Button 
                        onClick={() => navigate('/business-dashboard/opportunities')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Crear Oportunidad
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {opportunities.filter(opp => opp.status !== 'draft').map((opportunity) => {
                      const applicantCount = applicationCounts[opportunity.id] || 0;
                      const statusText = opportunity.status === 'active' ? 'Activa' : 
                                        opportunity.status === 'paused' ? 'Pausada' : 
                                        opportunity.status === 'draft' ? 'Borrador' : 'Cerrada';
                      const statusColor = opportunity.status === 'active' ? 'bg-green-100 text-green-800' : 
                                         opportunity.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                                         opportunity.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800';

                      return (
                        <Card key={opportunity.id} className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-xl font-semibold text-gray-900">
                                    {opportunity.title}
                                  </h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                    {statusText}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {opportunity.category && (
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="h-4 w-4" />
                                      {opportunity.category}
                                    </span>
                                  )}
                                  {opportunity.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {opportunity.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/business-dashboard/opportunities/${opportunity.id}/applicants`)}
                              >
                                Ver Detalle
                              </Button>
                            </div>

                            {opportunity.description && (
                              <p className="text-gray-700 mb-4 line-clamp-2">
                                {stripHtml(opportunity.description)}
                              </p>
                            )}

                            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm">
                                <UserCheck className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-gray-900">{applicantCount}</span>
                                <span className="text-gray-600">Postulantes</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Eye className="h-4 w-4 text-gray-600" />
                                <span className="text-gray-600">
                                  Publicada {new Date(opportunity.created_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="services" className="mt-0">
              <div className="p-8">
                <Card className="shadow-md border border-gray-200">
                  <CardContent className="p-8">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Servicios Empresariales
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Configura los servicios que ofrece tu empresa
                      </p>
                      <Button 
                        variant="outline"
                        disabled
                      >
                        Próximamente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showModal}
        onClose={handleCancel}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        isSaving={isSaving}
        message="Tienes cambios sin guardar en los detalles de la empresa. ¿Quieres guardar antes de salir?"
      />
    </div>
    </TooltipProvider>
  );
};

export default CompanyDetails;