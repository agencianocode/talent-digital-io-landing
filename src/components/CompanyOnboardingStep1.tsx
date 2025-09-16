import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface CompanyData {
  name: string;
  isIndividual: boolean;
}

interface CompanyOnboardingStep1Props {
  onComplete: (data: CompanyData) => void;
  initialData: CompanyData;
}

const CompanyOnboardingStep1 = ({ onComplete, initialData }: CompanyOnboardingStep1Props) => {
  const [companyName, setCompanyName] = useState(initialData.name);
  const [isIndividual, setIsIndividual] = useState(initialData.isIndividual);
  const [isValid, setIsValid] = useState(false);

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    setIsValid(value.trim().length > 0);
  };

  const handleContinue = () => {
    if (isValid) {
      onComplete({
        name: companyName.trim(),
        isIndividual
      });
    }
  };

  const handleCreateCompany = () => {
    if (companyName.trim()) {
      handleContinue();
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        Paso 1/2
      </div>

      {/* Main Question */}
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
          ¿Cuál es el nombre de tu empresa?
        </h1>
        
        {/* Input Field */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company-name" className="sr-only">
              Nombre de la empresa
            </Label>
            <Input
              id="company-name"
              type="text"
              placeholder="Empresa"
              value={companyName}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
              className="text-lg h-14 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30 rounded-xl"
              autoFocus
            />
          </div>

          {/* Create Company Suggestion */}
          {companyName.trim() && (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-medium">
                Crear '{companyName.trim()}'
              </div>
              <Button
                size="icon"
                onClick={handleCreateCompany}
                className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Individual Checkbox */}
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox
              id="individual"
              checked={isIndividual}
              onCheckedChange={(checked) => setIsIndividual(checked as boolean)}
              className="rounded-md"
            />
            <Label htmlFor="individual" className="text-slate-700 dark:text-slate-300 font-medium">
              Estoy contratando como individuo
            </Label>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-6">
        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep1;
