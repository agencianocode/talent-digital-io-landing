// Mock data para probar el dashboard sin migración de base de datos
export const mockOpportunityData = {
  // Simulamos oportunidades con los nuevos campos
  opportunities: [
    {
      id: '1',
      title: 'Developer Full Stack React/Node.js',
      category: 'Tecnología',
      status: 'active',
      location: 'Madrid, España',
      location_type: 'hybrid',
      salary_min: 3500,
      salary_max: 4500,
      salary_period: 'monthly',
      payment_type: 'fixed',
      description: 'Buscamos un desarrollador full stack con experiencia en React y Node.js para unirse a nuestro equipo dinámico.',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express'],
      experience_levels: ['Senior'],
      deadline_date: '2025-03-15',
      is_academy_exclusive: false,
      created_at: '2025-01-15T10:00:00Z',
      company_id: 'company-1'
    },
    {
      id: '2', 
      title: 'Especialista en Marketing Digital',
      category: 'Marketing',
      status: 'active',
      location: 'Buenos Aires, Argentina',
      location_type: 'remote',
      salary_min: 2000,
      salary_max: 3000,
      salary_period: 'monthly',
      payment_type: 'mixed',
      commission_percentage: 15,
      description: 'Únete a nuestro equipo como especialista en marketing digital. Experiencia en SEO, SEM y redes sociales.',
      skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Analytics', 'Content Marketing'],
      experience_levels: ['Mid-level', 'Senior'],
      deadline_date: '2025-02-28',
      is_academy_exclusive: true,
      created_at: '2025-01-20T14:30:00Z',
      company_id: 'company-1'
    },
    {
      id: '3',
      title: 'Diseñador UX/UI',
      category: 'Diseño',
      status: 'draft',
      location: 'México City, México',
      location_type: 'onsite',
      salary_min: 1800,
      salary_max: 2500,
      salary_period: 'monthly',
      payment_type: 'fixed',
      description: 'Buscamos un diseñador UX/UI creativo para trabajar en proyectos innovadores.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
      experience_levels: ['Junior', 'Mid-level'],
      deadline_date: null,
      is_academy_exclusive: false,
      created_at: '2025-01-22T09:15:00Z',
      company_id: 'company-1'
    },
    {
      id: '4',
      title: 'Consultor de Ventas B2B',
      category: 'Comercial',
      status: 'paused',
      location: 'Lima, Perú',
      location_type: 'hybrid',
      salary_min: null,
      salary_max: null,
      salary_period: 'monthly',
      payment_type: 'commission',
      commission_percentage: 25,
      description: 'Oportunidad de trabajar como consultor de ventas B2B con comisiones atractivas.',
      skills: ['Ventas B2B', 'CRM', 'Negociación', 'Prospección', 'Salesforce'],
      experience_levels: ['Mid-level', 'Senior'],
      deadline_date: '2025-04-01',
      is_academy_exclusive: false,
      created_at: '2025-01-18T16:45:00Z',
      company_id: 'company-1'
    },
    {
      id: '5',
      title: 'Content Manager',
      category: 'Marketing',
      status: 'active',
      location: 'Santiago, Chile',
      location_type: 'remote',
      salary_min: 1500,
      salary_max: 2200,
      salary_period: 'monthly',
      payment_type: 'fixed',
      description: 'Gestionarás la estrategia de contenidos en múltiples plataformas digitales.',
      skills: ['Content Strategy', 'Copywriting', 'Social Media', 'SEO', 'WordPress'],
      experience_levels: ['Junior', 'Mid-level'],
      deadline_date: '2025-03-01',
      is_academy_exclusive: true,
      created_at: '2025-01-25T11:20:00Z',
      company_id: 'company-1'
    }
  ],

  // Simulamos aplicaciones para métricas
  applications: {
    '1': 12, // Developer tiene 12 aplicaciones
    '2': 8,  // Marketing tiene 8 aplicaciones  
    '3': 3,  // Diseñador tiene 3 aplicaciones
    '4': 5,  // Ventas tiene 5 aplicaciones
    '5': 15  // Content Manager tiene 15 aplicaciones
  } as Record<string, number>,

  // Datos de métricas simuladas
  metrics: {
    activeOpportunities: 3,
    totalApplications: 43,
    unreadApplications: 18,
    candidatesInEvaluation: 12,
    averageResponseTime: 2.1,
    contactedCandidates: 13,
    thisWeekApplications: 9,
    conversionRate: 30.2
  }
};

// Función para simular delay de API
export const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Función para obtener oportunidades mockeadas
export const getMockOpportunities = async () => {
  await simulateApiDelay();
  return mockOpportunityData.opportunities;
};

// Función para obtener métricas mockeadas
export const getMockMetrics = async () => {
  await simulateApiDelay(300);
  return mockOpportunityData.metrics;
};

// Función para obtener aplicaciones mockeadas
export const getMockApplications = async (opportunityId: string) => {
  await simulateApiDelay(200);
  return mockOpportunityData.applications[opportunityId] || 0;
};
