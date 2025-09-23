import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ExternalLink, 
  MapPin, 
  Users, 
  DollarSign, 
  Youtube, 
  Facebook, 
  MessageCircle,
  Camera,
  VideoIcon,
  Edit
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
    dato1: '',
    dato2: ''
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

  useEffect(() => {
    if (activeCompany) {
      setBusinessType(activeCompany.business_type || '');
      // Initialize form data if company has additional data
      setFormData({
        dato1: '',
        dato2: ''
      });
    }
  }, [activeCompany]);

  const handleSave = async () => {
    if (!activeCompany) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          business_type: businessType,
          // Add other fields as needed
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
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
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{activeCompany.employee_count_range || '10-50 empleados'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{activeCompany.annual_revenue_range || '500k-2M anual'}</span>
                      </div>
                    </div>
                    
                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                      {activeCompany.social_links?.youtube && (
                        <a 
                          href={activeCompany.social_links.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Youtube className="w-5 h-5" />
                        </a>
                      )}
                      {activeCompany.social_links?.facebook && (
                        <a 
                          href={activeCompany.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {activeCompany.social_links?.whatsapp && (
                        <a 
                          href={`https://wa.me/${activeCompany.social_links.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Agregar redes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/business-dashboard/profile')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button variant="outline" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Carga fotos
                </Button>
                <Button variant="outline" className="w-full">
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Link a video de Youtube
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
              <TabsTrigger 
                value="business-data" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Datos del negocio
              </TabsTrigger>
              <TabsTrigger 
                value="opportunities" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Oportunidades
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Servicios
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="business-data" className="mt-0">
              <div className="p-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Business Type */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Negocio
                        </label>
                        <Select value={businessType} onValueChange={setBusinessType}>
                          <SelectTrigger className="w-full">
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
                      
                      {/* Form Fields */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dato 1
                        </label>
                        <Input
                          placeholder="Dato"
                          value={formData.dato1}
                          onChange={(e) => setFormData(prev => ({ ...prev, dato1: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dato 1
                        </label>
                        <Input
                          placeholder="Escribe"
                          value={formData.dato2}
                          onChange={(e) => setFormData(prev => ({ ...prev, dato2: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="opportunities" className="mt-0">
              <div className="p-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Gestión de Oportunidades
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Administra las oportunidades de trabajo de tu empresa
                      </p>
                      <Button 
                        onClick={() => navigate('/business-dashboard/opportunities')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Ver Mis Oportunidades
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="services" className="mt-0">
              <div className="p-6">
                <Card>
                  <CardContent className="p-6">
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
  );
};

export default CompanyDetails;