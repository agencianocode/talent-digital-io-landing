// Mock data para talentos disponibles en la plataforma
export interface MockTalent {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  title: string;
  experience_level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  location: string;
  country: string;
  category: string;
  secondary_category?: string;
  skills: string[];
  bio: string;
  profile_image?: string;
  cover_image?: string;
  
  // Availability & Preferences
  availability: 'Inmediata' | '2 semanas' | '1 mes' | '2-3 meses' | 'No disponible';
  remote_preference: 'Solo remoto' | 'Solo presencial' | 'Híbrido' | 'Indiferente';
  salary_expectation_min?: number;
  salary_expectation_max?: number;
  salary_currency: 'USD' | 'EUR' | 'MXN' | 'ARS' | 'COP' | 'CLP' | 'PEN';
  
  // Portfolio & Media
  has_video: boolean;
  has_portfolio: boolean;
  portfolio_pieces: number;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  behance_url?: string;
  
  // Platform Activity
  is_featured: boolean;
  is_premium: boolean;
  is_verified: boolean;
  rating: number; // 0-5 estrellas basado en reviews
  reviews_count: number;
  response_rate: number; // 0-100%
  last_active: string;
  joined_date: string;
  
  // Professional Info
  years_experience: number;
  languages: string[];
  certifications: string[];
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  
  // Services & Pricing (para freelancers)
  services?: {
    title: string;
    description: string;
    price_from: number;
    delivery_time: string;
  }[];
}

export const mockTalentData: MockTalent[] = [
  {
    id: 'talent-101',
    full_name: 'María Elena Rodríguez',
    email: 'maria.rodriguez@email.com',
    phone: '+34 612 345 678',
    title: 'Senior React Developer & Team Lead',
    experience_level: 'Experto',
    location: 'Barcelona, España',
    country: 'España',
    category: 'Tecnología',
    secondary_category: 'Frontend Development',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker', 'Team Leadership', 'Mentoring'],
    bio: 'Senior developer con 8+ años liderando equipos de frontend. Especializada en arquitecturas escalables con React y TypeScript. Passionate about clean code y metodologías ágiles.',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b898?w=200&h=200&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=200&fit=crop',
    
    availability: 'Inmediata',
    remote_preference: 'Híbrido',
    salary_expectation_min: 4500,
    salary_expectation_max: 6000,
    salary_currency: 'EUR',
    
    has_video: true,
    has_portfolio: true,
    portfolio_pieces: 12,
    linkedin_url: 'https://linkedin.com/in/mariaelena-rodriguez',
    portfolio_url: 'https://mariaelena.dev',
    github_url: 'https://github.com/maria-elena-dev',
    
    is_featured: true,
    is_premium: true,
    is_verified: true,
    rating: 4.9,
    reviews_count: 23,
    response_rate: 98,
    last_active: '2025-01-28T15:30:00Z',
    joined_date: '2023-03-15T10:00:00Z',
    
    years_experience: 8,
    languages: ['Español', 'Inglés', 'Catalán'],
    certifications: ['AWS Solutions Architect', 'Scrum Master', 'React Advanced'],
    education: [
      {
        degree: 'Ingeniería en Informática',
        institution: 'Universidad Politécnica de Catalunya',
        year: 2016
      }
    ],
    
    services: [
      {
        title: 'Consultoría Frontend React',
        description: 'Auditoría y optimización de aplicaciones React existentes',
        price_from: 150,
        delivery_time: '1-2 semanas'
      },
      {
        title: 'Desarrollo MVP React',
        description: 'Desarrollo completo de MVP con React, TypeScript y backend',
        price_from: 3500,
        delivery_time: '4-6 semanas'
      }
    ]
  },
  
  {
    id: 'talent-102',
    full_name: 'Carlos Alberto Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+52 55 1234 5678',
    title: 'Digital Marketing Strategist',
    experience_level: 'Avanzado',
    location: 'Ciudad de México, México',
    country: 'México',
    category: 'Marketing',
    secondary_category: 'Performance Marketing',
    skills: ['Google Ads', 'Facebook Ads', 'SEO', 'Analytics', 'Conversion Optimization', 'Email Marketing', 'Content Strategy'],
    bio: 'Especialista en marketing digital con 6 años optimizando campañas que generan ROI real. Expert en growth hacking y user acquisition para startups y SMEs.',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=200&fit=crop',
    
    availability: '2 semanas',
    remote_preference: 'Solo remoto',
    salary_expectation_min: 2800,
    salary_expectation_max: 4200,
    salary_currency: 'USD',
    
    has_video: true,
    has_portfolio: false,
    portfolio_pieces: 0,
    linkedin_url: 'https://linkedin.com/in/carlosalberto-mendoza',
    
    is_featured: true,
    is_premium: false,
    is_verified: true,
    rating: 4.7,
    reviews_count: 18,
    response_rate: 92,
    last_active: '2025-01-28T12:15:00Z',
    joined_date: '2023-07-20T14:30:00Z',
    
    years_experience: 6,
    languages: ['Español', 'Inglés'],
    certifications: ['Google Ads', 'Facebook Blueprint', 'Google Analytics', 'HubSpot Content Marketing'],
    education: [
      {
        degree: 'Licenciatura en Marketing',
        institution: 'ITESM Campus Ciudad de México',
        year: 2019
      }
    ],
    
    services: [
      {
        title: 'Auditoría de Campañas Publicitarias',
        description: 'Análisis completo de Google Ads y Facebook Ads con plan de optimización',
        price_from: 800,
        delivery_time: '1 semana'
      },
      {
        title: 'Setup Completo Google Ads',
        description: 'Configuración y lanzamiento de campañas de Google Ads desde cero',
        price_from: 1200,
        delivery_time: '2 semanas'
      }
    ]
  },
  
  {
    id: 'talent-103',
    full_name: 'Ana Sophia García',
    email: 'ana.garcia@email.com',
    phone: '+57 300 123 4567',
    title: 'UX/UI Designer & Product Designer',
    experience_level: 'Avanzado',
    location: 'Medellín, Colombia',
    country: 'Colombia',
    category: 'Diseño',
    secondary_category: 'Product Design',
    skills: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Principle', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
    bio: 'Product designer con 5 años creando experiencias digitales centradas en el usuario. Especializada en design systems y research para productos fintech y e-commerce.',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=200&fit=crop',
    
    availability: '1 mes',
    remote_preference: 'Híbrido',
    salary_expectation_min: 1800,
    salary_expectation_max: 2800,
    salary_currency: 'USD',
    
    has_video: true,
    has_portfolio: true,
    portfolio_pieces: 24,
    linkedin_url: 'https://linkedin.com/in/anasophia-garcia',
    portfolio_url: 'https://anasophia.design',
    behance_url: 'https://behance.net/anasophiagarcia',
    
    is_featured: true,
    is_premium: true,
    is_verified: true,
    rating: 4.8,
    reviews_count: 31,
    response_rate: 95,
    last_active: '2025-01-28T09:45:00Z',
    joined_date: '2023-01-10T11:20:00Z',
    
    years_experience: 5,
    languages: ['Español', 'Inglés', 'Portugués'],
    certifications: ['Google UX Design', 'Design Thinking IDEO', 'Figma Advanced'],
    education: [
      {
        degree: 'Diseño Gráfico',
        institution: 'Universidad Pontificia Bolivariana',
        year: 2020
      },
      {
        degree: 'UX/UI Specialization',
        institution: 'Coursera - Google',
        year: 2022
      }
    ],
    
    services: [
      {
        title: 'Auditoría UX de App/Web',
        description: 'Análisis completo de usabilidad con recomendaciones de mejora',
        price_from: 600,
        delivery_time: '1 semana'
      },
      {
        title: 'Diseño UI Completo App',
        description: 'Diseño de interfaz completa para app móvil o web con design system',
        price_from: 2500,
        delivery_time: '3-4 semanas'
      }
    ]
  },
  
  {
    id: 'talent-104',
    full_name: 'Diego Alejandro Silva',
    email: 'diego.silva@email.com',
    phone: '+54 11 9876 5432',
    title: 'Sales Development Representative & B2B Closer',
    experience_level: 'Avanzado',
    location: 'Buenos Aires, Argentina',
    country: 'Argentina',
    category: 'Comercial',
    secondary_category: 'Sales Development',
    skills: ['B2B Sales', 'Lead Generation', 'Cold Calling', 'CRM Management', 'Salesforce', 'HubSpot', 'Pipeline Management', 'Negotiation'],
    bio: 'SDR con 4 años especializándome en prospección B2B y closing de deals high-ticket. Track record de incrementar pipeline en 200%+ en startups tecnológicas.',
    profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=200&fit=crop',
    
    availability: 'Inmediata',
    remote_preference: 'Solo remoto',
    salary_expectation_min: 1500,
    salary_expectation_max: 2500,
    salary_currency: 'USD',
    
    has_video: true,
    has_portfolio: false,
    portfolio_pieces: 0,
    linkedin_url: 'https://linkedin.com/in/diegoalejandro-silva',
    
    is_featured: false,
    is_premium: false,
    is_verified: true,
    rating: 4.6,
    reviews_count: 14,
    response_rate: 88,
    last_active: '2025-01-27T16:20:00Z',
    joined_date: '2023-09-05T13:15:00Z',
    
    years_experience: 4,
    languages: ['Español', 'Inglés', 'Portugués'],
    certifications: ['Salesforce Admin', 'HubSpot Sales', 'Google Analytics'],
    education: [
      {
        degree: 'Licenciatura en Administración',
        institution: 'Universidad de Buenos Aires',
        year: 2021
      }
    ],
    
    services: [
      {
        title: 'Setup CRM + Pipeline',
        description: 'Configuración completa de CRM y procesos de ventas',
        price_from: 800,
        delivery_time: '1-2 semanas'
      },
      {
        title: 'Lead Generation Campaign',
        description: 'Campaña de prospección B2B con entrega de leads calificados',
        price_from: 1200,
        delivery_time: '1 mes'
      }
    ]
  },
  
  {
    id: 'talent-105',
    full_name: 'Valentina López Herrera',
    email: 'valentina.lopez@email.com',
    phone: '+56 9 8765 4321',
    title: 'Content Marketing Manager & Copywriter',
    experience_level: 'Intermedio',
    location: 'Santiago, Chile',
    country: 'Chile',
    category: 'Marketing',
    secondary_category: 'Content Marketing',
    skills: ['Copywriting', 'Content Strategy', 'SEO Writing', 'Social Media', 'WordPress', 'Canva', 'Email Marketing', 'Storytelling'],
    bio: 'Content marketer especializada en storytelling que convierte. 3 años creando contenido que educa y vende para startups B2B. Expert en SEO content y email sequences.',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=200&fit=crop',
    
    availability: '2 semanas',
    remote_preference: 'Solo remoto',
    salary_expectation_min: 1200,
    salary_expectation_max: 2000,
    salary_currency: 'USD',
    
    has_video: false,
    has_portfolio: true,
    portfolio_pieces: 18,
    linkedin_url: 'https://linkedin.com/in/valentina-lopez-herrera',
    portfolio_url: 'https://valentinalopez.com',
    
    is_featured: false,
    is_premium: true,
    is_verified: true,
    rating: 4.5,
    reviews_count: 12,
    response_rate: 90,
    last_active: '2025-01-28T11:30:00Z',
    joined_date: '2023-11-12T09:45:00Z',
    
    years_experience: 3,
    languages: ['Español', 'Inglés'],
    certifications: ['HubSpot Content Marketing', 'Google Analytics', 'Copyblogger Certified'],
    education: [
      {
        degree: 'Licenciatura en Comunicación',
        institution: 'Pontificia Universidad Católica de Chile',
        year: 2022
      }
    ],
    
    services: [
      {
        title: 'Blog Post SEO Optimizado',
        description: 'Artículo de blog 1500+ palabras optimizado para SEO',
        price_from: 200,
        delivery_time: '3-5 días'
      },
      {
        title: 'Email Sequence Completa',
        description: 'Secuencia de 5-7 emails para nurturing o onboarding',
        price_from: 500,
        delivery_time: '1 semana'
      }
    ]
  },
  
  {
    id: 'talent-106',
    full_name: 'Roberto Martínez Cruz',
    email: 'roberto.martinez@email.com',
    phone: '+51 987 654 321',
    title: 'Full Stack Developer Python/Django',
    experience_level: 'Intermedio',
    location: 'Lima, Perú',
    country: 'Perú',
    category: 'Tecnología',
    secondary_category: 'Backend Development',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'API Development', 'React', 'Git'],
    bio: 'Full stack developer con 3 años especializándome en Python/Django. Experience building scalable APIs y web apps para fintech y e-commerce.',
    profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    
    availability: '1 mes',
    remote_preference: 'Indiferente',
    salary_expectation_min: 1800,
    salary_expectation_max: 2800,
    salary_currency: 'USD',
    
    has_video: false,
    has_portfolio: true,
    portfolio_pieces: 8,
    linkedin_url: 'https://linkedin.com/in/roberto-martinez-cruz',
    github_url: 'https://github.com/roberto-martinez-dev',
    
    is_featured: false,
    is_premium: false,
    is_verified: false,
    rating: 4.3,
    reviews_count: 8,
    response_rate: 85,
    last_active: '2025-01-26T14:20:00Z',
    joined_date: '2024-02-28T10:30:00Z',
    
    years_experience: 3,
    languages: ['Español', 'Inglés'],
    certifications: ['AWS Cloud Practitioner'],
    education: [
      {
        degree: 'Ingeniería de Sistemas',
        institution: 'Universidad Nacional Mayor de San Marcos',
        year: 2022
      }
    ],
    
    services: [
      {
        title: 'API REST con Django',
        description: 'Desarrollo de API REST completa con Django y PostgreSQL',
        price_from: 1500,
        delivery_time: '2-3 semanas'
      }
    ]
  },
  
  {
    id: 'talent-107',
    full_name: 'Isabella Fernández',
    email: 'isabella.fernandez@email.com',
    phone: '+593 99 123 4567',
    title: 'Customer Success Manager',
    experience_level: 'Intermedio',
    location: 'Quito, Ecuador',
    country: 'Ecuador',
    category: 'Atención al Cliente',
    secondary_category: 'Customer Success',
    skills: ['Customer Success', 'Account Management', 'CRM', 'Data Analysis', 'Zendesk', 'Intercom', 'Customer Onboarding', 'Retention'],
    bio: 'Customer Success Manager con 4 años ayudando a SaaS companies a reducir churn y aumentar lifetime value. Expert en onboarding y customer health scoring.',
    profile_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    
    availability: '2-3 meses',
    remote_preference: 'Solo remoto',
    salary_expectation_min: 1400,
    salary_expectation_max: 2200,
    salary_currency: 'USD',
    
    has_video: true,
    has_portfolio: false,
    portfolio_pieces: 0,
    linkedin_url: 'https://linkedin.com/in/isabella-fernandez-cs',
    
    is_featured: false,
    is_premium: false,
    is_verified: true,
    rating: 4.4,
    reviews_count: 9,
    response_rate: 92,
    last_active: '2025-01-28T08:15:00Z',
    joined_date: '2023-12-03T16:40:00Z',
    
    years_experience: 4,
    languages: ['Español', 'Inglés'],
    certifications: ['Zendesk Admin', 'Customer Success Management'],
    education: [
      {
        degree: 'Administración de Empresas',
        institution: 'Universidad San Francisco de Quito',
        year: 2021
      }
    ]
  },
  
  {
    id: 'talent-108',
    full_name: 'Andrés Felipe Morales',
    email: 'andres.morales@email.com',
    phone: '+57 311 987 6543',
    title: 'Data Analyst & Business Intelligence',
    experience_level: 'Avanzado',
    location: 'Bogotá, Colombia',
    country: 'Colombia',
    category: 'Tecnología',
    secondary_category: 'Data Analysis',
    skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Google Analytics', 'Excel', 'R', 'Statistics', 'Machine Learning'],
    bio: 'Data analyst con 5 años transformando datos en insights accionables. Especializado en BI dashboards y predictive analytics para e-commerce y fintech.',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    
    availability: 'Inmediata',
    remote_preference: 'Híbrido',
    salary_expectation_min: 2200,
    salary_expectation_max: 3500,
    salary_currency: 'USD',
    
    has_video: false,
    has_portfolio: true,
    portfolio_pieces: 15,
    linkedin_url: 'https://linkedin.com/in/andres-felipe-morales',
    github_url: 'https://github.com/andres-data-analyst',
    
    is_featured: true,
    is_premium: false,
    is_verified: true,
    rating: 4.7,
    reviews_count: 16,
    response_rate: 94,
    last_active: '2025-01-28T13:45:00Z',
    joined_date: '2023-05-18T12:20:00Z',
    
    years_experience: 5,
    languages: ['Español', 'Inglés'],
    certifications: ['Tableau Desktop Specialist', 'Google Analytics', 'Microsoft Power BI'],
    education: [
      {
        degree: 'Estadística',
        institution: 'Universidad Nacional de Colombia',
        year: 2020
      },
      {
        degree: 'Data Science Bootcamp',
        institution: 'Platzi',
        year: 2021
      }
    ],
    
    services: [
      {
        title: 'Dashboard BI Personalizado',
        description: 'Creación de dashboard interactivo con Tableau o Power BI',
        price_from: 1200,
        delivery_time: '2 semanas'
      },
      {
        title: 'Análisis de Datos Completo',
        description: 'Análisis estadístico con insights y recomendaciones',
        price_from: 800,
        delivery_time: '1 semana'
      }
    ]
  }
];

// Funciones utilitarias
export const getTalentsByCategory = (category: string): MockTalent[] => {
  return mockTalentData.filter(talent => 
    talent.category.toLowerCase() === category.toLowerCase() ||
    talent.secondary_category?.toLowerCase() === category.toLowerCase()
  );
};

export const getTalentsBySkills = (skills: string[]): MockTalent[] => {
  return mockTalentData.filter(talent =>
    skills.some(skill => 
      talent.skills.some(talentSkill => 
        talentSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  );
};

export const getTalentsByCountry = (country: string): MockTalent[] => {
  return mockTalentData.filter(talent => 
    talent.country.toLowerCase() === country.toLowerCase()
  );
};

export const getTalentsByExperience = (level: string): MockTalent[] => {
  return mockTalentData.filter(talent => 
    talent.experience_level.toLowerCase() === level.toLowerCase()
  );
};

export const getFeaturedTalents = (): MockTalent[] => {
  return mockTalentData.filter(talent => talent.is_featured);
};

export const searchTalents = (query: string): MockTalent[] => {
  const searchTerm = query.toLowerCase();
  return mockTalentData.filter(talent =>
    talent.full_name.toLowerCase().includes(searchTerm) ||
    talent.title.toLowerCase().includes(searchTerm) ||
    talent.bio.toLowerCase().includes(searchTerm) ||
    talent.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
    talent.category.toLowerCase().includes(searchTerm) ||
    talent.secondary_category?.toLowerCase().includes(searchTerm)
  );
};

export const getTalentById = (id: string): MockTalent | undefined => {
  return mockTalentData.find(talent => talent.id === id);
};

export const getTalentStats = () => {
  return {
    total: mockTalentData.length,
    featured: mockTalentData.filter(t => t.is_featured).length,
    verified: mockTalentData.filter(t => t.is_verified).length,
    premium: mockTalentData.filter(t => t.is_premium).length,
    categories: [...new Set(mockTalentData.map(t => t.category))],
    countries: [...new Set(mockTalentData.map(t => t.country))],
    averageRating: mockTalentData.reduce((acc, t) => acc + t.rating, 0) / mockTalentData.length
  };
};
