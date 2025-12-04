import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building, 
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useMarketplaceServices } from '@/hooks/useMarketplaceServices';
import { NEW_MARKETPLACE_CATEGORIES } from '@/lib/marketplace-constants';

interface PublishServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PublishServiceForm {
  // Common fields
  serviceType: string;
  description: string;
  
  // Premium user fields (for direct service creation)
  title: string;
  priceMin: string;
  priceMax: string;
  deliveryTime: string;
  location: string;
  publishAsCompany: boolean; // true = a nombre de empresa, false = a nombre personal
  
  // Freemium user fields (for publishing request)
  companyName: string;
  freemiumPriceMin: string;
  freemiumPriceMax: string;
  timeline: string;
}

const PublishServiceModal: React.FC<PublishServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, user, profile } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const { myRequests, loadMyRequests } = useMarketplaceServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPendingRequestDialog, setShowPendingRequestDialog] = useState(false);
  const [formData, setFormData] = useState<PublishServiceForm>({
    // Common
    serviceType: '',
    description: '',
    // Premium
    title: '',
    priceMin: '',
    priceMax: '',
    deliveryTime: '',
    location: '',
    publishAsCompany: false, // Por defecto a nombre personal
    // Freemium
    companyName: '',
    freemiumPriceMin: '',
    freemiumPriceMax: '',
    timeline: ''
  });

  // Verificar si es usuario Freemium o Premium
  const isFreemiumUser = userRole === 'freemium_business' || userRole === 'freemium_talent';
  const isFreemiumBusiness = userRole === 'freemium_business';
  const isPremiumUser = userRole === 'premium_business' || userRole === 'premium_talent' || userRole === 'academy_premium';
  
  // Verificar si es empresa o academia (pueden publicar a nombre de empresa)
  const isBusinessOrAcademy = userRole === 'premium_business' || userRole === 'academy_premium' || userRole === 'freemium_business';
  
  // Verificar si hay una solicitud pendiente
  const hasPendingRequest = myRequests.some(request => request.status === 'pending');
  
  // Cargar solicitudes cuando se abre el modal y verificar si hay pendiente
  useEffect(() => {
    if (isOpen && isFreemiumUser) {
      const checkPendingRequests = async () => {
        // Cargar solicitudes primero
        await loadMyRequests();
        
        // Obtener solicitudes directamente para verificar
        const { marketplaceService } = await import('@/services/marketplaceService');
        const requests = await marketplaceService.getMyPublishingRequests();
        const pending = requests.some(request => request.status === 'pending');
        
        if (pending) {
          setShowPendingRequestDialog(true);
          // Cerrar el modal del formulario si hay solicitud pendiente
          onClose();
        }
      };
      checkPendingRequests();
    }
  }, [isOpen, isFreemiumUser, loadMyRequests, onClose]);

  const serviceTypes = NEW_MARKETPLACE_CATEGORIES.map(name => ({
    value: name,
    label: name
  }));

  const timelineOptions = [
    { value: '1-2 semanas', label: 'Urgente (1-2 semanas)' },
    { value: '1 mes', label: 'Rápido (1 mes)' },
    { value: '2-3 meses', label: 'Normal (2-3 meses)' },
    { value: '3-6 meses', label: 'Flexible (3-6 meses)' }
  ];

  const handleInputChange = (field: keyof PublishServiceForm, value: string | boolean) => {
    // Handle boolean values specially
    if (field === 'publishAsCompany') {
      setFormData(prev => ({
        ...prev,
        publishAsCompany: value === 'true' || value === true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar si hay una solicitud pendiente (solo para usuarios Freemium)
    if (isFreemiumUser && hasPendingRequest) {
      setShowPendingRequestDialog(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { marketplaceService } = await import('@/services/marketplaceService');
      const { supabase } = await import('@/integrations/supabase/client');
      
      if (isPremiumUser) {
        // Premium users: Create service directly
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        
        // Determinar si se publica a nombre de empresa o personal
        const companyId = (formData.publishAsCompany && activeCompany?.id) ? activeCompany.id : null;
        
        // Calcular precio promedio para campo legacy
        const priceMin = parseFloat(formData.priceMin);
        const priceMax = parseFloat(formData.priceMax);
        const averagePrice = (priceMin + priceMax) / 2;
        
        await marketplaceService.createService(user.id, {
          title: formData.title,
          description: formData.description,
          category: formData.serviceType,
          price: averagePrice, // Campo legacy para compatibilidad
          price_min: priceMin,
          price_max: priceMax,
          currency: 'USD',
          delivery_time: formData.deliveryTime,
          location: formData.location,
          is_available: true,
          tags: [],
          company_id: companyId
        });
        
        setIsSubmitted(true);
        
        toast({
          title: "¡Servicio publicado!",
          description: "Tu servicio ya está visible en el marketplace.",
        });
      } else {
        // Freemium users: Submit publishing request
        // Obtener datos del perfil del usuario automáticamente
        const contactName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario';
        const contactEmail = user?.email || '';
        const contactPhone = profile?.phone || '';
        const companyName = isFreemiumBusiness 
          ? (formData.companyName || activeCompany?.name || '')
          : (profile?.full_name || contactName);

        // Crear string de presupuesto con el rango
        const budgetRange = formData.freemiumPriceMin && formData.freemiumPriceMax
          ? `$${formData.freemiumPriceMin} - $${formData.freemiumPriceMax} USD`
          : 'No especificado';

        await marketplaceService.createPublishingRequest({
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || undefined,
          company_name: companyName,
          service_type: formData.serviceType,
          budget: budgetRange,
          timeline: formData.timeline,
          description: formData.description,
          requirements: undefined
        });
        
        setIsSubmitted(true);
        
        toast({
          title: "Solicitud enviada exitosamente",
          description: "Tu solicitud ha sido enviada. Un administrador se pondrá en contacto contigo para ofrecerte opciones Premium.",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Hubo un problema. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      serviceType: '',
      description: '',
      title: '',
      priceMin: '',
      priceMax: '',
      deliveryTime: '',
      location: '',
      publishAsCompany: false,
      companyName: '',
      freemiumPriceMin: '',
      freemiumPriceMax: '',
      timeline: ''
    });
    setIsSubmitted(false);
    onClose();
  };

  const isFormValid = isPremiumUser
    ? formData.title.trim() !== '' &&
      formData.serviceType !== '' &&
      formData.priceMin.trim() !== '' &&
      formData.priceMax.trim() !== '' &&
      formData.deliveryTime !== '' &&
      formData.location.trim() !== '' &&
      formData.description.trim() !== ''
    : (isFreemiumBusiness ? (formData.companyName.trim() !== '' || activeCompany?.name) : true) &&
      formData.serviceType !== '' &&
      formData.freemiumPriceMin.trim() !== '' &&
      formData.freemiumPriceMax.trim() !== '' &&
      formData.timeline !== '' &&
      formData.description.trim() !== '' &&
      user?.email && // Validar que el usuario tenga email
      (profile?.full_name || user?.email); // Validar que tenga nombre o email

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Solicitud Enviada
            </DialogTitle>
            <DialogDescription>
              {isFreemiumUser 
                ? 'Tu solicitud ha sido enviada a nuestro equipo.'
                : 'Tu servicio ha sido publicado exitosamente.'
              }
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    {isFreemiumUser ? (
                      <Sparkles className="h-8 w-8 text-green-600" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    {isFreemiumUser ? '¡Gracias por tu interés!' : '¡Servicio publicado!'}
                  </h3>
                  <p className="text-sm text-green-700">
                    {isFreemiumUser 
                      ? 'Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo en las próximas 24-48 horas para ofrecerte nuestras opciones Premium y publicar tu servicio.'
                      : 'Tu servicio ya está visible en el marketplace y los usuarios pueden contactarte.'
                    }
                  </p>
                </div>

                {isFreemiumUser && (
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Próximos pasos:</h4>
                    <ul className="text-sm text-green-700 space-y-1 text-left">
                      <li>• Revisión de tu solicitud</li>
                      <li>• Presentación de opciones Premium</li>
                      <li>• Configuración de tu servicio</li>
                      <li>• Publicación en el marketplace</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2">
            {isFreemiumUser && (
              <Button 
                onClick={() => {
                  handleClose();
                  navigate('/talent-dashboard/my-publishing-requests');
                }} 
                variant="outline"
                className="flex-1"
              >
                Ver Mis Solicitudes
              </Button>
            )}
            <Button onClick={handleClose} className="flex-1">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            {isFreemiumUser 
              ? 'Solicitar Publicación de Servicio' 
              : 'Publicar Servicio en Marketplace'
            }
          </DialogTitle>
          <DialogDescription>
            {isFreemiumUser 
              ? 'Completa el formulario para solicitar la publicación de tu servicio. Nuestro equipo te contactará para ofrecerte opciones Premium.'
              : 'Completa el formulario para publicar tu servicio en el marketplace.'
            }
          </DialogDescription>
        </DialogHeader>

        {isFreemiumUser && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-800">¿Quieres publicar servicios?</h4>
                  <p className="text-sm text-purple-700">
                    Para publicar servicios en el marketplace, necesitas una cuenta Premium. 
                    Envía tu solicitud y te contactaremos para ofrecerte nuestras opciones Premium.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isPremiumUser ? (
            // Premium User Form - Direct service creation
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Servicio</h3>
                <div className="space-y-2">
                  <Label htmlFor="title">Título del servicio *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Diseño de logotipo profesional"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange('serviceType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceMin">Precio Mínimo (USD) *</Label>
                      <Input
                        id="priceMin"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.priceMin}
                        onChange={(e) => handleInputChange('priceMin', e.target.value)}
                        placeholder="500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceMax">Precio Máximo (USD) *</Label>
                      <Input
                        id="priceMax"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.priceMax}
                        onChange={(e) => handleInputChange('priceMax', e.target.value)}
                        placeholder="1000"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo de entrega *</Label>
                    <Select
                      value={formData.deliveryTime}
                      onValueChange={(value) => handleInputChange('deliveryTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelineOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ej: Remoto, México, España"
                    required
                  />
                </div>
                
                {/* Selector para empresas/academias: publicar a nombre de empresa o personal */}
                {isBusinessOrAcademy && activeCompany && (
                  <div className="space-y-2">
                    <Label>Publicar como *</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="publishAs"
                          checked={!formData.publishAsCompany}
                          onChange={() => handleInputChange('publishAsCompany', 'false')}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm">A nombre personal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="publishAs"
                          checked={formData.publishAsCompany}
                          onChange={() => handleInputChange('publishAsCompany', 'true')}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm">A nombre de {activeCompany.name}</span>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.publishAsCompany 
                        ? `El servicio se mostrará asociado a ${activeCompany.name}` 
                        : 'El servicio se mostrará solo con tu nombre personal'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del servicio *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe en detalle tu servicio, qué incluye, tu experiencia... Puedes usar viñetas (•, -, *) y se mantendrán al publicar."
                    rows={6}
                    required
                    className="whitespace-pre-wrap"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Puedes copiar y pegar texto con viñetas desde Word, Google Docs, etc. El formato se mantendrá.
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Freemium User Form - Publishing request
            <>
              {/* Información de Contacto - Solo para empresas */}
              {isFreemiumBusiness && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información de Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Empresa *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName || activeCompany?.name || ''}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder={activeCompany?.name || "Nombre de tu empresa"}
                        required
                      />
                      {activeCompany?.name && (
                        <p className="text-xs text-muted-foreground">
                          Usando: {activeCompany.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Detalles del Servicio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalles del Servicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Servicio *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange('serviceType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freemiumPriceMin">Precio Mínimo (USD) *</Label>
                      <Input
                        id="freemiumPriceMin"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.freemiumPriceMin}
                        onChange={(e) => handleInputChange('freemiumPriceMin', e.target.value)}
                        placeholder="500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freemiumPriceMax">Precio Máximo (USD) *</Label>
                      <Input
                        id="freemiumPriceMax"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.freemiumPriceMax}
                        onChange={(e) => handleInputChange('freemiumPriceMax', e.target.value)}
                        placeholder="1000"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeline</Label>
                    <Select
                      value={formData.timeline}
                      onValueChange={(value) => handleInputChange('timeline', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelineOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Descripción del Servicio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descripción del Servicio</h3>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del servicio *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe detalladamente el servicio que quieres publicar... Puedes usar viñetas (•, -, *) y se mantendrán al publicar."
                    rows={4}
                    required
                    className="whitespace-pre-wrap"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Puedes copiar y pegar texto con viñetas desde Word, Google Docs, etc. El formato se mantendrá.
                  </p>
                </div>
              </div>

              {/* Información Adicional - Solo para Freemium */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-800">¿Qué sucede después?</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Nuestro equipo revisará tu solicitud</li>
                        <li>• Te contactaremos en 24-48 horas</li>
                        <li>• Coordinaremos una llamada para confirmar detalles</li>
                        <li>• Configuraremos tu servicio en el marketplace</li>
                        <li>• Te ayudaremos con la optimización y promoción</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPremiumUser ? 'Publicando...' : 'Enviando...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isPremiumUser ? 'Publicar Servicio' : 'Enviar Solicitud'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Dialog para mostrar cuando hay solicitud pendiente */}
    <Dialog open={showPendingRequestDialog} onOpenChange={setShowPendingRequestDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Solicitud Pendiente
          </DialogTitle>
          <DialogDescription>
            Ya tienes una solicitud de publicación pendiente de revisión.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No puedes enviar otra solicitud mientras tengas una pendiente de aprobación. 
            Por favor espera a que un administrador revise tu solicitud actual.
          </p>
          
          {hasPendingRequest && myRequests.find(r => r.status === 'pending') && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Solicitud enviada el {new Date(myRequests.find(r => r.status === 'pending')!.created_at).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-yellow-700">
                Estado: Pendiente de revisión
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setShowPendingRequestDialog(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default PublishServiceModal;
