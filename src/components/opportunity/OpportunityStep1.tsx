import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X } from 'lucide-react';
import { professionalTools, type ProfessionalTool } from '@/lib/tools';
import { getApplicantRestrictionText } from '@/lib/country-nationalities';
import { type Company } from '@/contexts/CompanyContext';

interface OpportunityStep1Data {
  title: string;
  description: string;
  skills: string[];
  tools: string[];
  contractorsCount: number;
  usOnlyApplicants: boolean;
  preferredTimezone: string;
  preferredLanguages: string[];
  extendedSchedule: string;
}

interface OpportunityStep1Props {
  data: OpportunityStep1Data;
  onChange: (data: Partial<OpportunityStep1Data>) => void;
  company?: Company | null;
}

const skillsOptions = [
  'Accesibilidad Digital',
  'Activista',
  'Actor',
  'Administración de Empresas',
  'Administrador de Base de Datos',
  'Afinador Vocal',
  'Analista de Datos',
  'Analista de Modelado de Datos',
  'Analista de Negocios',
  'Analista de Producto',
  'Analista de Datos de Producto',
  'Analista Financiero',
  'Animador',
  'Animador 2D',
  'Animador 3D',
  'Animador Rive',
  'Arquitecto',
  'Arquitecto de Infraestructura en la Nube',
  'Arquitecto de Software',
  'Arquitecto y Diseñador de Interiores',
  'Artista',
  'Artista Conceptual',
  'Artista de Render',
  'Artista de Voz en Off',
  'Artista IA',
  'Artista NFT',
  'Artista Pixel',
  'Artista Visual',
  'Asesor',
  'Asesor de Gestión de Patrimonio',
  'Asesor Financiero',
  'Asesor Legal',
  'Asistente de Departamento de Arte',
  'Asistente de Producción',
  'Asistente Ejecutivo',
  'Asistente Personal',
  'Asistente Virtual',
  'Atleta',
  'Auditor',
  'Auditor de Sistemas',
  'Auditoría de Marca (Diseño)',
  'Auditoría de Marca (Redacción)',
  'Autor',
  'Automatización de Email',
  'Automatización de Flujos de Trabajo Empresariales',
  'Automatización IA',
  'Cabildero',
  'Candidato a PhD',
  'CEO',
  'CFO',
  'Científico',
  'Científico de Datos',
  'Cineasta',
  'Coach',
  'Coach de Medios',
  'Co-Fundador',
  'Colorista',
  'Community Manager',
  'Comprador de Medios',
  'Compositor',
  'Consejero Profesional',
  'Consultor',
  'Consultor de Diseño de Producto',
  'Consultor de Negocios',
  'Consultor de Recursos Humanos',
  'Consultor de Software',
  'Consultor Fiscal',
  'Consultor Financiero',
  'Consultor DEIA',
  'Contador',
  'COO',
  'Copy Estratega',
  'Corrector',
  'Creador de Contenido',
  'Creador de Instagram',
  'Creador de TikTok',
  'Creador de Youtube',
  'Creador UGC',
  'CSS de Sitio Web',
  'CTO',
  'Curador Musical',
  'Desarrollador Android',
  'Desarrollador AR/VR',
  'Desarrollador Backend',
  'Desarrollador Blockchain',
  'Desarrollador Bolt',
  'Desarrollador Bubble',
  'Desarrollador BuildShip',
  'Desarrollador de Agentes IA',
  'Desarrollador de Aplicaciones IA',
  'Desarrollador de Aplicaciones de Escritorio',
  'Desarrollador de Chatbots IA',
  'Desarrollador de Cursos',
  'Desarrollador de Extensiones Chrome',
  'Desarrollador de IA Conversacional',
  'Desarrollador de Juegos',
  'Desarrollador de Modelos IA',
  'Desarrollador de Plugins Framer',
  'Desarrollador de Sistemas Embebidos',
  'Desarrollador de Voz IA',
  'Desarrollador Dot Net Backend',
  'Desarrollador eLearning',
  'Desarrollador Flutter',
  'Desarrollador Flutterflow',
  'Desarrollador Framer',
  'Desarrollador Framer Shopify',
  'Desarrollador IA',
  'Desarrollador iOS',
  'Desarrollador Low-Code/No-Code',
  'Desarrollador Mobile',
  'Desarrollador React Native',
  'Desarrollador Shopify',
  'Desarrollador Squarespace',
  'Desarrollador Web',
  'Desarrollador Webflow',
  'Desarrollador Webstudio',
  'Desarrollador Winforms/WPF',
  'Desarrollador WordPress',
  'Desarrollo de Email',
  'Desarrollo de Aplicaciones de Escritorio',
  'Diseñador 3D',
  'Diseñador Canva',
  'Diseñador Creativo',
  'Diseñador de Agentes IA',
  'Diseñador de Comunicación',
  'Diseñador de Conversaciones',
  'Diseñador de Email Marketing',
  'Diseñador de Formularios',
  'Diseñador de Iconografía',
  'Diseñador de Infografías',
  'Diseñador de Interacción',
  'Diseñador de Interiores',
  'Diseñador de Juegos',
  'Diseñador de Logos',
  'Diseñador de Miniaturas',
  'Diseñador de Motion',
  'Diseñador de Muebles',
  'Diseñador de Packaging',
  'Diseñador de Páginas Opt-in',
  'Diseñador de Pitch Deck',
  'Diseñador de Plantillas',
  'Diseñador de Presentaciones',
  'Diseñador de Producto',
  'Diseñador de Publicidad',
  'Diseñador de Servicios',
  'Diseñador de Sistemas de Iconos',
  'Diseñador de Sistemas Visuales',
  'Diseñador Editorial',
  'Diseñador Framer',
  'Diseñador Glorify',
  'Diseñador Gráfico',
  'Diseñador Inclusivo',
  'Diseñador Industrial',
  'Diseñador Instant',
  'Diseñador Instruccional',
  'Diseñador Kittl',
  'Diseñador Mobile',
  'Diseñador Modyfi',
  'Diseñador Multimedia',
  'Diseñador PeachWeb',
  'Diseñador Relume',
  'Diseñador Shopify',
  'Diseñador Spline',
  'Diseñador UI',
  'Diseñador UX',
  'Diseñador Visual',
  'Diseñador Web',
  'Diseñador Wix Studio',
  'Diseñador XR',
  'Diseño de Banners Web',
  'Diseño de Marca',
  'Diseño de Impresión',
  'Diseño Responsive',
  'Diseño Web Squarespace',
  'Director Creativo',
  'Director de Arte',
  'Director de Fotografía',
  'Director de Marketing',
  'Director de Redes Sociales',
  'Economista',
  'Editor',
  'Editor de Audio',
  'Editor de Contenido IA',
  'Editor de Contenido',
  'Editor de Fotos',
  'Editor de Podcast',
  'Editor de Post-Producción de Video',
  'Editor de Textos',
  'Editor de Video',
  'Educador',
  'Embajador de Marca',
  'Emprendedor',
  'Entrenador de Medios',
  'Entrenador Ejecutivo',
  'Entrenador Personal',
  'Escritor',
  'Escritor Creativo',
  'Escritor de Guiones',
  'Escritor de Letras',
  'Escritor Fantasma',
  'Escritor IA',
  'Especialista en Analíticas de Marketing',
  'Especialista en Base de Datos',
  'Especialista en Ciencia de Datos',
  'Especialista en Comunicaciones',
  'Especialista en Ciberseguridad',
  'Especialista en Desarrollo de Negocios',
  'Especialista en Diseño de Sistemas',
  'Especialista en Efectos de Sonido',
  'Especialista en Email Marketing',
  'Especialista en Entrada de Datos',
  'Especialista en Gamificación',
  'Especialista en Google Ads',
  'Especialista en Growth Marketing',
  'Especialista en Marketing de Afiliados',
  'Especialista en Marketing de Influencers',
  'Especialista en Marketing de Motores de Búsqueda',
  'Especialista en Marketing de Performance',
  'Especialista en Marketing de Producto',
  'Especialista en Marketing de Redes Sociales',
  'Especialista en Marketing Digital',
  'Especialista en Marketing eCommerce',
  'Especialista en Marketing Pagado',
  'Especialista en Soporte Comunitario',
  'Especialista en Soporte IT de Salud',
  'Especialista en Soporte Técnico',
  'Especialista IT',
  'Especialista SEO',
  'Estadístico',
  'Estimador de Cantidades',
  'Estimador de Costos',
  'Estratega Creativo',
  'Estratega de Contenido',
  'Estratega de Impacto Social',
  'Estratega de Marketing',
  'Estratega de Negocios',
  'Estratega de Producto',
  'Estratega de Redes Sociales',
  'Estratega de Marca',
  'Estilista',
  'Estilista de Moda',
  'Estudiante',
  'Estudiante de Posgrado',
  'Experto CRO',
  'Experto en Meta Ads',
  'Filántropo',
  'Fotógrafo',
  'Fotógrafo de Producto',
  'Fundador',
  'Gamer',
  'Generador de Leads',
  'Gerente de Cuentas',
  'Gerente de eCommerce',
  'Gerente de Éxito del Cliente',
  'Gerente de Facebook Ads',
  'Gerente de Ingeniería',
  'Gerente de Negocio Online',
  'Gerente de Operaciones',
  'Gerente de Producto',
  'Gerente de Producto Creativo',
  'Gerente de Programa',
  'Gerente de Proyecto',
  'Gerente de Recursos Humanos',
  'Gerente de Seguridad',
  'Gerente de Ventas',
  'Gerente Virtual de Negocios',
  'Gestor de Activos',
  'Google Ads',
  'Guionista',
  'Historiador',
  'Ilustrador',
  'Ilustrador Digital',
  'Influencer',
  'Ingeniero Backend',
  'Ingeniero Cuántico',
  'Ingeniero de Agentes IA',
  'Ingeniero de Audio',
  'Ingeniero de Automatización',
  'Ingeniero de Base de Datos',
  'Ingeniero de Datos',
  'Ingeniero de Diseño',
  'Ingeniero de Plataforma',
  'Ingeniero de Prompts',
  'Ingeniero de Seguridad',
  'Ingeniero de Seguridad en la Nube',
  'Ingeniero de Sistemas',
  'Ingeniero de Virtualización',
  'Ingeniero DevOps',
  'Ingeniero Frontend',
  'Ingeniero Fullstack',
  'Ingeniero IA',
  'Ingeniero ML',
  'Ingeniero Mobile',
  'Ingeniero QA',
  'Ingeniero de Smart Contracts',
  'Ingeniero Solidity',
  'Ingeniero de Software',
  'Ingeniero UX',
  'Interno',
  'Inventor',
  'Inversionista',
  'Inversionista Ángel',
  'Investigador',
  'Investigador de Mercado',
  'Investigador de Producto',
  'Investigador de Usuario',
  'Investigador UX',
  'Líder de Operaciones',
  'Locutor',
  'Matemático',
  'Mentor',
  'Mezcla/Masterización',
  'Migración de Email',
  'Modelador 3D',
  'Modelador 3D con IA',
  'Moderador de Contenido',
  'Músico',
  'Orador Público',
  'Operaciones Comerciales',
  'Orquestador de Agentes IA',
  'Participación Comunitaria',
  'Periodista',
  'Planificador de Eventos',
  'Político',
  'Producer',
  'Productor',
  'Productor de Cine',
  'Productor de Podcast',
  'Productor de Video',
  'Productor Musical',
  'Productor Musical IA',
  'Productor de Video IA',
  'Profesor',
  'Programador Vibe',
  'Programación Vibe',
  'Pronosticador de Tendencias',
  'Propietario de Negocio',
  'Prototipador',
  'Publicista',
  'Reclutador',
  'Reclutador Técnico',
  'Redactor Académico',
  'Redactor de Artículos',
  'Redactor de Blog',
  'Redactor de Casos de Estudio',
  'Redactor de Contenido',
  'Redactor de Discursos',
  'Redactor de Newsletter',
  'Redactor de Prompts',
  'Redactor de Respuesta Directa',
  'Redactor de Subtítulos',
  'Redactor IA',
  'Redactor Médico',
  'Redactor Publicitario',
  'Redactor SEO',
  'Redactor Técnico',
  'Redactor UX',
  'Redactor UX IA',
  'Renderizador 3D',
  'Representante de Atención al Cliente',
  'Representante de Desarrollo de Ventas',
  'Retocador de Fotos',
  'Científico',
  'Investigación de Contenido',
  'Ingeniería Inversa',
  'Desarrollador de IA Conversacional',
  'Especialista en Automatización',
  'Verificador de Hechos IA',
  'Construcción de Embudos',
  'Conversor de Archivos',
  'Bot Conversacional',
  'Creador de Contenido IA',
  'Recopilador de Datos',
  'Visualizador de Datos',
  'Diseñador de Contenido Social',
  'Diseñador de Moda',
  'Diseño de Banners Web',
  'Especialista en Gamificación',
  'Gerente de Contenido SEO',
  'Gerente de Marketing de Influencers',
  'Gerente de Relaciones Públicas',
  'Gerente de Redes Sociales',
  'Marketing Orientado a Ventas',
  'Redactor UX',
  'Arquitecto de Software',
  'Diseñador de Sonido',
  'Estadístico',
  'Transcriptor',
  'Traductor',
  'Tutor',
  'Tipógrafo',
  'Tester QA',
  'Videógrafo',
  'Vocalista'
];

// Extraer solo los nombres de las herramientas y ordenarlos alfabéticamente
const toolsOptions = professionalTools
  .map((tool: ProfessionalTool) => tool.name)
  .sort((a: string, b: string) => a.localeCompare(b));

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

const OpportunityStep1 = ({ data, onChange, company }: OpportunityStep1Props) => {
  // State for expanding sections
  const [showTimezoneSection, setShowTimezoneSection] = useState(false);
  const [showLanguagesSection, setShowLanguagesSection] = useState(false);

  const getToolIcon = (toolName: string): string => {
    const toolData = professionalTools.find((tool: ProfessionalTool) => tool.name === toolName);
    return toolData?.icon || 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gear.svg';
  };

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = data.preferredLanguages || [];
    const isSelected = currentLanguages.includes(language);
    
    if (isSelected) {
      onChange({ preferredLanguages: currentLanguages.filter(lang => lang !== language) });
    } else {
      onChange({ preferredLanguages: [...currentLanguages, language] });
    }
  };

  const handleTimezoneSelect = (timezone: string) => {
    onChange({ preferredTimezone: timezone });
  };

  const handleExtendedScheduleSelect = (schedule: string) => {
    onChange({ extendedSchedule: schedule });
  };

  const removeTimezone = () => {
    onChange({ preferredTimezone: '' });
  };

  const removeExtendedSchedule = () => {
    onChange({ extendedSchedule: '' });
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = data.skills || [];
    const isSelected = currentSkills.includes(skill);
    
    if (isSelected) {
      onChange({ skills: currentSkills.filter(s => s !== skill) });
    } else if (currentSkills.length < 3) {
      onChange({ skills: [...currentSkills, skill] });
    }
  };

  const handleToolToggle = (tool: string) => {
    const currentTools = data.tools || [];
    const isSelected = currentTools.includes(tool);
    
    if (isSelected) {
      onChange({ tools: currentTools.filter(t => t !== tool) });
    } else if (currentTools.length < 5) {
      onChange({ tools: [...currentTools, tool] });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = data.skills || [];
    onChange({ skills: currentSkills.filter(skill => skill !== skillToRemove) });
  };

  const removeTool = (toolToRemove: string) => {
    const currentTools = data.tools || [];
    onChange({ tools: currentTools.filter(tool => tool !== toolToRemove) });
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
        <div className="space-y-2">
          {/* Display selected skills as chips */}
          {data.skills && data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[48px]">
              {data.skills.map((skill) => (
                <div
                  key={skill}
                  className="inline-flex items-center gap-1 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 shadow-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Dropdown to add skills */}
          <Select 
            value="" 
            onValueChange={(value) => handleSkillToggle(value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Seleccionar habilidades (máximo 3)" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {skillsOptions.map((skill) => {
                const isSelected = data.skills?.includes(skill);
                const isDisabled = !isSelected && (data.skills?.length || 0) >= 3;
                
                return (
                  <SelectItem 
                    key={skill} 
                    value={skill}
                    disabled={isDisabled}
                    className={isSelected ? "bg-blue-50 text-blue-900" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{skill}</span>
                      {isSelected && (
                        <span className="ml-2 text-blue-600">✓</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-gray-500 text-right">
          {data.skills?.length || 0} / 3
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Herramientas
        </Label>
        <div className="space-y-2">
          {/* Display selected tools as chips */}
          {data.tools && data.tools.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[48px]">
              {data.tools.map((tool) => (
                <div
                  key={tool}
                  className="inline-flex items-center gap-2 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 shadow-sm"
                >
                  <img 
                    src={getToolIcon(tool)} 
                    alt={tool} 
                    className="w-4 h-4" 
                    style={{ filter: 'invert(0.2)' }}
                  />
                  <span>{tool}</span>
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Dropdown to add tools */}
          <Select 
            value="" 
            onValueChange={(value) => handleToolToggle(value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Seleccionar herramientas (máximo 5)" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {toolsOptions.map((tool: string) => {
                const isSelected = data.tools?.includes(tool);
                const isDisabled = !isSelected && (data.tools?.length || 0) >= 5;
                
                return (
                  <SelectItem 
                    key={tool} 
                    value={tool}
                    disabled={isDisabled}
                    className={isSelected ? "bg-blue-50 text-blue-900" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <img 
                          src={getToolIcon(tool)} 
                          alt={tool} 
                          className="w-4 h-4" 
                          style={{ filter: 'invert(0.2)' }}
                        />
                        <span>{tool}</span>
                      </div>
                      {isSelected && (
                        <span className="ml-2 text-blue-600">✓</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-gray-500 text-right">
          {data.tools?.length || 0} / 5
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

      {/* US Only Applicants with Preferences */}
      <div className="space-y-3">
        {/* Checkbox and preferences in same row */}
        <div className="flex items-center space-x-6">
          {/* Checkbox section */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="usOnly"
              checked={data.usOnlyApplicants}
              onCheckedChange={(checked) => onChange({ usOnlyApplicants: !!checked })}
            />
            <Label htmlFor="usOnly" className="text-sm font-medium text-gray-900">
              {getApplicantRestrictionText(company?.location)}
            </Label>
          </div>

          {/* Preferences buttons */}
          <div className="flex items-center space-x-4">
            {/* Zona horaria preferida button */}
            <Button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700 rounded-full text-sm font-medium border-0"
              onClick={() => setShowTimezoneSection(!showTimezoneSection)}
            >
              + Zona horaria preferida
            </Button>

            {/* Idiomas preferidos button */}
            <Button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700 rounded-full text-sm font-medium border-0"
              onClick={() => setShowLanguagesSection(!showLanguagesSection)}
            >
              + Idiomas preferidos
            </Button>
          </div>
        </div>

        {/* Timezone selector (if expanded) */}
        {showTimezoneSection && (
          <div className="grid grid-cols-2 gap-4">
            {/* Zona horaria preferida */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Zona horaria preferida
              </Label>
              <div className="flex items-center space-x-2">
                <Select 
                  value={data.preferredTimezone} 
                  onValueChange={handleTimezoneSelect}
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
                {data.preferredTimezone && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={removeTimezone}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Horario extendido */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Horario extendido
              </Label>
              <div className="flex items-center space-x-2">
                <Select 
                  value={data.extendedSchedule} 
                  onValueChange={handleExtendedScheduleSelect}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Seleccione horario extendido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Horario estándar</SelectItem>
                    <SelectItem value="extended">Horario extendido</SelectItem>
                    <SelectItem value="flexible">Horario flexible</SelectItem>
                    <SelectItem value="+3-hours">+3 Hours</SelectItem>
                  </SelectContent>
                </Select>
                {data.extendedSchedule && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={removeExtendedSchedule}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Languages selector (if expanded) */}
        {showLanguagesSection && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Idiomas preferidos
            </Label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((language) => (
                <Button
                  key={language}
                  type="button"
                  onClick={() => handleLanguageToggle(language)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                    data.preferredLanguages?.includes(language) 
                      ? "bg-gray-400 text-gray-700 hover:bg-gray-400 hover:text-gray-700" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700"
                  }`}
                >
                  {language}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default OpportunityStep1;