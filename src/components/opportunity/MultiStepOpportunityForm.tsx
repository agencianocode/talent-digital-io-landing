import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import OpportunityStep1 from './OpportunityStep1';
import OpportunityStep2 from './OpportunityStep2';
import PublishJobModal from './PublishJobModal';
import { type Company } from '@/contexts/CompanyContext';

interface FormData {
  // Step 1
  title: string;
  description: string;
  skills: string[];
  tools: string[];
  contractorsCount: number;
  usOnlyApplicants: boolean;
  preferredTimezone: string;
  preferredLanguages: string[];
  extendedSchedule: string;
  
  // Step 2
  projectType: 'ongoing' | 'one-time';
  paymentMethod: 'hourly' | 'weekly' | 'monthly';
  hourlyMinRate: string;
  hourlyMaxRate: string;
  weeklyMinBudget: string;
  weeklyMaxBudget: string;
  monthlyMinBudget: string;
  monthlyMaxBudget: string;
  maxHoursPerWeek: number;
  maxHoursPerMonth: number;
  isMaxHoursOptional: boolean;
  // Duración del trabajo
  jobDuration: number;
  jobDurationUnit: 'month' | 'week';
  noEndDate: boolean;
  // Publicación
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
  const [formData, setFormData] = useState<FormData>({
    // Step 1 defaults
    title: '',
    description: '',
    skills: [],
    tools: [],
    contractorsCount: 1,
    usOnlyApplicants: false,
    preferredTimezone: '',
    preferredLanguages: [],
    extendedSchedule: '',
    
    // Step 2 defaults
    projectType: 'ongoing',
    paymentMethod: 'hourly',
    hourlyMinRate: '',
    hourlyMaxRate: '',
    weeklyMinBudget: '',
    weeklyMaxBudget: '',
    monthlyMinBudget: '',
    monthlyMaxBudget: '',
    maxHoursPerWeek: 20,
    maxHoursPerMonth: 0,
    isMaxHoursOptional: true,
    jobDuration: 1,
    jobDurationUnit: 'month',
    noEndDate: false,
    
    // Override with initial data
    ...initialData
  });

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.title && 
          formData.description && 
          formData.skills && 
          formData.skills.length > 0 &&
          formData.tools && 
          formData.tools.length > 0 &&
          formData.contractorsCount > 0
        );
      case 2:
        if (formData.projectType === 'one-time') {
          return !!(formData.monthlyMinBudget && formData.monthlyMaxBudget);
        } else {
          switch (formData.paymentMethod) {
            case 'hourly':
              return !!(formData.hourlyMinRate && formData.hourlyMaxRate);
            case 'weekly':
              return !!(formData.weeklyMinBudget && formData.weeklyMaxBudget);
            case 'monthly':
              return !!(formData.monthlyMinBudget && formData.monthlyMaxBudget);
            default:
              return false;
          }
        }
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
              title: formData.title,
              description: formData.description,
              skills: formData.skills,
              tools: formData.tools,
              contractorsCount: formData.contractorsCount,
              usOnlyApplicants: formData.usOnlyApplicants,
              preferredTimezone: formData.preferredTimezone,
              preferredLanguages: formData.preferredLanguages,
              extendedSchedule: formData.extendedSchedule
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
              paymentMethod: formData.paymentMethod,
              hourlyMinRate: formData.hourlyMinRate,
              hourlyMaxRate: formData.hourlyMaxRate,
              weeklyMinBudget: formData.weeklyMinBudget,
              weeklyMaxBudget: formData.weeklyMaxBudget,
              monthlyMinBudget: formData.monthlyMinBudget,
              monthlyMaxBudget: formData.monthlyMaxBudget,
              maxHoursPerWeek: formData.maxHoursPerWeek,
              maxHoursPerMonth: formData.maxHoursPerMonth,
              isMaxHoursOptional: formData.isMaxHoursOptional,
              jobDuration: formData.jobDuration,
              jobDurationUnit: formData.jobDurationUnit,
              noEndDate: formData.noEndDate
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
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
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
      )}

      {/* Validation Message for Step 1 */}
      {currentStep === 1 && !validateStep(1) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            Completa los siguientes campos obligatorios:
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {!formData.title && <li>• Título profesional</li>}
            {!formData.description && <li>• Descripción del trabajo</li>}
            {(!formData.skills || formData.skills.length === 0) && <li>• Al menos 1 habilidad</li>}
            {(!formData.tools || formData.tools.length === 0) && <li>• Al menos 1 herramienta</li>}
            {formData.contractorsCount <= 0 && <li>• Número de contratistas (mínimo 1)</li>}
          </ul>
        </div>
      )}

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
          disabled={!validateStep(currentStep) || isLoading}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          {isLoading 
            ? 'Publicando...' 
            : currentStep === 2 
            ? 'Guardar' 
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
