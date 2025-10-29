import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import OpportunityStep1 from './OpportunityStep1';
import OpportunityStep2 from './OpportunityStep2';
import PublishJobModal from './PublishJobModal';
import { type Company } from '@/contexts/CompanyContext';
// Los imports se utilizan en los componentes hijos
// import { 
//   categoryTemplates, 
//   contractTypes, 
//   locationTypes, 
//   experienceLevelOptions
// } from '@/lib/opportunityTemplates';
import { useAutoSave } from '@/hooks/useAutoSave';

interface FormData {
  // Step 1 - Detalles del trabajo
  category: string;
  title: string;
  description: string;
  contractType: string;
  skills: string[];
  tools: string[];
  experienceLevels: string[];
  locationType: string;
  location: string;
  contractorsCount: number;
  preferredTimezone: string;
  preferredLanguages: string[];
  deadlineDate: Date | null;
  
  // Step 2 - Presupuesto y duración
  projectType: 'ongoing' | 'one-time';
  durationType: 'indefinite' | 'fixed';
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months';
  paymentType: 'fixed' | 'commission' | 'fixed_plus_commission';
  paymentMethod: 'hourly' | 'weekly' | 'monthly';
  hourlyMinRate: string;
  hourlyMaxRate: string;
  weeklyMinBudget: string;
  weeklyMaxBudget: string;
  monthlyMinBudget: string;
  monthlyMaxBudget: string;
  commissionPercentage: string;
  salaryIsPublic: boolean;
  maxHoursPerWeek: number;
  maxHoursPerMonth: number;
  isMaxHoursOptional: boolean;
  // Estado y publicación
  status: 'draft' | 'published';
  publishToFeed?: boolean;
}

interface MultiStepOpportunityFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  company?: Company | null;
}

const steps = [
  {
    id: 1,
    title: 'Detalles del trabajo',
    subtitle: 'Job Details'
  },
  {
    id: 2,
    title: 'Presupuesto y duración',
    subtitle: 'Budget & Duration'
  }
];

const MultiStepOpportunityForm = ({ 
  initialData = {}, 
  onSubmit, 
  isLoading = false,
  company
}: MultiStepOpportunityFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Step 1 defaults
    category: '',
    title: '',
    description: '',
    contractType: '',
    skills: [],
    tools: [],
    experienceLevels: [],
    locationType: 'remote',
    location: '',
    contractorsCount: 1,
    preferredTimezone: '',
    preferredLanguages: [],
    deadlineDate: null,
    
    // Step 2 defaults
    projectType: 'ongoing',
    durationType: 'indefinite',
    durationValue: 1,
    durationUnit: 'months',
    paymentType: 'fixed',
    paymentMethod: 'monthly',
    hourlyMinRate: '',
    hourlyMaxRate: '',
    weeklyMinBudget: '',
    weeklyMaxBudget: '',
    monthlyMinBudget: '',
    monthlyMaxBudget: '',
    commissionPercentage: '',
    salaryIsPublic: true,
    maxHoursPerWeek: 20,
    maxHoursPerMonth: 0,
    isMaxHoursOptional: true,
    // Estado por defecto como borrador
    status: 'draft',
    
    // Override with initial data
    ...initialData
  });

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  // Función para guardar como borrador
  const saveDraft = async (data: FormData) => {
    setIsSaving(true);
    try {
      // Guardar como borrador
      const draftData = { ...data, status: 'draft' as const };
      await onSubmit(draftData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Autoguardado cada 2 minutos
  const autoSaveData = useAutoSave({
    data: formData,
    onSave: saveDraft,
    interval: 120000, // 2 minutos
    enabled: true,
    storageKey: 'opportunity-draft'
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.category?.trim() &&
          formData.title?.trim() &&
          formData.description?.trim() &&
          formData.contractType?.trim() &&
          formData.locationType?.trim() &&
          formData.skills?.length > 0 &&
          formData.experienceLevels?.length > 0 &&
          formData.contractorsCount > 0 &&
          formData.deadlineDate
        );
      case 2:
        const hasDuration = formData.durationType === 'indefinite' || 
          (formData.durationType === 'fixed' && formData.durationValue > 0);
        const hasPayment = formData.paymentType && 
          (formData.paymentType === 'commission' || 
           (formData.paymentMethod && 
            ((formData.paymentMethod === 'hourly' && formData.hourlyMinRate?.trim()) ||
             (formData.paymentMethod === 'weekly' && formData.weeklyMinBudget?.trim()) ||
             (formData.paymentMethod === 'monthly' && formData.monthlyMinBudget?.trim()))));
        return !!(hasDuration && hasPayment);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        // Show publish modal instead of submitting directly
        setShowPublishModal(true);
      }
    }
  };

  const handlePublishToFeed = () => {
    setShowPublishModal(false);
    // Submit form with publish flag
    onSubmit({ ...formData, publishToFeed: true });
  };

  const handleKeepPrivate = () => {
    setShowPublishModal(false);
    // Submit form without publish flag
    onSubmit({ ...formData, publishToFeed: false });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/business-dashboard/opportunities');
    }
  };

  const isStepComplete = (step: number) => {
    return step < currentStep || (step === currentStep && validateStep(step));
  };

  const getStepIcon = (step: number) => {
    if (isStepComplete(step) && step < currentStep) {
      return <Check className="w-5 h-5 text-white" />;
    }
    return <span className="text-sm font-medium">{step}</span>;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <OpportunityStep1
            data={{
              category: formData.category,
              title: formData.title,
              description: formData.description,
              contractType: formData.contractType,
              skills: formData.skills,
              tools: formData.tools,
              experienceLevels: formData.experienceLevels,
              locationType: formData.locationType,
              location: formData.location,
              contractorsCount: formData.contractorsCount,
              preferredTimezone: formData.preferredTimezone,
              preferredLanguages: formData.preferredLanguages,
              deadlineDate: formData.deadlineDate
            }}
            onChange={updateFormData}
            company={company}
          />
        );
      case 2:
        return (
          <OpportunityStep2
            data={{
              projectType: formData.projectType,
              durationType: formData.durationType,
              durationValue: formData.durationValue,
              durationUnit: formData.durationUnit,
              paymentType: formData.paymentType,
              paymentMethod: formData.paymentMethod,
              hourlyMinRate: formData.hourlyMinRate,
              hourlyMaxRate: formData.hourlyMaxRate,
              weeklyMinBudget: formData.weeklyMinBudget,
              weeklyMaxBudget: formData.weeklyMaxBudget,
              monthlyMinBudget: formData.monthlyMinBudget,
              monthlyMaxBudget: formData.monthlyMaxBudget,
              commissionPercentage: formData.commissionPercentage,
              salaryIsPublic: formData.salaryIsPublic,
              maxHoursPerWeek: formData.maxHoursPerWeek,
              maxHoursPerMonth: formData.maxHoursPerMonth,
              isMaxHoursOptional: formData.isMaxHoursOptional
            }}
            onChange={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Nueva Oportunidad de Trabajo
        </h1>
        <p className="text-gray-600">
          Completa los detalles a continuación para crear tu publicación de trabajo
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  currentStep === step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : isStepComplete(step.id)
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                )}
              >
                {getStepIcon(step.id)}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    currentStep === step.id
                      ? "text-blue-600"
                      : isStepComplete(step.id)
                      ? "text-green-600"
                      : "text-gray-500"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.subtitle}</p>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-32 h-0.5 mx-6 transition-colors",
                  isStepComplete(step.id) ? "bg-green-600" : "bg-gray-300"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Company Info Section */}
      {company && (
        <Tooltip 
          content="Para editar los datos de la empresa que se mostrarán en la publicación, guarda el borrador y ve a tu perfil de empresa > Detalles del negocio"
          position="top"
        >
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200 cursor-help">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  company.name?.charAt(0)?.toUpperCase() || 'A'
                )}
              </div>
              
              {/* Company Details */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Acerca de {company.name}
                </h3>
                {company.description && (
                  <p className="text-gray-600 text-sm mb-2">
                    {company.description}
                  </p>
                )}
                {company.location && (
                  <p className="text-gray-500 text-sm">
                    Tiene su sede en {company.location}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Tooltip>
      )}

      {/* Validation Message */}
      {!validateStep(currentStep) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            Completa los siguientes campos obligatorios:
          </h4>
          {currentStep === 1 && (
            <ul className="text-sm text-amber-700 space-y-1">
              {!formData.category && <li>• Categoría</li>}
              {!formData.title && <li>• Título profesional</li>}
              {!formData.description && <li>• Descripción del trabajo</li>}
              {!formData.contractType && <li>• Tipo de contrato</li>}
              {!formData.locationType && <li>• Modalidad de trabajo</li>}
              {(!formData.skills || formData.skills.length === 0) && <li>• Al menos 1 habilidad</li>}
              {(!formData.experienceLevels || formData.experienceLevels.length === 0) && <li>• Al menos 1 nivel de experiencia</li>}
              {formData.contractorsCount <= 0 && <li>• Número de contratistas (mínimo 1)</li>}
              {!formData.deadlineDate && <li>• Fecha límite de postulación</li>}
            </ul>
          )}
          {currentStep === 2 && (
            <ul className="text-sm text-amber-700 space-y-1">
              {formData.durationType === 'fixed' && formData.durationValue <= 0 && <li>• Duración del proyecto</li>}
              {formData.paymentType !== 'commission' && !formData.paymentMethod && <li>• Método de pago</li>}
              {formData.paymentMethod === 'hourly' && !formData.hourlyMinRate && <li>• Rango de tarifa por hora</li>}
              {formData.paymentMethod === 'weekly' && !formData.weeklyMinBudget && <li>• Presupuesto semanal</li>}
              {formData.paymentMethod === 'monthly' && !formData.monthlyMinBudget && <li>• Presupuesto mensual</li>}
            </ul>
          )}
        </div>
      )}

      {/* Auto-save Status */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          {isSaving && (
            <>
              <Save className="h-4 w-4 animate-pulse" />
              <span>Guardando borrador...</span>
            </>
          )}
          {autoSaveData.lastSaved && !isSaving && (
            <>
              <Save className="h-4 w-4 text-green-500" />
              <span>
                Guardado automático: {autoSaveData.lastSaved.toLocaleTimeString()}
              </span>
            </>
          )}
          {lastSaved && !autoSaveData.lastSaved && !isSaving && (
            <span>
              Último guardado manual: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {formData.status === 'draft' && (
            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
              Borrador
            </span>
          )}
          {autoSaveData.isAutoSaveEnabled && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Auto-guardado activo
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveDraft(formData)}
          disabled={isSaving}
          className="text-xs"
        >
          <Save className="h-3 w-3 mr-1" />
          Guardar borrador
        </Button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="px-6"
        >
          {currentStep === 1 ? 'Atrás' : 'Atrás'}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          {isLoading 
            ? 'Publicando...' 
            : currentStep === 2 
            ? 'Publicar' 
            : 'Próximo'
          }
        </Button>
      </div>

      {/* Publish Job Modal */}
      <PublishJobModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublishToFeed={handlePublishToFeed}
        onKeepPrivate={handleKeepPrivate}
      />
    </div>
  );
};

export default MultiStepOpportunityForm;
