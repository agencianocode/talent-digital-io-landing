import React, { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublishServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PublishServiceForm {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
  serviceType: string;
  budget: string;
  timeline: string;
  description: string;
  requirements: string;
}

const PublishServiceModal: React.FC<PublishServiceModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<PublishServiceForm>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    serviceType: '',
    budget: '',
    timeline: '',
    description: '',
    requirements: ''
  });

  const serviceTypes = [
    { value: 'diseno-grafico', label: '🎨 Diseño Gráfico' },
    { value: 'desarrollo-web', label: '💻 Desarrollo Web' },
    { value: 'marketing-digital', label: '📱 Marketing Digital' },
    { value: 'contenido', label: '✍️ Contenido' },
    { value: 'consultoria', label: '💡 Consultoría' },
    { value: 'traduccion', label: '🌍 Traducción' },
    { value: 'fotografia', label: '📸 Fotografía' },
    { value: 'video', label: '🎬 Video' },
    { value: 'audio', label: '🎵 Audio' },
    { value: 'ventas', label: '💰 Ventas' },
    { value: 'soporte', label: '🔧 Soporte Técnico' },
    { value: 'otros', label: '🔮 Otros' }
  ];

  const budgetRanges = [
    { value: '500-1000', label: '$500 - $1,000' },
    { value: '1000-2500', label: '$1,000 - $2,500' },
    { value: '2500-5000', label: '$2,500 - $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: '10000+', label: 'Más de $10,000' },
    { value: 'custom', label: 'Presupuesto personalizado' }
  ];

  const timelineOptions = [
    { value: 'urgent', label: 'Urgente (1-2 semanas)' },
    { value: 'fast', label: 'Rápido (1 mes)' },
    { value: 'normal', label: 'Normal (2-3 meses)' },
    { value: 'flexible', label: 'Flexible (3-6 meses)' }
  ];

  const handleInputChange = (field: keyof PublishServiceForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Import the marketplace service
      const { marketplaceService } = await import('@/services/marketplaceService');
      
      // Submit the publishing request
      await marketplaceService.createPublishingRequest({
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        company_name: formData.companyName,
        service_type: formData.serviceType,
        budget: formData.budget,
        timeline: formData.timeline,
        description: formData.description,
        requirements: formData.requirements
      });
      
      setIsSubmitted(true);
      
      toast({
        title: "Solicitud enviada exitosamente",
        description: "Tu solicitud de publicación de servicio ha sido enviada. Nos pondremos en contacto contigo pronto.",
      });
    } catch (error) {
      console.error('Error sending service publishing request:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      companyName: '',
      serviceType: '',
      budget: '',
      timeline: '',
      description: '',
      requirements: ''
    });
    setIsSubmitted(false);
    onClose();
  };

  const isFormValid = 
    formData.contactName.trim() !== '' &&
    formData.contactEmail.trim() !== '' &&
    formData.companyName.trim() !== '' &&
    formData.serviceType !== '' &&
    formData.description.trim() !== '';

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
              Tu solicitud de publicación de servicio ha sido enviada exitosamente.
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ¡Gracias por tu interés!
                  </h3>
                  <p className="text-sm text-green-700">
                    Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo 
                    en las próximas 24-48 horas para discutir los detalles de tu servicio.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Próximos pasos:</h4>
                  <ul className="text-sm text-green-700 space-y-1 text-left">
                    <li>• Revisión de tu solicitud</li>
                    <li>• Llamada de confirmación</li>
                    <li>• Configuración de tu servicio</li>
                    <li>• Publicación en el marketplace</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            Solicitar Publicación de Servicio
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para solicitar la publicación de tu servicio en nuestro marketplace. 
            Nuestro equipo se pondrá en contacto contigo para confirmar los detalles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nombre completo *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="tu@empresa.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Empresa *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Nombre de tu empresa"
                  required
                />
              </div>
            </div>
          </div>

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
              <div className="space-y-2">
                <Label>Presupuesto</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => handleInputChange('budget', value)}
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
                placeholder="Describe detalladamente el servicio que quieres publicar..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos específicos</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Especifica cualquier requisito especial, experiencia necesaria, etc."
                rows={3}
              />
            </div>
          </div>

          {/* Información Adicional */}
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

export default PublishServiceModal;
