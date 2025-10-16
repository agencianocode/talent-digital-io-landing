import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CompanyDetails {
  description: string;
  url: string;
  location: string;
  logo?: File | null;
  businessTypes?: string[];
}

interface CompanyOnboardingStep2Props {
  onComplete: (data: CompanyDetails) => void;
  initialData: CompanyDetails;
  companyName: string;
  onDetailsChange: (details: CompanyDetails) => void;
}

const CompanyOnboardingStep2 = ({ onComplete, initialData, companyName, onDetailsChange }: CompanyOnboardingStep2Props) => {
  const [description, setDescription] = useState(initialData.description || '');
  const [businessTypes, setBusinessTypes] = useState<string[]>(initialData.businessTypes || []);

  const businessTypeOptions = [
    { id: 'servicios-digitales', label: 'Servicios digitales', icon: '💻' },
    { id: 'educacion-digital', label: 'Educación digital', icon: '🎓' },
    { id: 'servicios-presenciales', label: 'Servicios presenciales', icon: '🏢' },
    { id: 'venta-productos', label: 'Venta de productos', icon: '🛒' },
    { id: 'inversiones-bienes', label: 'Inversiones y bienes raíces', icon: '💰' }
  ];

  useEffect(() => {
    onDetailsChange({
      ...initialData,
      description,
      businessTypes
    });
  }, [description, businessTypes, onDetailsChange, initialData]);

  const handleBusinessTypeToggle = (typeId: string) => {
    const option = businessTypeOptions.find(opt => opt.id === typeId);
    if (!option) return;

    setBusinessTypes(prev => {
      if (prev.includes(option.label)) {
        return prev.filter(type => type !== option.label);
      } else {
        return [...prev, option.label];
      }
    });
  };

  // Validar si el formulario está completo
  const isFormValid = description.trim().length > 0 && businessTypes.length > 0;

  const handleContinue = () => {
    if (!isFormValid) return;
    
    onComplete({
      description,
      url: initialData.url || '',
      location: initialData.location || '',
      logo: initialData.logo || null,
      businessTypes
    });
  };

  return (
    <div className="w-full mx-auto px-6 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8 space-y-6 sm:space-y-7 lg:space-y-8 font-['Inter']">
      {/* Step Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500 font-['Inter']">Información de la Empresa (2/4)</p>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="font-bold text-gray-900 font-['Inter']" style={{fontSize: '24px'}}>
          Crear tu perfil de empresa
        </h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Company Name (Read-only from Step 1) */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            ¿Cómo se llama tu empresa?
          </h2>
          <Input
            type="text"
            value={companyName}
            readOnly
            className="h-12 text-base border border-gray-300 rounded-lg px-4 bg-gray-50 cursor-not-allowed font-['Inter']"
          />
        </div>

        {/* Description */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Descripción
          </h2>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] text-base border border-gray-300 rounded-lg px-4 py-3 focus:border-gray-400 focus:ring-0 font-['Inter'] resize-none"
            placeholder="Escribe en 1-2 frases qué hace tu empresa. Esto aparecerá en tu perfil público."
          />
        </div>

        {/* Business Type */}
        <div>
          <h2 className="font-medium text-gray-900 mb-2 font-['Inter']" style={{fontSize: '16px'}}>
            Tipo de Negocio
          </h2>
          <p className="text-sm text-gray-600 mb-3 font-['Inter']">
            Selecciona el tipo de negocio que mejor represente el tuyo
          </p>
          
          <div className="space-y-3">
            {/* Primeros 4 botones en grid 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {businessTypeOptions.slice(0, 4).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleBusinessTypeToggle(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all font-['Inter'] ${
                    businessTypes.includes(option.label)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            
            {/* Último botón centrado */}
            {businessTypeOptions.slice(4).map((option) => (
              <div key={option.id} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleBusinessTypeToggle(option.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all font-['Inter'] w-full sm:w-auto sm:min-w-[200px] ${
                    businessTypes.includes(option.label)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-6 pb-4">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            variant="default"
            className="w-full h-12 font-medium rounded-lg font-['Inter']"
            style={{fontSize: '14px'}}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep2;