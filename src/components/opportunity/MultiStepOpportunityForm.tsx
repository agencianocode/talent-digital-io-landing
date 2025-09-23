import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import OpportunityStep1 from './OpportunityStep1';
import OpportunityStep2 from './OpportunityStep2';
import OpportunityStep3 from './OpportunityStep3';

interface FormData {
  // Step 1
  title: string;
  companyName: string;
  companyDescription: string;
  
  // Step 2
  pricePoints: Array<{ id: string; programName: string; price: string }>;
  socialLinks: Array<{ id: string; url: string }>;
  
  // Step 3
  roleType: string;
  minimumOTE: string;
  maximumOTE: string;
  timezone: string;
  workingHoursTBD: boolean;
  startTime: string;
  endTime: string;
  requirements: string[];
  applicationInstructions: string;
}

interface MultiStepOpportunityFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const steps = [
  {
    id: 1,
    title: 'Company Details',
    subtitle: 'Detalles de la Empresa'
  },
  {
    id: 2,
    title: 'Pricing & Links',
    subtitle: 'Precios y Enlaces'
  },
  {
    id: 3,
    title: 'Role Requirements',
    subtitle: 'Requisitos del Rol'
  },
  {
    id: 4,
    title: 'Review & Submit',
    subtitle: 'Revisar y Enviar'
  }
];

const MultiStepOpportunityForm = ({ 
  initialData = {}, 
  onSubmit, 
  isLoading = false 
}: MultiStepOpportunityFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1 defaults
    title: '',
    companyName: '',
    companyDescription: '',
    
    // Step 2 defaults
    pricePoints: [],
    socialLinks: [],
    
    // Step 3 defaults
    roleType: '',
    minimumOTE: '',
    maximumOTE: '',
    timezone: '',
    workingHoursTBD: false,
    startTime: '09:00',
    endTime: '17:00',
    requirements: [],
    applicationInstructions: '',
    
    // Override with initial data
    ...initialData
  });

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.companyName && formData.companyDescription);
      case 2:
        return formData.pricePoints.length > 0 && formData.socialLinks.length > 0;
      case 3:
        const requiredFields = formData.roleType && formData.minimumOTE && formData.maximumOTE && 
                              formData.timezone && formData.requirements.length > 0 && 
                              formData.applicationInstructions;
        const timeValidation = formData.workingHoursTBD || (formData.startTime && formData.endTime);
        return !!(requiredFields && timeValidation);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit form
        onSubmit(formData);
      }
    }
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
              companyName: formData.companyName,
              companyDescription: formData.companyDescription
            }}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <OpportunityStep2
            data={{
              pricePoints: formData.pricePoints,
              socialLinks: formData.socialLinks
            }}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <OpportunityStep3
            data={{
              roleType: formData.roleType,
              minimumOTE: formData.minimumOTE,
              maximumOTE: formData.maximumOTE,
              timezone: formData.timezone,
              workingHoursTBD: formData.workingHoursTBD,
              startTime: formData.startTime,
              endTime: formData.endTime,
              requirements: formData.requirements,
              applicationInstructions: formData.applicationInstructions
            }}
            onChange={updateFormData}
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Revisar y Enviar
              </h3>
              <p className="text-gray-600">
                Revisa la información antes de publicar tu oportunidad
              </p>
            </div>
            
            {/* Summary content would go here */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Resumen de la Oportunidad</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Título del Puesto</dt>
                  <dd className="text-sm text-gray-900">{formData.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                  <dd className="text-sm text-gray-900">{formData.companyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo de Rol</dt>
                  <dd className="text-sm text-gray-900">{formData.roleType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Salario</dt>
                  <dd className="text-sm text-gray-900">
                    ${formData.minimumOTE} - ${formData.maximumOTE} anuales
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create a New Job Posting
        </h1>
        <p className="text-gray-600">
          Fill in the details below to create your job posting
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
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
                  "w-16 h-0.5 mx-4 transition-colors",
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

      {/* Navigation Buttons */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="px-6"
        >
          {currentStep === 1 ? 'Back' : 'Back'}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!validateStep(currentStep) || isLoading}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          {isLoading 
            ? 'Publishing...' 
            : currentStep === 4 
            ? 'Post Job' 
            : `Continue to ${steps[currentStep]?.title || 'Next Step'}`
          }
        </Button>
      </div>
    </div>
  );
};

export default MultiStepOpportunityForm;
