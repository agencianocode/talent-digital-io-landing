import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface OpportunityStep3ApplicationData {
  applicationInstructions: string;
  isExternalApplication: boolean;
  externalApplicationUrl: string;
}

interface OpportunityStep3ApplicationProps {
  data: OpportunityStep3ApplicationData;
  onChange: (data: Partial<OpportunityStep3ApplicationData>) => void;
}

const OpportunityStep3Application = ({ data, onChange }: OpportunityStep3ApplicationProps) => {
  const maxChars = 200;
  const currentLength = data.applicationInstructions?.length || 0;
  const isAtLimit = currentLength >= maxChars;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Aplicación
        </h2>
        <p className="text-gray-600 mb-6">
          Configura cómo los candidatos aplicarán a esta oportunidad
        </p>
      </div>

      {/* Instrucciones carta de presentación */}
      <div className="space-y-2">
        <Label htmlFor="applicationInstructions">
          Instrucciones carta de presentación
        </Label>
        <Textarea
          id="applicationInstructions"
          value={data.applicationInstructions}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= maxChars) {
              onChange({ applicationInstructions: value });
            }
          }}
          placeholder="Cuéntanos por qué eres el candidato ideal para el puesto"
          className="min-h-[100px] resize-none"
          maxLength={maxChars}
        />
        <div className="flex justify-end">
          <span 
            className={cn(
              "text-sm",
              isAtLimit ? "text-red-500 font-medium" : "text-gray-500"
            )}
          >
            {currentLength}/{maxChars}
          </span>
        </div>
      </div>

      {/* Toggle Aplicación externa */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="externalApplication" className="text-base font-medium">
              Aplicación externa
            </Label>
            <p className="text-sm text-gray-500">
              Si tenés un formulario de aplicación externo activá esta opción
            </p>
          </div>
          <Switch
            id="externalApplication"
            checked={data.isExternalApplication}
            onCheckedChange={(checked) => {
              onChange({ 
                isExternalApplication: checked,
                // Clear URL when disabling
                ...(checked ? {} : { externalApplicationUrl: '' })
              });
            }}
          />
        </div>

        {/* Input condicional - Link formulario */}
        {data.isExternalApplication && (
          <div className="space-y-2 pl-0 pt-2">
            <Label htmlFor="externalApplicationUrl">
              Link formulario de aplicación
            </Label>
            <Input
              id="externalApplicationUrl"
              type="url"
              value={data.externalApplicationUrl}
              onChange={(e) => onChange({ externalApplicationUrl: e.target.value })}
              placeholder="https://..."
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityStep3Application;
