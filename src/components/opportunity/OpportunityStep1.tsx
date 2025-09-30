import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Minus, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { professionalTools, type ProfessionalTool } from '@/lib/tools';
import { getApplicantRestrictionText } from '@/lib/country-nationalities';
import { type Company } from '@/contexts/CompanyContext';
import { 
  categoryTemplates, 
  contractTypes, 
  locationTypes, 
  experienceLevelOptions
} from '@/lib/opportunityTemplates';
import { OpportunityTemplates, JobTemplate, JOB_TEMPLATES } from '@/components/OpportunityTemplates';

interface OpportunityStep1Data {
  category: string;
  title: string;
  description: string;
  contractType: string;
  skills: string[];
  tools: string[];
  experienceLevels: string[];
  locationType: string;
  location: string;
  contractorsCount: number;
  usOnlyApplicants: boolean;
  preferredTimezone: string;
  preferredLanguages: string[];
  deadlineDate: Date | null;
}

interface OpportunityStep1Props {
  data: OpportunityStep1Data;
  onChange: (data: Partial<OpportunityStep1Data>) => void;
  company?: Company | null;
}

// Skills now handled dynamically based on category templates and user input
/* Old skills array - no longer used
const oldSkillsOptions = [
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
]; // This array is no longer used, replaced by dynamic category-based suggestions
*/

// Tools now handled dynamically based on category templates and user input
/* Old tools array - no longer used
const toolsOptions = professionalTools
  .map((tool: ProfessionalTool) => tool.name)
  .sort((a: string, b: string) => a.localeCompare(b));
*/

const timezoneOptions = [
  'UTC-8 (PST) - Estados Unidos (Costa Oeste)',
  'UTC-7 (MST) - Estados Unidos (Montaña)',
  'UTC-6 (CST) - Estados Unidos (Centro)',
  'UTC-5 (EST) - Estados Unidos (Costa Este), Colombia',
  'UTC-4 (AST) - Venezuela, Chile',
  'UTC-3 (ART) - Argentina, Brasil, Uruguay',
  'UTC+0 (GMT) - Reino Unido, Portugal',
  'UTC+1 (CET) - España, Francia, Alemania, Italia',
  'UTC+2 (EET) - Grecia, Turquía, Sudáfrica',
  'UTC+3 (MSK) - Rusia (Moscú), Arabia Saudí',
  'UTC+5:30 (IST) - India',
  'UTC+7 (ICT) - Tailandia, Vietnam',
  'UTC+8 (CST) - China, Singapur, Filipinas',
  'UTC+9 (JST) - Japón, Corea del Sur',
  'UTC+10 (AEST) - Australia (Este)',
  'UTC+12 (NZST) - Nueva Zelanda'
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
  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [toolInput, setToolInput] = useState('');
  const [showToolSuggestions, setShowToolSuggestions] = useState(false);

  const getToolIcon = (toolName: string): string => {
    // First try exact match
    let toolData = professionalTools.find((tool: ProfessionalTool) => 
      tool.name.toLowerCase() === toolName.toLowerCase()
    );
    
    // If no exact match, try partial match
    if (!toolData) {
      toolData = professionalTools.find((tool: ProfessionalTool) => 
        tool.name.toLowerCase().includes(toolName.toLowerCase()) ||
        toolName.toLowerCase().includes(tool.name.toLowerCase())
      );
    }
    
    // If still no match, check for common variations
    if (!toolData) {
      const commonIcons: Record<string, string> = {
        'hubspot': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg',
        'salesforce': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg',
        'pipedrive': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pipedrive.svg',
        'zoom': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zoom.svg',
        'gohighlevel': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gear.svg',
        'linkedin': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg',
        'outreach': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg',
        'calendly': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/calendly.svg',
        'google ads': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleads.svg',
        'facebook ads': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg',
        'google analytics': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleanalytics.svg',
        'semrush': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/semrush.svg',
        'hootsuite': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hootsuite.svg',
        'mixpanel': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mixpanel.svg',
        'amplitude': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amplitude.svg',
        'optimizely': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/optimizely.svg',
        'klaviyo': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg',
        'visual studio code': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/visualstudiocode.svg',
        'git': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/git.svg',
        'docker': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docker.svg',
        'postgresql': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/postgresql.svg',
        'figma': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg',
        'selenium': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/selenium.svg',
        'jira': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg',
        'postman': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/postman.svg',
        'cypress': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cypress.svg',
        'intercom': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/intercom.svg',
        'zendesk': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zendesk.svg',
        'slack': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg',
        'freshdesk': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/freshworks.svg',
        'teamviewer': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/teamviewer.svg',
        'confluence': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/confluence.svg',
        'livechat': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/livechat.svg',
        'crisp': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/crisp.svg',
        'drift': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/drift.svg',
        'asana': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/asana.svg',
        'trello': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg',
        'microsoft project': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftoffice.svg',
        'microsoft excel': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftexcel.svg',
        'power bi': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/powerbi.svg',
        'tableau': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tableau.svg',
        'visio': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftvisio.svg',
        'lucidchart': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/lucidchart.svg',
        'sap': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sap.svg',
        'oracle': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/oracle.svg',
        'adobe photoshop': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobephotoshop.svg',
        'adobe illustrator': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeillustrator.svg',
        'adobe indesign': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeindesign.svg',
        'canva': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/canva.svg',
        'grammarly': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/grammarly.svg',
        'wordpress': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wordpress.svg',
        'notion': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg',
        'adobe premiere pro': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobepremierepro.svg',
        'after effects': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeaftereffects.svg',
        'davinci resolve': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/davinciresolve.svg',
        'final cut pro': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg',
        'adobe audition': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeaudition.svg',
        'sketch': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sketch.svg',
        'adobe xd': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobexd.svg',
        'invision': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/invision.svg',
        'miro': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/miro.svg',
        'microsoft office': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftoffice.svg',
        'google workspace': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleworkspace.svg',
        'quickbooks': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/quickbooks.svg',
        'sage': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sage.svg',
        'xero': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/xero.svg',
        'lexisnexis': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/lexisnexis.svg',
        'microsoft word': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftword.svg',
        'docusign': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docusign.svg',
        'adobe acrobat': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeacrobatreader.svg',
        'bamboohr': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/bamboo.svg',
        'workday': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/workday.svg',
        'linkedin recruiter': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg',
        'indeed': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/indeed.svg',
        'cold email tools': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mail.svg',
        'linkedin sales navigator': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg',
        'hemingway editor': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/markdown.svg',
        'google docs': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googledocs.svg',
        'jira service desk': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg',
        'zendesk chat': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zendesk.svg',
        'wms': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shopify.svg',
        'edi': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/exchangerate.svg',
        'ats systems': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/greenhouse.svg',
        'legal databases': 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/databricks.svg'
      };
      
      const iconKey = toolName.toLowerCase();
      if (commonIcons[iconKey]) {
        return commonIcons[iconKey];
      }
      
      // Check for partial matches in common icons
      for (const [key, icon] of Object.entries(commonIcons)) {
        if (iconKey.includes(key) || key.includes(iconKey)) {
          return icon;
        }
      }
    }
    
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

  const removeTimezone = () => {
    onChange({ preferredTimezone: '' });
  };

  // handleSkillToggle removed - now using addSkill function with dynamic input
  // handleToolToggle removed - now using addTool function with dynamic input

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = data.skills || [];
    onChange({ skills: currentSkills.filter(skill => skill !== skillToRemove) });
  };

  const addSkill = () => {
    if (skillInput.trim() && (data.skills?.length || 0) < 10) {
      const currentSkills = data.skills || [];
      if (!currentSkills.includes(skillInput.trim())) {
        onChange({ skills: [...currentSkills, skillInput.trim()] });
      }
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const getSuggestedSkills = () => {
    if (!data.category) return [];
    const template = categoryTemplates[data.category];
    return template?.skills || [];
  };

  const getFilteredSuggestions = () => {
    const suggested = getSuggestedSkills();
    const currentSkills = data.skills || [];
    return suggested.filter(skill => 
      !currentSkills.includes(skill) && 
      skill.toLowerCase().includes(skillInput.toLowerCase())
    ).slice(0, 8);
  };

  // Tool functions
  const addTool = () => {
    if (toolInput.trim() && (data.tools?.length || 0) < 10) {
    const currentTools = data.tools || [];
      if (!currentTools.includes(toolInput.trim())) {
        onChange({ tools: [...currentTools, toolInput.trim()] });
      }
      setToolInput('');
      setShowToolSuggestions(false);
    }
  };

  const handleToolInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTool();
    }
  };

  const getSuggestedTools = () => {
    if (!data.category) return [];
    // Get tools from job templates for this category
    const templates = JOB_TEMPLATES[data.category] || [];
    const allTools = templates.flatMap(template => template.tools || []);
    // Remove duplicates
    return [...new Set(allTools)];
  };

  const getFilteredToolSuggestions = () => {
    const suggested = getSuggestedTools();
    const currentTools = data.tools || [];
    return suggested.filter(tool => 
      !currentTools.includes(tool) && 
      tool.toLowerCase().includes(toolInput.toLowerCase())
    ).slice(0, 8);
  };

  const removeTool = (toolToRemove: string) => {
    const currentTools = data.tools || [];
    onChange({ tools: currentTools.filter(tool => tool !== toolToRemove) });
  };

  const handleTemplateSelect = (template: JobTemplate) => {
    onChange({
      title: template.title,
      description: template.description,
      skills: template.skills,
      tools: template.tools,
    });
  };

  const handleCategoryChange = (category: string) => {
    onChange({ category });
    
    // Aplicar plantilla automáticamente si existe
    const template = categoryTemplates[category];
    if (template) {
      onChange({
        category: category,
        skills: template.defaultSkills,
        experienceLevels: template.experienceLevels.slice(0, 2),
      });
    }
  };

  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    const currentLevels = data.experienceLevels || [];
    if (checked) {
      onChange({ experienceLevels: [...currentLevels, level] });
    } else {
      onChange({ experienceLevels: currentLevels.filter(l => l !== level) });
    }
  };

  const categories = Object.keys(categoryTemplates);

  return (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Categoría *
        </Label>
        <Select value={data.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Templates */}
      {data.category && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Plantillas disponibles
          </Label>
          <OpportunityTemplates 
            category={data.category}
            onSelectTemplate={handleTemplateSelect}
          />
        </div>
      )}

      {/* Contract Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Tipo de contrato *
        </Label>
        <Select value={data.contractType} onValueChange={(value) => onChange({ contractType: value })}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecciona tipo de contrato" />
          </SelectTrigger>
          <SelectContent>
            {contractTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Professional Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-900">
          Título profesional *
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
          
          {/* Input to add skills */}
          <div className="relative">
            <div className="flex gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setShowSkillSuggestions(e.target.value.length > 0);
                }}
                onKeyPress={handleSkillInputKeyPress}
                onFocus={() => setShowSkillSuggestions(skillInput.length > 0)}
                onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 150)}
                placeholder="Agregar habilidad (ej: JavaScript, Excel, Comunicación...)"
                className="h-12"
                disabled={(data.skills?.length || 0) >= 10}
              />
              <Button
                type="button"
                onClick={addSkill}
                disabled={!skillInput.trim() || (data.skills?.length || 0) >= 10}
                className="h-12 px-4"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggestions dropdown */}
            {showSkillSuggestions && getFilteredSuggestions().length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-600">Sugerencias para {data.category}</p>
                </div>
                {getFilteredSuggestions().map((skill) => (
                  <button
                    key={skill} 
                    type="button"
                    onClick={() => {
                      setSkillInput(skill);
                      addSkill();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-b-0"
                  >
                    {skill}
                  </button>
                ))}
              </div>
                      )}
                    </div>

          {/* Suggested skills as clickable chips */}
          {data.category && getSuggestedSkills().length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Habilidades sugeridas para {data.category}:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedSkills().slice(0, 6).map((skill) => {
                  const isAlreadyAdded = data.skills?.includes(skill);
                  const canAdd = (data.skills?.length || 0) < 10;
                  
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (!isAlreadyAdded && canAdd) {
                          const currentSkills = data.skills || [];
                          onChange({ skills: [...currentSkills, skill] });
                        }
                      }}
                      disabled={isAlreadyAdded || !canAdd}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        isAlreadyAdded 
                          ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed' 
                          : canAdd
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer'
                          : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {skill} {isAlreadyAdded && '✓'}
                    </button>
                );
              })}
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 text-right">
          {data.skills?.length || 0} / 10 {(data.skills?.length || 0) >= 10 && '(máximo alcanzado)'}
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
          
          {/* Input to add tools */}
          <div className="relative">
            <div className="flex gap-2 mb-2">
              <Input
                value={toolInput}
                onChange={(e) => {
                  setToolInput(e.target.value);
                  setShowToolSuggestions(e.target.value.length > 0);
                }}
                onKeyPress={handleToolInputKeyPress}
                onFocus={() => setShowToolSuggestions(toolInput.length > 0)}
                onBlur={() => setTimeout(() => setShowToolSuggestions(false), 150)}
                placeholder="Agregar herramienta (ej: Figma, Excel, Photoshop...)"
                className="h-12"
                disabled={(data.tools?.length || 0) >= 10}
              />
              <Button
                type="button"
                onClick={addTool}
                disabled={!toolInput.trim() || (data.tools?.length || 0) >= 10}
                className="h-12 px-4"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggestions dropdown */}
            {showToolSuggestions && getFilteredToolSuggestions().length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-600">Sugerencias para {data.category}</p>
                </div>
                {getFilteredToolSuggestions().map((tool) => (
                  <button
                    key={tool} 
                    type="button"
                    onClick={() => {
                      setToolInput(tool);
                      addTool();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-b-0 flex items-center gap-2"
                  >
                        <img 
                          src={getToolIcon(tool)} 
                          alt={tool} 
                          className="w-4 h-4" 
                          style={{ filter: 'invert(0.2)' }}
                        />
                    {tool}
                  </button>
                ))}
                      </div>
                      )}
                    </div>

          {/* Suggested tools as clickable chips */}
          {data.category && getSuggestedTools().length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Herramientas sugeridas para {data.category}:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedTools().slice(0, 6).map((tool) => {
                  const isAlreadyAdded = data.tools?.includes(tool);
                  const canAdd = (data.tools?.length || 0) < 10;
                  
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => {
                        if (!isAlreadyAdded && canAdd) {
                          const currentTools = data.tools || [];
                          onChange({ tools: [...currentTools, tool] });
                        }
                      }}
                      disabled={isAlreadyAdded || !canAdd}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-colors ${
                        isAlreadyAdded 
                          ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed' 
                          : canAdd
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer'
                          : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <img 
                        src={getToolIcon(tool)} 
                        alt={tool} 
                        className="w-3 h-3" 
                        style={{ filter: isAlreadyAdded ? 'none' : 'invert(0.3)' }}
                      />
                      {tool} {isAlreadyAdded && '✓'}
                    </button>
                );
              })}
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 text-right">
          {data.tools?.length || 0} / 10 {(data.tools?.length || 0) >= 10 && '(máximo alcanzado)'}
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
              onCheckedChange={(checked) => {
                const isChecked = !!checked;
                onChange({ 
                  usOnlyApplicants: isChecked,
                  // Si se activa la restricción de país, solo desactivar zona horaria
                  ...(isChecked && { 
                    preferredTimezone: undefined
                  })
                });
                // También cerrar la sección de zona horaria si estaba abierta
                if (isChecked && showTimezoneSection) {
                  setShowTimezoneSection(false);
                }
              }}
            />
            <Label htmlFor="usOnly" className="text-sm font-medium text-gray-900">
              {getApplicantRestrictionText(company?.location)}
            </Label>
          </div>
        </div>

        {/* Preferences buttons */}
        <div className="flex flex-col space-y-3">
          {/* Zona horaria preferida button */}
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium border-0 ${
                data.usOnlyApplicants 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700"
              }`}
              onClick={() => !data.usOnlyApplicants && setShowTimezoneSection(!showTimezoneSection)}
              disabled={data.usOnlyApplicants}
            >
              + Zona horaria preferida
            </Button>
            
            {/* Timezone selector (if expanded) - Horizontal layout */}
            {showTimezoneSection && (
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  Zona horaria:
                </Label>
                <Select 
                  value={data.preferredTimezone} 
                  onValueChange={handleTimezoneSelect}
                >
                  <SelectTrigger className="h-8 w-48">
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
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Idiomas preferidos button */}
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700 rounded-full text-sm font-medium border-0"
              onClick={() => setShowLanguagesSection(!showLanguagesSection)}
            >
              + Idiomas preferidos
            </Button>
            
            {/* Languages selector (if expanded) - Horizontal layout */}
            {showLanguagesSection && (
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  Idiomas:
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

      </div>

      {/* Experience Levels */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Nivel de experiencia (puede seleccionar múltiples)
        </Label>
        <div className="space-y-2">
          {experienceLevelOptions.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={level.value}
                checked={data.experienceLevels?.includes(level.value) || false}
                onCheckedChange={(checked) => handleExperienceLevelChange(level.value, checked as boolean)}
              />
              <Label htmlFor={level.value} className="text-sm">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Work Modality */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Modalidad de trabajo *
        </Label>
        <Select value={data.locationType} onValueChange={(value) => onChange({ locationType: value })}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecciona modalidad" />
          </SelectTrigger>
          <SelectContent>
            {locationTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      {data.locationType !== 'remote' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Ubicación específica
          </Label>
          <Input
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Ej: Buenos Aires, Argentina"
            className="h-12"
          />
        </div>
      )}

      {/* Deadline Date */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Fecha límite (opcional)
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.deadlineDate ? format(data.deadlineDate, 'PPP') : 'Seleccionar fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data.deadlineDate || undefined}
              onSelect={(date) => onChange({ deadlineDate: date })}
              disabled={(date) => date < new Date() || date > new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="text-xs text-gray-500">
          Máximo 6 meses en adelante
        </div>
      </div>

    </div>
  );
};

export default OpportunityStep1;