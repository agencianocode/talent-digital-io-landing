// src/lib/opportunityTemplates.ts

export interface CategoryTemplate {
  skills: string[];
  experienceLevels: string[];
  defaultSkills: string[];
  suggestedRequirements: string[];
  commonLocations: string[];
}

export const categoryTemplates: Record<string, CategoryTemplate> = {
  'Ventas': {
    skills: [
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
    experienceLevels: ['Intermedio', 'Avanzado', 'Experto'],
    defaultSkills: ['Ventas Consultivas', 'CRM', 'Llamadas en frío'],
    suggestedRequirements: [
      'Experiencia mínima en ventas B2B o B2C',
      'Dominio de herramientas CRM',
      'Excelentes habilidades de comunicación',
      'Orientación a resultados'
    ],
    commonLocations: ['Remoto', 'Híbrido', 'Presencial']
  },
  
  'Marketing': {
    skills: [
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
    experienceLevels: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
    defaultSkills: ['Google Ads', 'Facebook Ads', 'Email Marketing'],
    suggestedRequirements: [
      'Conocimiento en plataformas de publicidad digital',
      'Experiencia en análisis de métricas',
      'Creatividad y pensamiento estratégico',
      'Dominio de herramientas de marketing digital'
    ],
    commonLocations: ['Remoto', 'Híbrido']
  },
  
  'Atención al cliente': {
    skills: [
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
    experienceLevels: ['Principiante', 'Intermedio'],
    defaultSkills: ['Comunicación efectiva', 'Resolución de conflictos', 'CRM'],
    suggestedRequirements: [
      'Excelentes habilidades de comunicación',
      'Paciencia y empatía',
      'Conocimiento en herramientas de soporte',
      'Orientación al servicio al cliente'
    ],
    commonLocations: ['Remoto', 'Presencial']
  },
  
  'Operaciones': {
    skills: [
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
    experienceLevels: ['Principiante', 'Intermedio', 'Avanzado'],
    defaultSkills: ['Gestión de procesos', 'Análisis de datos', 'Excel Avanzado'],
    suggestedRequirements: [
      'Habilidades organizativas excepcionales',
      'Conocimiento en herramientas de productividad',
      'Capacidad de análisis y resolución de problemas',
      'Experiencia en gestión de proyectos'
    ],
    commonLocations: ['Remoto', 'Híbrido']
  },
  
  'Creativo': {
    skills: [
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
    experienceLevels: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
    defaultSkills: ['Adobe Creative Suite', 'Figma', 'Diseño Gráfico'],
    suggestedRequirements: [
      'Portfolio sólido de trabajos creativos',
      'Dominio de herramientas de diseño',
      'Creatividad e innovación',
      'Comprensión de principios de diseño'
    ],
    commonLocations: ['Remoto', 'Híbrido']
  },
  
  'Tecnología y Automatizaciones': {
    skills: [
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
    experienceLevels: ['Intermedio', 'Avanzado', 'Experto'],
    defaultSkills: ['JavaScript', 'APIs', 'Automatización de procesos'],
    suggestedRequirements: [
      'Experiencia en desarrollo de software',
      'Conocimiento en automatización',
      'Dominio de lenguajes de programación',
      'Comprensión de arquitectura de sistemas'
    ],
    commonLocations: ['Remoto', 'Híbrido']
  },
  
  'Soporte Profesional': {
    skills: [
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
    ],
    experienceLevels: ['Principiante', 'Intermedio', 'Avanzado'],
    defaultSkills: ['Gestión administrativa', 'Comunicación empresarial', 'Coordinación'],
    suggestedRequirements: [
      'Excelentes habilidades organizativas',
      'Experiencia en administración',
      'Dominio de herramientas de productividad',
      'Capacidad de trabajo independiente'
    ],
    commonLocations: ['Remoto', 'Híbrido', 'Presencial']
  }
};

export const contractTypes = [
  'Full Time',
  'Part Time',
  'Freelance',
  'Por Comisión',
  'Fijo + Comisión'
];

export const durationUnits = [
  { value: 'days', label: 'Días' },
  { value: 'weeks', label: 'Semanas' },
  { value: 'months', label: 'Meses' }
];

export const locationTypes = [
  { value: 'remote', label: 'Remoto' },
  { value: 'onsite', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' }
];

export const paymentTypes = [
  { value: 'fixed', label: 'Fijo' },
  { value: 'commission', label: 'Por Comisión' },
  { value: 'fixed_commission', label: 'Fijo + Comisión' }
];

export const salaryPeriods = [
  { value: 'hourly', label: 'Por hora' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' }
];

export const experienceLevelOptions = [
  { value: 'principiante', label: 'Principiante: 0-1 año' },
  { value: 'intermedio', label: 'Intermedio: 1-3 años' },
  { value: 'avanzado', label: 'Avanzado: 3-6 años' },
  { value: 'experto', label: 'Experto: +6 años' }
];

export const timezones = [
  'UTC-12:00 - Baker Island',
  'UTC-11:00 - Hawaii-Aleutian',
  'UTC-10:00 - Hawaii',
  'UTC-09:00 - Alaska',
  'UTC-08:00 - Pacific (Los Angeles)',
  'UTC-07:00 - Mountain (Denver)',
  'UTC-06:00 - Central (Chicago)',
  'UTC-05:00 - Eastern (New York)',
  'UTC-04:00 - Atlantic',
  'UTC-03:00 - Argentina',
  'UTC-02:00 - South Georgia',
  'UTC-01:00 - Azores',
  'UTC+00:00 - Londres (GMT)',
  'UTC+01:00 - Central European (Madrid)',
  'UTC+02:00 - Eastern European',
  'UTC+03:00 - Moscow',
  'UTC+04:00 - Gulf',
  'UTC+05:00 - Pakistan',
  'UTC+05:30 - India',
  'UTC+06:00 - Bangladesh',
  'UTC+07:00 - Indonesia',
  'UTC+08:00 - China/Singapore',
  'UTC+09:00 - Japan',
  'UTC+10:00 - Australia East',
  'UTC+11:00 - Solomon Islands',
  'UTC+12:00 - New Zealand'
];
