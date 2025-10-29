export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
}

// Using the same categories as opportunities for consistency
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'ventas', name: 'Ventas', description: 'Closers, SDR, appointment setter, CRM' },
  { id: 'marketing', name: 'Marketing', description: 'Media buyer, content, SEO, SEM, publicidad digital' },
  { id: 'atencion-cliente', name: 'Atención al Cliente', description: 'Customer success, soporte, chat' },
  { id: 'operaciones', name: 'Operaciones', description: 'Asistente operativo, project manager, coordinación' },
  { id: 'creativo', name: 'Creativo', description: 'Diseño gráfico, UX/UI, video, branding' },
  { id: 'tecnologia', name: 'Tecnología y Automatizaciones', description: 'Desarrollo web, automatización, APIs' },
  { id: 'soporte-profesional', name: 'Soporte Profesional', description: 'Asistente virtual, gestión administrativa' }
];

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(category => category.id === id);
};

// Skills by category - aligned with opportunity templates
export const CATEGORY_SKILLS: Record<string, string[]> = {
  'ventas': [
    'Closer de ventas',
    'SDR / Vendedor remoto',
    'Appointment Setter',
    'Triage',
    'Director comercial',
    'Ventas Consultivas',
    'CRM',
    'Llamadas en frío',
    'Negociación',
    'Relaciones con clientes'
  ],
  'marketing': [
    'Media Buyer',
    'Marketing Expert',
    'Content Specialist',
    'Editor de video',
    'SEO',
    'SEM',
    'Google Ads',
    'Facebook Ads',
    'Email Marketing',
    'Analytics',
    'Social Media',
    'Brand Management'
  ],
  'atencion-cliente': [
    'Customer Success',
    'Soporte Técnico',
    'Chat en vivo',
    'Resolución de conflictos',
    'Comunicación efectiva',
    'Gestión de tickets',
    'CRM',
    'Zendesk',
    'Intercom'
  ],
  'operaciones': [
    'Asistente Operativo',
    'Asistente Personal Virtual',
    'Project Manager',
    'Coordinador de proyectos',
    'Gestión de procesos',
    'Análisis de datos',
    'Optimización de procesos',
    'Automatización',
    'Excel Avanzado',
    'Google Workspace'
  ],
  'creativo': [
    'Diseño Gráfico',
    'Diseño UX/UI',
    'Editor de video',
    'Motion Graphics',
    'Branding',
    'Fotografía',
    'Ilustración',
    'Adobe Creative Suite',
    'Figma',
    'Canva',
    'After Effects'
  ],
  'tecnologia': [
    'Desarrollo Web',
    'Automatización de procesos',
    'Zapier',
    'Make.com',
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'APIs',
    'Bases de datos',
    'DevOps',
    'Cloud Computing'
  ],
  'soporte-profesional': [
    'Asistente Virtual',
    'Asistente Ejecutivo',
    'Gestión administrativa',
    'Coordinación de eventos',
    'Investigación',
    'Redacción',
    'Traducción',
    'Contabilidad básica',
    'Gestión de calendarios',
    'Comunicación empresarial'
  ]
};

// Get all unique skills across all categories
export const getAllSkills = (): string[] => {
  const allSkills = Object.values(CATEGORY_SKILLS).flat();
  return Array.from(new Set(allSkills)).sort();
};
