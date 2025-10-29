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
  User,
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
  cover_letter: string;
  motivation: string;
  availability: string;
  expected_salary: number | null;
  portfolio_url: string;
  experience_years: number | null;
  relevant_experience: string;
  why_interested: string;
  start_date: string;
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
    cover_letter: '',
    motivation: '',
    availability: '',
    expected_salary: null,
    portfolio_url: '',
    experience_years: null,
    relevant_experience: '',
    why_interested: '',
    start_date: ''
  });

  const resetForm = () => {
    setApplicationData({
      cover_letter: '',
      motivation: '',
      availability: '',
      expected_salary: null,
      portfolio_url: '',
      experience_years: null,
      relevant_experience: '',
      why_interested: '',
      start_date: ''
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
        return applicationData.cover_letter.trim().length > 0 && 
               applicationData.motivation.trim().length > 0;
      case 2:
        return applicationData.relevant_experience.trim().length > 0;
      case 3:
        return applicationData.availability.trim().length > 0 && 
               applicationData.start_date.trim().length > 0;
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
MOTIVACIÓN:
${applicationData.motivation}

EXPERIENCIA RELEVANTE:
${applicationData.relevant_experience}

¿POR QUÉ ME INTERESA ESTA POSICIÓN?
${applicationData.why_interested}

DISPONIBILIDAD:
${applicationData.availability}

FECHA DE INICIO:
${applicationData.start_date}

${applicationData.expected_salary ? `EXPECTATIVA SALARIAL: $${applicationData.expected_salary.toLocaleString()} ${opportunity.currency || 'USD'}` : ''}

${applicationData.portfolio_url ? `PORTFOLIO: ${applicationData.portfolio_url}` : ''}

${applicationData.experience_years ? `AÑOS DE EXPERIENCIA: ${applicationData.experience_years}` : ''}

---
${applicationData.cover_letter}
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
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Formulario por pasos */}
        <div className="space-y-6">
          {/* Paso 1: Información personal y motivación */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Información Personal</h3>
                <p className="text-gray-600 text-sm">Cuéntanos sobre ti y tu motivación</p>
              </div>

              <div>
                <Label htmlFor="motivation">¿Por qué te interesa esta oportunidad? *</Label>
                <Textarea
                  id="motivation"
                  value={applicationData.motivation}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, motivation: e.target.value }))}
                  placeholder="Describe qué te llama la atención de esta posición y cómo se alinea con tus objetivos profesionales..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cover_letter">Carta de presentación personal *</Label>
                <Textarea
                  id="cover_letter"
                  value={applicationData.cover_letter}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, cover_letter: e.target.value }))}
                  placeholder="Presenta tu perfil profesional, destaca tus fortalezas y explica por qué eres el candidato ideal..."
                  rows={5}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="why_interested">¿Qué te emociona más de trabajar en esta empresa?</Label>
                <Textarea
                  id="why_interested"
                  value={applicationData.why_interested}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, why_interested: e.target.value }))}
                  placeholder="Comparte qué sabes sobre la empresa y por qué quieres formar parte de su equipo..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Paso 2: Experiencia y habilidades */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Experiencia y Habilidades</h3>
                <p className="text-gray-600 text-sm">Detalla tu experiencia relevante</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_years">Años de experiencia</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={applicationData.experience_years || ''}
                    onChange={(e) => setApplicationData(prev => ({ 
                      ...prev, 
                      experience_years: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    placeholder="0"
                    min="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expected_salary">Expectativa salarial (opcional)</Label>
                  <Input
                    id="expected_salary"
                    type="number"
                    value={applicationData.expected_salary || ''}
                    onChange={(e) => setApplicationData(prev => ({ 
                      ...prev, 
                      expected_salary: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="relevant_experience">Experiencia relevante para esta posición *</Label>
                <Textarea
                  id="relevant_experience"
                  value={applicationData.relevant_experience}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, relevant_experience: e.target.value }))}
                  placeholder="Describe proyectos, trabajos anteriores o experiencias que demuestren tu capacidad para esta posición..."
                  rows={5}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="portfolio_url">Portfolio o trabajos anteriores (URL)</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={applicationData.portfolio_url}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  placeholder="https://mi-portfolio.com"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Paso 3: Disponibilidad */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Disponibilidad</h3>
                <p className="text-gray-600 text-sm">Información sobre tu disponibilidad</p>
              </div>

              <div>
                <Label htmlFor="availability">Disponibilidad horaria *</Label>
                <Textarea
                  id="availability"
                  value={applicationData.availability}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="Ej: Tiempo completo, lunes a viernes, 40 horas semanales, disponible para trabajar en horario EST..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="start_date">¿Cuándo puedes empezar? *</Label>
                <Input
                  id="start_date"
                  value={applicationData.start_date}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, start_date: e.target.value }))}
                  placeholder="Ej: Inmediatamente, en 2 semanas, el 1 de marzo..."
                  className="mt-1"
                />
              </div>

              {/* Resumen de la aplicación */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Resumen de tu aplicación:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Motivación:</strong> {applicationData.motivation.substring(0, 100)}...</div>
                  <div><strong>Experiencia:</strong> {applicationData.experience_years || 'No especificada'} años</div>
                  <div><strong>Disponibilidad:</strong> {applicationData.availability || 'No especificada'}</div>
                  <div><strong>Inicio:</strong> {applicationData.start_date || 'No especificado'}</div>
                  {applicationData.expected_salary && (
                    <div><strong>Expectativa salarial:</strong> ${applicationData.expected_salary.toLocaleString()}</div>
                  )}
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