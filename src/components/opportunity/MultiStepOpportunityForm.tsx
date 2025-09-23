import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import OpportunityStep1 from './OpportunityStep1';
import OpportunityStep2 from './OpportunityStep2';

interface FormData {
  // Step 1
  title: string;
  description: string;
  skills: string[];
  tools: string;
  contractorsCount: number;
  usOnlyApplicants: boolean;
  preferredTimezone: string;
  preferredLanguages: string[];
  
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
}

interface MultiStepOpportunityFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
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
  isLoading = false 
}: MultiStepOpportunityFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1 defaults
    title: '',
    description: '',
    skills: [],
    tools: '',
    contractorsCount: 1,
    usOnlyApplicants: false,
    preferredTimezone: '',
    preferredLanguages: [],
    
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
    
    // Override with initial data
    ...initialData
  });

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description);
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
              description: formData.description,
              skills: formData.skills,
              tools: formData.tools,
              contractorsCount: formData.contractorsCount,
              usOnlyApplicants: formData.usOnlyApplicants,
              preferredTimezone: formData.preferredTimezone,
              preferredLanguages: formData.preferredLanguages
            }}
            onChange={updateFormData}
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
            ? 'Ahorrar' 
            : 'Próximo'
          }
        </Button>
      </div>
    </div>
  );
};

export default MultiStepOpportunityForm;
