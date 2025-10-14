import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Twitter
} from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CompanyDetails = () => {
  const navigate = useNavigate();
  const { activeCompany, refreshCompanies } = useCompany();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('business-data');
  
  // Form data states
  const [businessType, setBusinessType] = useState('');
  const [formData, setFormData] = useState({
    certifications: '',
    remotePolicy: '',
    benefits: ''
  });
  
  // Hiring configuration states
  const [hiringConfig, setHiringConfig] = useState({
    preferredCategories: [] as string[],
    averageBudgetRange: '',
    responsePolicy: '',
    autoResponseTemplate: ''
  });



  // Business types options
  const businessTypes = [
    'Educación digital',
    'E-commerce',
    'SaaS',
    'Consultoría',
    'Marketing Digital',
    'Desarrollo de Software',
    'Fintech',
    'Salud Digital',
    'Inmobiliaria',
    'Alimentación',
    'Retail',
    'Manufactura',
    'Servicios Profesionales',
    'Entretenimiento',
    'Otro'
  ];

  // Remote work policy options
  const remotePolicyOptions = [
    '100% Remoto',
    'Híbrido (3 días oficina, 2 remoto)',
    'Presencial con flexibilidad',
    '100% Presencial'
  ];

  // Job categories for hiring preferences
  const jobCategories = [
    'Ventas',
    'Marketing',
    'Atención al cliente',
    'Operaciones',
    'Creativo',
    'Tecnología y Automatizaciones',
    'Soporte Profesional'
  ];

  // Budget range options
  const budgetRangeOptions = [
    '$500 - $1,500 USD',
    '$1,500 - $3,000 USD',
    '$3,000 - $5,000 USD',
    '$5,000 - $10,000 USD',
    '$10,000+ USD'
  ];

  // Response policy options
  const responsePolicyOptions = [
    'Respuesta automática inmediata',
    'Respuesta manual en 24-48 horas',
    'Respuesta manual en 2-5 días laborales',
    'Solo contactar candidatos seleccionados'
  ];

  useEffect(() => {
    if (activeCompany) {
      setBusinessType(activeCompany.business_type || '');
      // Initialize form data if company has additional data
      setFormData({
        certifications: (activeCompany as any).certifications || '',
        remotePolicy: (activeCompany as any).remote_policy || '',
        benefits: (activeCompany as any).benefits || ''
      });
      
      // Initialize hiring configuration
      setHiringConfig({
        preferredCategories: (activeCompany as any).preferred_categories || [],
        averageBudgetRange: (activeCompany as any).average_budget_range || '',
        responsePolicy: (activeCompany as any).response_policy || '',
        autoResponseTemplate: (activeCompany as any).auto_response_template || ''
      });
    }
  }, [activeCompany]);

  // Helper functions for preferred categories
  const handleCategoryToggle = (category: string) => {
    setHiringConfig(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }));
  };

  const handleSave = async () => {
    if (!activeCompany) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          business_type: businessType,
          certifications: formData.certifications,
          remote_policy: formData.remotePolicy,
          benefits: formData.benefits,
          preferred_categories: hiringConfig.preferredCategories,
          average_budget_range: hiringConfig.averageBudgetRange,
          response_policy: hiringConfig.responsePolicy,
          auto_response_template: hiringConfig.autoResponseTemplate
        })
        .eq('id', activeCompany.id);

      if (error) throw error;
      
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
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="p-8">
            {/* Company Header */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side - Company Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-6">
                  {/* Company Logo */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={activeCompany.logo_url} alt={activeCompany.name} />
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xl font-semibold">
                      {activeCompany.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
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
                    
                    <p className="text-gray-700 mb-4">
                      {activeCompany.description || 'Academia de ventas high ticket. Ayudamos a personas a escapar del 9-5 convirtiéndose en vendedores remotos'}
                    </p>
                    
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
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-11 border-gray-300 hover:bg-gray-50 shadow-sm font-medium"
                      onClick={() => navigate('/business-dashboard/company-profile')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </TooltipTrigger>
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
                Configuración de Contratación
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Business Type */}
                      <div className="lg:col-span-2 mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Tipo de Negocio
                        </label>
                        <Select value={businessType} onValueChange={setBusinessType}>
                          <SelectTrigger className="w-full h-12 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecciona el tipo de negocio" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Políticas de trabajo remoto */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Políticas de trabajo remoto
                        </label>
                        <Select value={formData.remotePolicy} onValueChange={(value) => setFormData(prev => ({ ...prev, remotePolicy: value }))}>
                          <SelectTrigger className="w-full h-12 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecciona la política de trabajo" />
                          </SelectTrigger>
                          <SelectContent>
                            {remotePolicyOptions.map((policy) => (
                              <SelectItem key={policy} value={policy}>
                                {policy}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Certificaciones (una columna completa para que tenga más espacio) */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Certificaciones y acreditaciones
                        </label>
                        <Textarea
                          placeholder="Ej: ISO 9001, Google Partner, Certificación AWS, etc."
                          value={formData.certifications}
                          onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                          className="min-h-[100px] border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Beneficios (una columna completa para que tenga más espacio) */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Beneficios que ofrece la empresa
                        </label>
                        <Textarea
                          placeholder="Ej: Seguro médico, Gym membership, Días libres adicionales, Capacitaciones, etc."
                          value={formData.benefits}
                          onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                          className="min-h-[100px] border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                <Card className="shadow-md border border-gray-200">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Configuración de Contratación
                    </h3>
                    
                    <div className="space-y-8">
                      {/* Categorías Preferidas */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-4">
                          Categorías preferidas para publicar
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {jobCategories.map((category) => (
                            <Badge
                              key={category}
                              variant={hiringConfig.preferredCategories.includes(category) ? "default" : "outline"}
                              className={`cursor-pointer transition-colors ${
                                hiringConfig.preferredCategories.includes(category)
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleCategoryToggle(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Selecciona las categorías en las que tu empresa publica más frecuentemente
                        </p>
                      </div>

                      {/* Presupuesto Promedio */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Presupuesto promedio por oportunidad
                          </label>
                          <Select 
                            value={hiringConfig.averageBudgetRange} 
                            onValueChange={(value) => setHiringConfig(prev => ({ ...prev, averageBudgetRange: value }))}
                          >
                            <SelectTrigger className="w-full h-12 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Selecciona rango de presupuesto" />
                            </SelectTrigger>
                            <SelectContent>
                              {budgetRangeOptions.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Política de Respuesta */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Políticas de respuesta a candidatos
                          </label>
                          <Select 
                            value={hiringConfig.responsePolicy} 
                            onValueChange={(value) => setHiringConfig(prev => ({ ...prev, responsePolicy: value }))}
                          >
                            <SelectTrigger className="w-full h-12 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Selecciona política de respuesta" />
                            </SelectTrigger>
                            <SelectContent>
                              {responsePolicyOptions.map((policy) => (
                                <SelectItem key={policy} value={policy}>
                                  {policy}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Plantilla de Respuesta Automática */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Plantilla de mensaje automático
                        </label>
                        <Textarea
                          placeholder="Ej: Gracias por tu interés en nuestra oportunidad. Hemos recibido tu aplicación y la revisaremos en las próximas 48 horas..."
                          value={hiringConfig.autoResponseTemplate}
                          onChange={(e) => setHiringConfig(prev => ({ ...prev, autoResponseTemplate: e.target.value }))}
                          className="min-h-[120px] border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Este mensaje se enviará automáticamente a los candidatos que apliquen a tus oportunidades
                        </p>
                      </div>

                      {/* Botón de Ver Oportunidades */}
                      <div className="pt-4 border-t border-gray-200">
                        <Button 
                          onClick={() => navigate('/business-dashboard/opportunities')}
                          variant="outline"
                          className="w-full"
                        >
                          Ver Mis Oportunidades Publicadas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

    </div>
    </TooltipProvider>
  );
};

export default CompanyDetails;