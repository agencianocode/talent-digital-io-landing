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
  skills: string[];
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

  const handleSkillToggle = (skill: string) => {
    const currentSkills = data.skills || [];
    const isSelected = currentSkills.includes(skill);
    
    if (isSelected) {
      onChange({ skills: currentSkills.filter(s => s !== skill) });
    } else if (currentSkills.length < 3) {
      onChange({ skills: [...currentSkills, skill] });
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
        <div className="p-3 border border-gray-300 rounded-lg min-h-[120px] max-h-[200px] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {skillsOptions.map((skill) => (
              <Button
                key={skill}
                type="button"
                variant={data.skills?.includes(skill) ? "default" : "outline"}
                size="sm"
                onClick={() => handleSkillToggle(skill)}
                disabled={!data.skills?.includes(skill) && (data.skills?.length || 0) >= 3}
                className="text-xs h-8"
              >
                {skill}
              </Button>
            ))}
          </div>
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