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
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="text-sm text-muted-foreground">
        Paso 1/2
      </div>

      {/* Main Question */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          ¿Cuál es el nombre de tu empresa?
        </h1>
        
        {/* Input Field */}
        <div className="space-y-4">
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
              className="text-lg h-12"
              autoFocus
            />
          </div>

          {/* Create Company Suggestion */}
          {companyName.trim() && (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                Crear '{companyName.trim()}'
              </div>
              <Button
                size="icon"
                onClick={handleCreateCompany}
                className="h-10 w-10 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Individual Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="individual"
              checked={isIndividual}
              onCheckedChange={(checked) => setIsIndividual(checked as boolean)}
            />
            <Label htmlFor="individual" className="text-sm">
              Estoy contratando como individuo
            </Label>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full h-12 text-lg"
        >
          Continuar
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground">
        <p>
          Este nombre aparecerá en tus publicaciones de trabajo y en tu perfil empresarial.
        </p>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep1;
