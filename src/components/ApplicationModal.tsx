import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Calendar
} from 'lucide-react';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { toast } from 'sonner';

interface SupabaseOpportunity {
  id: string;
  title: string;
  description: string;
  location?: string;
  type: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  status?: string;
  deadline_date?: string;
  companies?: {
    name: string;
    logo_url?: string;
  };
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: SupabaseOpportunity | null;
  onApplicationSent: () => void;
}

interface ApplicationData {
  years_experience_category: number | null;
  cover_letter: string;
  video_presentation_url: string;
  start_availability: string;
}

const ApplicationModal = ({ isOpen, onClose, opportunity, onApplicationSent }: ApplicationModalProps) => {
  const { applyToOpportunity } = useSupabaseOpportunities();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Check if opportunity is closed or expired
  const isOpportunityClosed = opportunity?.status === 'closed';
  const isOpportunityExpired = opportunity?.deadline_date && new Date(opportunity.deadline_date) < new Date();

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    years_experience_category: null,
    cover_letter: '',
    video_presentation_url: '',
    start_availability: ''
  });

  const resetForm = () => {
    setApplicationData({
      years_experience_category: null,
      cover_letter: '',
      video_presentation_url: '',
      start_availability: ''
    });
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return applicationData.years_experience_category !== null && 
               applicationData.years_experience_category >= 0 &&
               applicationData.cover_letter.trim().length >= 50;
      case 2:
        return applicationData.start_availability.trim().length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!opportunity) return;

    setIsSubmitting(true);
    try {
      // Crear la carta de presentación completa
      const fullCoverLetter = `
AÑOS DE EXPERIENCIA EN ${opportunity.category?.toUpperCase() || 'ESTA ÁREA'}: ${applicationData.years_experience_category} años

CARTA DE PRESENTACIÓN:
${applicationData.cover_letter}

${applicationData.video_presentation_url ? `VIDEO DE PRESENTACIÓN: ${applicationData.video_presentation_url}` : ''}

DISPONIBILIDAD PARA COMENZAR: ${applicationData.start_availability}
      `.trim();

      await applyToOpportunity(opportunity.id, fullCoverLetter);
      
      toast.success('¡Aplicación enviada correctamente!');
      onApplicationSent();
      handleClose();
    } catch (error) {
      console.error('Error sending application:', error);
      toast.error('Error al enviar la aplicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!opportunity) return null;

  // Show closed message if opportunity is closed or expired
  if (isOpportunityClosed || isOpportunityExpired) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              Oportunidad no disponible
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {opportunity.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {isOpportunityClosed 
                ? 'Esta oportunidad ha sido cerrada y ya no acepta aplicaciones.'
                : 'La fecha límite para aplicar a esta oportunidad ha expirado.'}
            </p>
            {opportunity.deadline_date && (
              <p className="text-sm text-gray-500">
                Fecha límite: {new Date(opportunity.deadline_date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleClose} variant="outline" className="w-full">
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
          <DialogTitle className="text-xl font-bold">
            Aplicar a la posición
          </DialogTitle>
        </DialogHeader>

        {/* Información de la oportunidad */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              {opportunity.companies?.logo_url ? (
                <img 
                  src={opportunity.companies.logo_url} 
                  alt={opportunity.companies?.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Building className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {opportunity.title}
              </h3>
              <p className="text-gray-600 mb-2">
                {opportunity.companies?.name}
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                {opportunity.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {opportunity.location}
                  </div>
                )}
                {opportunity.type && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {opportunity.type}
                  </div>
                )}
                {(opportunity.salary_min || opportunity.salary_max) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {opportunity.salary_min && opportunity.salary_max
                      ? `$${opportunity.salary_min.toLocaleString()} - $${opportunity.salary_max.toLocaleString()}`
                      : opportunity.salary_min
                      ? `Desde $${opportunity.salary_min.toLocaleString()}`
                      : `Hasta $${opportunity.salary_max?.toLocaleString()}`
                    }
                  </div>
                )}
              </div>
              {opportunity.category && (
                <div className="mt-2">
                  <Badge variant="secondary">{opportunity.category}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep} de 2
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / 2) * 100)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Formulario por pasos */}
        <div className="space-y-6">
          {/* Paso 1: Experiencia y Carta de Presentación */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Experiencia y Presentación</h3>
                <p className="text-gray-600 text-sm">Cuéntanos sobre tu experiencia en esta área</p>
              </div>

              <div>
                <Label htmlFor="years_experience_category">
                  ¿Cuántos años de experiencia tienes en {opportunity.category || 'esta área'}? *
                </Label>
                <Input
                  id="years_experience_category"
                  type="number"
                  value={applicationData.years_experience_category || ''}
                  onChange={(e) => setApplicationData(prev => ({ 
                    ...prev, 
                    years_experience_category: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="Ej: 2, 5, 10..."
                  min="0"
                  max="50"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Indica cuántos años has trabajado específicamente en esta área</p>
              </div>

              <div>
                <Label htmlFor="cover_letter">Carta de Presentación *</Label>
                <Textarea
                  id="cover_letter"
                  value={applicationData.cover_letter}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, cover_letter: e.target.value }))}
                  placeholder="Presenta tu perfil profesional, destaca tus fortalezas y explica por qué eres el candidato ideal para esta posición..."
                  rows={8}
                  className="mt-1"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-xs ${applicationData.cover_letter.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                    {applicationData.cover_letter.length >= 50 ? '✓ Mínimo alcanzado' : 'Mínimo 50 caracteres'}
                  </p>
                  <span className="text-xs text-gray-400">{applicationData.cover_letter.length} caracteres</span>
                </div>
              </div>

              <div>
                <Label htmlFor="video_presentation_url">Video de presentación (Opcional)</Label>
                <Input
                  id="video_presentation_url"
                  type="url"
                  value={applicationData.video_presentation_url}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, video_presentation_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comparte un video donde te presentes profesionalmente (YouTube, Loom, etc.)
                </p>
              </div>
            </div>
          )}

          {/* Paso 2: Disponibilidad */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Disponibilidad</h3>
                <p className="text-gray-600 text-sm">¿Cuándo puedes comenzar?</p>
              </div>

              <div>
                <Label htmlFor="start_availability">¿Cuándo puedes empezar? *</Label>
                <Input
                  id="start_availability"
                  value={applicationData.start_availability}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, start_availability: e.target.value }))}
                  placeholder="Ej: Inmediatamente, en 2 semanas, el 1 de marzo..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Indica cuándo estarías disponible para comenzar a trabajar
                </p>
              </div>

              {/* Resumen de la aplicación */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Resumen de tu aplicación:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Años de experiencia en {opportunity.category}:</strong> {applicationData.years_experience_category || 'No especificado'} años</div>
                  <div><strong>Carta de presentación:</strong> {applicationData.cover_letter.substring(0, 100)}...</div>
                  {applicationData.video_presentation_url && (
                    <div><strong>Video:</strong> {applicationData.video_presentation_url}</div>
                  )}
                  <div><strong>Disponibilidad:</strong> {applicationData.start_availability || 'No especificada'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Aplicación'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;