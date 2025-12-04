import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Send,
  User
} from 'lucide-react';
import { MarketplaceService } from '@/hooks/useMarketplaceServices';
import { useMarketplaceCategories } from '@/hooks/useMarketplaceCategories';
import { useToast } from '@/hooks/use-toast';
import { normalizeDeliveryTime, formatPriceRange } from '@/lib/marketplace-utils';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useMessages } from '@/hooks/useMessages';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: MarketplaceService | null;
  onRequestSent?: () => void;
}

interface ServiceRequestForm {
  budgetRange: string;
  timeline: string;
  message: string;
  projectType: string;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  service,
  onRequestSent
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const { getOrCreateConversation, loadConversations } = useMessages();
  const { categories: marketplaceCategories } = useMarketplaceCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ServiceRequestForm>({
    budgetRange: '',
    timeline: '',
    message: '',
    projectType: ''
  });

  const category = service ? marketplaceCategories.find(cat => cat.name === service.category) : null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const budgetRanges = [
    { value: 'exact', label: `Presupuesto exacto (${service ? formatPriceRange(service.price_min, service.price_max, service.currency, service.price) : ''})` },
    { value: 'flexible', label: 'Presupuesto flexible' },
    { value: 'negotiable', label: 'Presupuesto negociable' },
    { value: 'custom', label: 'Presupuesto personalizado' }
  ];

  const timelineOptions = [
    { value: 'urgent', label: 'Urgente (1-3 días)' },
    { value: 'fast', label: 'Rápido (1 semana)' },
    { value: 'normal', label: 'Normal (2-4 semanas)' },
    { value: 'flexible', label: 'Flexible (1-3 meses)' }
  ];

  const projectTypes = [
    { value: 'one-time', label: 'Proyecto único' },
    { value: 'ongoing', label: 'Trabajo continuo' },
    { value: 'consultation', label: 'Consultoría' },
    { value: 'partnership', label: 'Colaboración' }
  ];

  const handleInputChange = (field: keyof ServiceRequestForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) return;

    setIsSubmitting(true);
    
    try {
      // Import the marketplace service and supabase client
      const { marketplaceService } = await import('@/services/marketplaceService');
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get user data from authentication context
      const requesterName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
      const requesterEmail = user?.email || '';
      const requesterPhone = profile?.phone || user?.user_metadata?.phone || '';
      const companyName = activeCompany?.name || '';

      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para enviar una solicitud.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Submit the service request
      await marketplaceService.createServiceRequest(service.id, {
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_phone: requesterPhone,
        company_name: companyName,
        message: formData.message,
        budget_range: formData.budgetRange,
        timeline: formData.timeline,
        project_type: formData.projectType
      });
      
      // Get service owner user_id
      const serviceOwnerId = service.user_id;
      
      if (serviceOwnerId && user.id) {
        try {
          // Create or get conversation with service owner
          const conversationId = await getOrCreateConversation(
            serviceOwnerId,
            'service_inquiry',
            undefined, // opportunityId
            service.id // serviceId
          );

          // Send initial message with request details
          const requestDetails = `
Nueva solicitud de servicio recibida:

📋 Servicio: ${service.title}
👤 Solicitante: ${requesterName}
${companyName ? `🏢 Empresa: ${companyName}` : ''}
📧 Email: ${requesterEmail}
${requesterPhone ? `📱 Teléfono: ${requesterPhone}` : ''}

💰 Presupuesto: ${formData.budgetRange}
⏱️ Timeline: ${formData.timeline}
📦 Tipo de proyecto: ${formData.projectType}

💬 Mensaje:
${formData.message}

Puedes responder a esta conversación para continuar la comunicación.
          `.trim();

          // Insertar mensaje directamente en la base de datos
          // Esto asegura que el mensaje se guarde correctamente y aparezca en /talent-dashboard/messages
          console.log('[ServiceRequestModal] Inserting message with:', {
            conversation_id: conversationId,
            sender_id: user.id,
            recipient_id: serviceOwnerId,
            content_length: requestDetails.length
          });
          
          const { error: messageError } = await supabase
            .from('messages' as any)
            .insert({
              conversation_id: conversationId,
              sender_id: user.id,
              recipient_id: serviceOwnerId,
              message_type: 'text',
              content: requestDetails
            })
            .select('*')
            .single();

          if (messageError) {
            console.error('[ServiceRequestModal] Error inserting message:', messageError);
            throw messageError;
          }

          console.log('[ServiceRequestModal] Message inserted successfully');

          // Recargar conversaciones para que aparezcan inmediatamente en /talent-dashboard/messages
          // Esto asegura que la conversación creada se muestre en la página de mensajería
          try {
            await loadConversations();
          } catch (reloadError) {
            console.error('Error reloading conversations:', reloadError);
            // No fallar si no se puede recargar, la suscripción en tiempo real debería actualizar
          }
        } catch (conversationError) {
          console.error('Error creating conversation:', conversationError);
          // No fallar la solicitud si falla la conversación, solo registrar el error
        }
      }
      
      // Service request created successfully
      console.log('Service request created successfully');
      
      // Send notification to service owner (email)
      try {
        await supabase.rpc('notify_service_inquiry', {
          p_service_id: service.id,
          p_inquirer_id: user.id,
          p_message: formData.message
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // No fallar la solicitud si falla la notificación
      }
      
      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud para "${service.title}" ha sido enviada exitosamente.`,
      });

      // Reset form
      setFormData({
        budgetRange: '',
        timeline: '',
        message: '',
        projectType: ''
      });

      onRequestSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending service request:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.message.trim() !== '' &&
    formData.budgetRange !== '' &&
    formData.timeline !== '' &&
    formData.projectType !== '';

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Servicio</DialogTitle>
          <DialogDescription>
            Completa el formulario para solicitar este servicio. El proveedor se pondrá en contacto contigo.
          </DialogDescription>
        </DialogHeader>

        {/* Service Info */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <Badge variant="secondary">
                    {category.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {normalizeDeliveryTime(service.delivery_time)}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 whitespace-pre-line">
                {service.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatPriceRange(service.price_min, service.price_max, service.currency, service.price)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{normalizeDeliveryTime(service.delivery_time)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Info */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <Avatar className="h-8 w-8">
              <AvatarImage src={service.user_avatar} />
              <AvatarFallback className="text-xs">
                {getInitials(service.user_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{service.user_name}</p>
              <div className="flex items-center gap-2">
                {service.rating != null && service.rating > 0 && service.reviews_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{service.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({service.reviews_count} reseñas)
                    </span>
                  </div>
                )}
                {service.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => navigate(`/business-dashboard/talent-profile/${service.user_id}`)}
                  >
                    <User className="h-3 w-3 mr-1" />
                    Ver Perfil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Presupuesto *</Label>
              <Select
                value={formData.budgetRange}
                onValueChange={(value) => handleInputChange('budgetRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar presupuesto" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeline *</Label>
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
            <div className="space-y-2">
              <Label>Tipo de proyecto *</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) => handleInputChange('projectType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Describe tu proyecto, objetivos, y cualquier detalle específico que consideres importante..."
              rows={4}
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestModal;
