import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface OpportunityStep1Data {
  title: string;
  description: string;
  skills: string;
  tools: string;
  contractorsCount: number;
  usOnlyApplicants: boolean;
  preferredTimezone: string;
  preferredLanguages: string[];
}

interface OpportunityStep1Props {
  data: OpportunityStep1Data;
  onChange: (data: Partial<OpportunityStep1Data>) => void;
}

const skillsOptions = [
  'Diseño UX',
  'Desarrollo web',
  'Redacción de textos publicitarios',
  'Marketing digital',
  'Análisis de datos',
  'Gestión de proyectos',
  'Ventas',
  'Servicio al cliente'
];

const toolsOptions = [
  'Figma',
  'Canva',
  'Webflow',
  'Photoshop',
  'React',
  'WordPress',
  'Google Analytics',
  'Slack'
];

const timezoneOptions = [
  'UTC-8 (PST)',
  'UTC-5 (EST)',
  'UTC+0 (GMT)',
  'UTC+1 (CET)',
  'UTC+3 (MSK)',
  'UTC+8 (CST)',
  'UTC+9 (JST)'
];

const languageOptions = [
  'Español',
  'Inglés',
  'Francés',
  'Portugués',
  'Italiano',
  'Alemán'
];

const OpportunityStep1 = ({ data, onChange }: OpportunityStep1Props) => {
  const handleLanguageToggle = (language: string) => {
    const currentLanguages = data.preferredLanguages || [];
    const isSelected = currentLanguages.includes(language);
    
    if (isSelected) {
      onChange({ preferredLanguages: currentLanguages.filter(lang => lang !== language) });
    } else {
      onChange({ preferredLanguages: [...currentLanguages, language] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-900">
          Título profesional
        </Label>
        <Input
          id="title"
          placeholder="Añadir un título descriptivo"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="h-12"
        />
        <div className="text-xs text-gray-500 text-right">
          {data.title.length} / 100
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-900">
          Descripción del trabajo
        </Label>
        <Textarea
          id="description"
          placeholder="Enter text or type '/' for commands"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="min-h-[120px] resize-none"
        />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Habilidades
        </Label>
        <Select 
          value={data.skills} 
          onValueChange={(value) => onChange({ skills: value })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Por ejemplo, diseño UX, desarrollo web o redacción de textos publicitarios." />
          </SelectTrigger>
          <SelectContent>
            {skillsOptions.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500 text-right">
          {data.skills ? 1 : 0} / 3
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Herramientas
        </Label>
        <Select 
          value={data.tools} 
          onValueChange={(value) => onChange({ tools: value })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Por ejemplo, Figma, Canva o Webflow" />
          </SelectTrigger>
          <SelectContent>
            {toolsOptions.map((tool) => (
              <SelectItem key={tool} value={tool}>
                {tool}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500 text-right">
          {data.tools ? 1 : 0} / 5
        </div>
      </div>

      {/* Contractors Count */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          ¿Cuántos contratistas estás contratando?
        </Label>
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ contractorsCount: Math.max(1, data.contractorsCount - 1) })}
            disabled={data.contractorsCount <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={data.contractorsCount}
            onChange={(e) => onChange({ contractorsCount: parseInt(e.target.value) || 1 })}
            className="w-20 text-center h-10"
            min="1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ contractorsCount: data.contractorsCount + 1 })}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* US Only Applicants */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="usOnly"
          checked={data.usOnlyApplicants}
          onCheckedChange={(checked) => onChange({ usOnlyApplicants: !!checked })}
        />
        <Label htmlFor="usOnly" className="text-sm font-medium text-gray-900">
          Solo se aceptan solicitantes estadounidenses
        </Label>
      </div>

      {/* Additional Preferences */}
      <div className="space-y-4">
        {/* Preferred Timezone */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
            onClick={() => {/* Toggle timezone section */}}
          >
            + Zona horaria preferida
          </Button>
          {data.preferredTimezone && (
            <Select 
              value={data.preferredTimezone} 
              onValueChange={(value) => onChange({ preferredTimezone: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar zona horaria" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((timezone) => (
                  <SelectItem key={timezone} value={timezone}>
                    {timezone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Preferred Languages */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
            onClick={() => {/* Toggle languages section */}}
          >
            + Idiomas preferidos
          </Button>
          {data.preferredLanguages && data.preferredLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((language) => (
                <Button
                  key={language}
                  type="button"
                  variant={data.preferredLanguages?.includes(language) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLanguageToggle(language)}
                  className="text-sm"
                >
                  {language}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Acerca de Agencia de No Code</h4>
            <p className="text-sm text-gray-600 mt-1">
              Descripción de la Empresa<br />
              Tiene su sede en Cali, Colombia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityStep1;